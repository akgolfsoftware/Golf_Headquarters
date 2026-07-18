-- AlterEnum + AlterTable: TrainingPlan får status + playerComment
DO $$ BEGIN
  CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'PENDING_PLAYER', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'PAUSED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE training_plans
  ADD COLUMN IF NOT EXISTS status "PlanStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "playerComment" TEXT;

CREATE INDEX IF NOT EXISTS "training_plans_status_idx" ON training_plans (status);
