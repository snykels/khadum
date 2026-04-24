-- Task #16: Freelancer activation lifecycle
-- Idempotent additive migration. Safe to apply on existing databases.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "activation_status" varchar(20) NOT NULL DEFAULT 'active';

ALTER TABLE "email_verifications"
  ADD COLUMN IF NOT EXISTS "user_id" integer;

ALTER TABLE "email_verifications"
  ADD COLUMN IF NOT EXISTS "revoked" boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'email_verifications'
      AND constraint_name = 'email_verifications_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "email_verifications"
      ADD CONSTRAINT "email_verifications_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_email_verifications_user_id"
  ON "email_verifications" ("user_id");

CREATE INDEX IF NOT EXISTS "idx_email_verifications_application_id"
  ON "email_verifications" ("application_id");
