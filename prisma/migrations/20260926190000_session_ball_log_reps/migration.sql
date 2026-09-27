-- AlterTable
ALTER TABLE "session_ball_logs" ADD COLUMN IF NOT EXISTS "area" TEXT;
ALTER TABLE "session_ball_logs" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "session_ball_logs" ADD COLUMN IF NOT EXISTS "repetitionType" TEXT;
