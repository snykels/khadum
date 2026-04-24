-- Task #31: UnifiedInbox, SupportHub, and AdminBrokerage improvements
-- Idempotent additive migration. Safe to apply on existing databases.

-- Add channel column to conversations table for source tracking (whatsapp/web/inapp)
ALTER TABLE "conversations"
  ADD COLUMN IF NOT EXISTS "channel" text NOT NULL DEFAULT 'inapp';

-- Extend ticket_status enum with in_progress value
DO $$ BEGIN
  ALTER TYPE ticket_status ADD VALUE 'in_progress';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Extend dispute_status enum with pending value (used for "قيد الفحص" state)
DO $$ BEGIN
  ALTER TYPE dispute_status ADD VALUE 'pending';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
