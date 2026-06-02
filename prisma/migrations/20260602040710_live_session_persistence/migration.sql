-- Live Session-persistens (Alternativ 1)
-- Additiv migrasjon: enum-verdier + 4 nullable felt på 2 tabeller. Ingen data berøres.

-- AlterEnum: PAUSED + ABANDONED (verdiene brukes ikke i denne migrasjonen → trygt på PG12+)
ALTER TYPE "SessionStatus" ADD VALUE IF NOT EXISTS 'PAUSED';
ALTER TYPE "SessionStatus" ADD VALUE IF NOT EXISTS 'ABANDONED';

-- AlterTable: løpende live-snapshot på økta (nulles ved completeSession)
ALTER TABLE "training_plan_sessions" ADD COLUMN IF NOT EXISTS "liveSnapshot" JSONB;

-- AlterTable: frosset aggregat på loggen ved fullføring
ALTER TABLE "training_plan_session_logs" ADD COLUMN IF NOT EXISTS "totalReps" INTEGER;
ALTER TABLE "training_plan_session_logs" ADD COLUMN IF NOT EXISTS "drillAggregates" JSONB;
ALTER TABLE "training_plan_session_logs" ADD COLUMN IF NOT EXISTS "abandonReason" TEXT;
