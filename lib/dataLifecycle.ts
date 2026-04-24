import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Data lifecycle / retention policies — keeps DB lean and cheap.
 *
 * Rules (defaults; override via env):
 * - conversation_messages.bodyOriginal: pruned after MSG_BODY_DAYS (30) for unflagged messages.
 *     Redacted body kept (small). Flagged messages keep original for audit.
 * - leak_attempts.rawText: pruned after LEAK_RAW_DAYS (60). Redacted text + flags kept.
 * - response_tracking: deleted after TRACK_DAYS (90).
 * - notifications (read): deleted after NOTIF_DAYS (30).
 * - cache_store: deleted when expired_at < now.
 * - conversations: auto-archive after CONV_INACTIVE_DAYS (180) of inactivity.
 * - audit_log: deleted after AUDIT_DAYS (180) (only if table exists).
 */

const num = (k: string, d: number) => Number(process.env[k] || d);

export type CleanupReport = {
  ranAt: string;
  durationMs: number;
  deleted: Record<string, number>;
  pruned: Record<string, number>;
  errors: Record<string, string>;
};

async function safeRun<T>(label: string, fn: () => Promise<T>, errors: Record<string, string>): Promise<T | null> {
  try {
    return await fn();
  } catch (e: any) {
    errors[label] = e?.message || String(e);
    return null;
  }
}

export async function runDataLifecycle(): Promise<CleanupReport> {
  const start = Date.now();
  const deleted: Record<string, number> = {};
  const pruned: Record<string, number> = {};
  const errors: Record<string, string> = {};

  const msgDays = num("MSG_BODY_DAYS", 30);
  const leakDays = num("LEAK_RAW_DAYS", 60);
  const trackDays = num("TRACK_DAYS", 90);
  const notifDays = num("NOTIF_DAYS", 30);
  const convDays = num("CONV_INACTIVE_DAYS", 180);
  const auditDays = num("AUDIT_DAYS", 180);

  // 1. cache_store — delete expired (cheap, do every run)
  await safeRun("cache_store", async () => {
    const r: any = await db.execute(sql`DELETE FROM cache_store WHERE expires_at IS NOT NULL AND expires_at < NOW()`);
    deleted.cache_store = r?.rowCount ?? r?.rowsAffected ?? 0;
  }, errors);

  // 2. conversation_messages — prune original body for old unflagged delivered messages
  await safeRun("conversation_messages_prune", async () => {
    const r: any = await db.execute(sql`
      UPDATE conversation_messages
      SET body_original = NULL
      WHERE body_original IS NOT NULL
        AND has_leak = false
        AND is_blocked = false
        AND created_at < NOW() - (${msgDays}::int || ' days')::interval
    `);
    pruned.conversation_messages_body = r?.rowCount ?? r?.rowsAffected ?? 0;
  }, errors);

  // 3. leak_attempts — null out raw text after retention (keep redacted + metadata)
  await safeRun("leak_attempts_prune", async () => {
    const r: any = await db.execute(sql`
      UPDATE leak_attempts
      SET raw_text = NULL
      WHERE raw_text IS NOT NULL
        AND created_at < NOW() - (${leakDays}::int || ' days')::interval
    `);
    pruned.leak_attempts_raw = r?.rowCount ?? r?.rowsAffected ?? 0;
  }, errors);

  // 4. response_tracking — delete old records
  await safeRun("response_tracking", async () => {
    const r: any = await db.execute(sql`
      DELETE FROM response_tracking
      WHERE created_at < NOW() - (${trackDays}::int || ' days')::interval
    `);
    deleted.response_tracking = r?.rowCount ?? r?.rowsAffected ?? 0;
  }, errors);

  // 5. notifications — delete old read ones
  await safeRun("notifications", async () => {
    const r: any = await db.execute(sql`
      DELETE FROM notifications
      WHERE is_read = true
        AND created_at < NOW() - (${notifDays}::int || ' days')::interval
    `);
    deleted.notifications = r?.rowCount ?? r?.rowsAffected ?? 0;
  }, errors);

  // 6. conversations — auto-archive long-inactive
  await safeRun("conversations_archive", async () => {
    const r: any = await db.execute(sql`
      UPDATE conversations
      SET status = 'archived', updated_at = NOW()
      WHERE status = 'active'
        AND last_message_at IS NOT NULL
        AND last_message_at < NOW() - (${convDays}::int || ' days')::interval
    `);
    pruned.conversations_archived = r?.rowCount ?? r?.rowsAffected ?? 0;
  }, errors);

  // 7. audit_log (optional table)
  await safeRun("audit_log", async () => {
    const r: any = await db.execute(sql`
      DELETE FROM audit_log
      WHERE created_at < NOW() - (${auditDays}::int || ' days')::interval
    `);
    deleted.audit_log = r?.rowCount ?? r?.rowsAffected ?? 0;
  }, errors);

  return {
    ranAt: new Date().toISOString(),
    durationMs: Date.now() - start,
    deleted,
    pruned,
    errors,
  };
}

/**
 * Throttle wrapper: ensures cleanup runs at most once per `intervalMs` (default 1h)
 * using a Postgres advisory lock + cache_store stamp.
 */
export async function maybeRunLifecycle(intervalMs = 60 * 60 * 1000): Promise<CleanupReport | null> {
  const KEY = "lifecycle:last_run";
  // Try advisory lock so two requests don't collide
  const lock: any = await db.execute(sql`SELECT pg_try_advisory_lock(7427001) AS got`).catch(() => null);
  const got = lock?.rows?.[0]?.got ?? lock?.[0]?.got;
  if (!got) return null;
  try {
    const last: any = await db.execute(sql`SELECT value FROM cache_store WHERE key = ${KEY} LIMIT 1`).catch(() => null);
    const lastTs = Number(last?.rows?.[0]?.value?.ts ?? last?.[0]?.value?.ts ?? 0);
    if (Date.now() - lastTs < intervalMs) return null;

    const report = await runDataLifecycle();
    await db.execute(sql`
      INSERT INTO cache_store (key, value, expires_at, updated_at)
      VALUES (${KEY}, ${JSON.stringify({ ts: Date.now(), report })}::jsonb, NOW() + interval '7 days', NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at, updated_at = NOW()
    `);
    return report;
  } finally {
    await db.execute(sql`SELECT pg_advisory_unlock(7427001)`).catch(() => {});
  }
}
