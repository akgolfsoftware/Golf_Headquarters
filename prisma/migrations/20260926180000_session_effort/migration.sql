-- AlterTable
ALTER TABLE "workbench_sessions" ADD COLUMN IF NOT EXISTS "perceivedEffort" INTEGER;
ALTER TABLE "workbench_sessions" ADD COLUMN IF NOT EXISTS "actualMinutes" INTEGER;
