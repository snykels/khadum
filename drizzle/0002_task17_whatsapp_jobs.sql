-- Task #17: Reliable background processing for WhatsApp inbound messages.
-- Replaces fire-and-forget Promise.all with a durable DB-backed job queue.
-- Idempotent additive migration. Safe to apply on existing databases.

CREATE TABLE IF NOT EXISTS "whatsapp_jobs" (
  "id" serial PRIMARY KEY,
  "phone" text NOT NULL,
  "text" text NOT NULL,
  "wa_message_id" text,
  "status" text NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "max_attempts" integer NOT NULL DEFAULT 5,
  "last_error" text,
  "scheduled_at" timestamp NOT NULL DEFAULT now(),
  "locked_until" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "completed_at" timestamp
);

-- Idempotency: a Meta wa_message_id is enqueued at most once.
CREATE UNIQUE INDEX IF NOT EXISTS "whatsapp_jobs_wa_message_id_key"
  ON "whatsapp_jobs" ("wa_message_id")
  WHERE "wa_message_id" IS NOT NULL;

-- Worker fast-path: pull oldest runnable jobs.
CREATE INDEX IF NOT EXISTS "whatsapp_jobs_runnable_idx"
  ON "whatsapp_jobs" ("status", "scheduled_at")
  WHERE "status" IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS "whatsapp_jobs_phone_idx"
  ON "whatsapp_jobs" ("phone");

CREATE INDEX IF NOT EXISTS "whatsapp_jobs_created_idx"
  ON "whatsapp_jobs" ("created_at");
