/**
 * Durable WhatsApp inbound queue + worker.
 *
 * Why this exists (Task #17):
 * The webhook used to call `void Promise.all(handleInbound(...))` which is
 * fire-and-forget. Under serverless, after the 200 response the runtime is
 * free to terminate the function — and any in-flight AI / Meta request is
 * silently killed mid-way. The user never gets a reply, and we have no
 * record of what happened.
 *
 * The new flow:
 *   1. webhook -> `enqueueInbound()` writes one row to `whatsapp_jobs`
 *      (idempotent on `wa_message_id`).
 *   2. webhook returns 200 instantly, then `after(() => drainQueue())`
 *      keeps the process alive (when the runtime supports it) to drain
 *      pending jobs.
 *   3. A cron route (`/api/cron/whatsapp-worker`) drains the queue every
 *      minute as a safety net — so even if the webhook process dies before
 *      `after()` runs, the message is processed within ~60s.
 *
 * Concurrency: jobs are claimed with `FOR UPDATE SKIP LOCKED`, so multiple
 * webhook hits / cron ticks can run in parallel without re-running the
 * same job. Stale `processing` rows past `locked_until` are reclaimed.
 *
 * Retries: transient failures bump `attempts`, set a backoff in
 * `scheduled_at`, and flip the row back to `pending`. Permanent failures
 * (attempts >= max_attempts) land in `failed` for manual review.
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { handleInbound } from "./orchestrator";
import { sweepExpiredOffers } from "./offers";
import { sweepStaleDeliveries } from "./delivery";

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 min — generous; AI + send rarely takes that long
const BATCH_SIZE = 5;
const MAX_DRAIN_BATCHES = 10; // safety: never loop forever inside one drain
const BACKOFF_BASE_MS = 5_000; // 5s, 10s, 20s, 40s, 80s, ...

export interface EnqueueInput {
  phone: string;
  text: string;
  waMessageId: string;
}

interface JobRow {
  id: number;
  phone: string;
  text: string;
  wa_message_id: string | null;
  attempts: number;
  max_attempts: number;
}

/**
 * Idempotent enqueue. If the same `wa_message_id` was already enqueued
 * (Meta retry), returns false without inserting.
 */
export async function enqueueInbound(input: EnqueueInput): Promise<boolean> {
  const phone = input.phone.replace(/[^\d]/g, "");
  if (!phone || !input.text) return false;
  if (!input.waMessageId) {
    // No id from Meta — still enqueue, but cannot dedupe.
    await db.execute(sql`
      INSERT INTO whatsapp_jobs(phone, text, wa_message_id)
      VALUES(${phone}, ${input.text}, NULL)
    `);
    return true;
  }
  const rows = (await db.execute(sql`
    INSERT INTO whatsapp_jobs(phone, text, wa_message_id)
    VALUES(${phone}, ${input.text}, ${input.waMessageId})
    ON CONFLICT (wa_message_id) WHERE wa_message_id IS NOT NULL DO NOTHING
    RETURNING id
  `)) as unknown as Array<{ id: number }>;
  return rows.length > 0;
}

/**
 * Atomically claim up to `limit` runnable jobs.
 * Uses a CTE with `FOR UPDATE SKIP LOCKED` — the gold standard for
 * Postgres-backed worker queues. Stale `processing` rows whose
 * `locked_until` has expired are also reclaimed.
 */
async function claimBatch(limit: number): Promise<JobRow[]> {
  const rows = (await db.execute(sql`
    WITH cte AS (
      SELECT id FROM whatsapp_jobs
      WHERE (
        (status = 'pending' AND scheduled_at <= now())
        OR (status = 'processing' AND locked_until IS NOT NULL AND locked_until <= now())
      )
      ORDER BY scheduled_at ASC, id ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE whatsapp_jobs j
    SET status = 'processing',
        attempts = j.attempts + 1,
        locked_until = now() + make_interval(secs => ${LOCK_DURATION_MS / 1000}),
        updated_at = now()
    FROM cte
    WHERE j.id = cte.id
    RETURNING j.id, j.phone, j.text, j.wa_message_id, j.attempts, j.max_attempts
  `)) as unknown as JobRow[];
  return rows;
}

async function markDone(id: number): Promise<void> {
  await db.execute(sql`
    UPDATE whatsapp_jobs
    SET status = 'done',
        completed_at = now(),
        updated_at = now(),
        locked_until = NULL,
        last_error = NULL
    WHERE id = ${id}
  `);
}

async function markRetryOrFail(
  job: JobRow,
  err: unknown,
): Promise<"retry" | "failed"> {
  const errMsg = (err instanceof Error ? err.message : String(err)).slice(0, 2000);
  if (job.attempts >= job.max_attempts) {
    await db.execute(sql`
      UPDATE whatsapp_jobs
      SET status = 'failed',
          last_error = ${errMsg},
          completed_at = now(),
          updated_at = now(),
          locked_until = NULL
      WHERE id = ${job.id}
    `);
    return "failed";
  }
  // Exponential backoff with cap.
  const backoff = Math.min(
    BACKOFF_BASE_MS * Math.pow(2, job.attempts - 1),
    10 * 60 * 1000, // 10 min cap
  );
  await db.execute(sql`
    UPDATE whatsapp_jobs
    SET status = 'pending',
        last_error = ${errMsg},
        scheduled_at = now() + make_interval(secs => ${backoff / 1000}),
        locked_until = NULL,
        updated_at = now()
    WHERE id = ${job.id}
  `);
  return "retry";
}

export interface DrainReport {
  processed: number;
  succeeded: number;
  retried: number;
  failed: number;
  batches: number;
}

/**
 * Pull and process pending jobs until the queue is empty (or the safety
 * cap is reached). Designed to be called from `after()` in the webhook
 * and from the cron safety net.
 */
export async function drainQueue(): Promise<DrainReport> {
  // Advance any offers whose 2-min window expired while the process was down.
  // Fire-and-forget errors so a sweep glitch never blocks message processing.
  await sweepExpiredOffers().catch(() => undefined);
  await sweepStaleDeliveries().catch(() => undefined);

  const report: DrainReport = {
    processed: 0,
    succeeded: 0,
    retried: 0,
    failed: 0,
    batches: 0,
  };
  for (let i = 0; i < MAX_DRAIN_BATCHES; i++) {
    const jobs = await claimBatch(BATCH_SIZE);
    if (!jobs.length) break;
    report.batches++;
    // Process jobs in parallel within a batch — they're independent
    // (different phones in the typical case; same-phone races are rare
    // and resolved by the orchestrator's own idempotency guard).
    await Promise.all(
      jobs.map(async (job) => {
        report.processed++;
        try {
          await handleInbound({
            phone: job.phone,
            text: job.text,
            waMessageId: job.wa_message_id || "",
          });
          await markDone(job.id);
          report.succeeded++;
        } catch (err) {
          console.error("[whatsapp/queue] job failed", { id: job.id, attempt: job.attempts }, err);
          const outcome = await markRetryOrFail(job, err);
          if (outcome === "retry") report.retried++;
          else report.failed++;
        }
      }),
    );
  }
  return report;
}
