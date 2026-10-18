-- ============================================================================
-- SQL Migration for Masterbrain Plan Effectiveness Engine
-- ============================================================================

-- 1. Create Enums if they do not exist
DO $$ BEGIN
  CREATE TYPE "TrainingAreaCode" AS ENUM (
    'TEE_TOTAL', 'INNSPILL_200', 'INNSPILL_150', 'INNSPILL_100', 'INNSPILL_50',
    'CHIP', 'PITCH', 'LOB', 'BUNKER', 'PUTT_0_3', 'PUTT_3_5', 'PUTT_5_10',
    'PUTT_10_25', 'PUTT_25_40', 'PUTT_40_PLUSS', 'STYRKE', 'KONDISJON',
    'BEVEGELIGHET', 'BANE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PlayerCategory" AS ENUM (
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ConfidenceLevel" AS ENUM (
    'LOW', 'MEDIUM', 'HIGH'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Alter existing plan_effectiveness table to make legacy plan-level fields nullable
ALTER TABLE "plan_effectiveness" ALTER COLUMN "planId" DROP NOT NULL;
ALTER TABLE "plan_effectiveness" ALTER COLUMN "preSnapshot" DROP NOT NULL;
ALTER TABLE "plan_effectiveness" ALTER COLUMN "postSnapshot" DROP NOT NULL;
ALTER TABLE "plan_effectiveness" ALTER COLUMN "completionRate" DROP NOT NULL;

-- 3. Add new fields for drill-level effectiveness tracking
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "pyramidArea" "PyramidArea";
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "trainingArea" "TrainingAreaCode";
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "drillId" TEXT;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "periodStart" TIMESTAMP(3);
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "periodEnd" TIMESTAMP(3);
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "plannedSessions" INTEGER;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "completedSessions" INTEGER;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "totalTimeMinutes" INTEGER;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "repsCompleted" INTEGER;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "complianceRate" DOUBLE PRECISION;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "baselineSg" DOUBLE PRECISION;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "finalSg" DOUBLE PRECISION;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "sgDelta" DOUBLE PRECISION;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "roundsSampledStart" INTEGER;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "roundsSampledEnd" INTEGER;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "confidence" "ConfidenceLevel";
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "playerCategory" "PlayerCategory";
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "effectivenessScore" DOUBLE PRECISION;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "weightInModel" DOUBLE PRECISION NOT NULL DEFAULT 1.0;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "coachOverride" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "coachNotes" TEXT;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "plan_effectiveness" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 4. Drop single unique index on planId (allows multiple drill effectiveness entries per plan)
DROP INDEX IF EXISTS "plan_effectiveness_planId_key";

-- 5. Create optimized indexes
CREATE INDEX IF NOT EXISTS "plan_effectiveness_drillId_playerCategory_confidence_idx" ON "plan_effectiveness"("drillId", "playerCategory", "confidence");
CREATE INDEX IF NOT EXISTS "plan_effectiveness_trainingArea_playerCategory_idx" ON "plan_effectiveness"("trainingArea", "playerCategory");
CREATE INDEX IF NOT EXISTS "plan_effectiveness_userId_periodEnd_idx" ON "plan_effectiveness"("userId", "periodEnd");
CREATE UNIQUE INDEX IF NOT EXISTS "plan_effectiveness_userId_drillId_periodStart_periodEnd_key" ON "plan_effectiveness"("userId", "drillId", "periodStart", "periodEnd");
