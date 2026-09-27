-- Oppgave 2: Gjør uken til et reelt objekt (WeekPlan-modell)
--
-- Definerer uken som et reelt planleggingsobjekt med:
-- - spiller (playerId)
-- - sesong (valgfri FK til season_plans)
-- - ISO-år og ukenummer
-- - uketype (UTVIKLING, VEDLIKEHOLD, TURNERING)
-- - ukenotater (FERIE, TEST, SAMLING, EVALUERING, PRE_TURNERING, TEKNIKK_UKE)
-- - planlagte timer per pyramide (FYS, TEK, SLAG, SPILL, TURN)
-- - repetisjonsmål (tørrtrening, lav hastighet, full fart, putting, nærspill)
-- - belastningstak (load ceiling i sRPE-minutter)

DO $$ BEGIN
  CREATE TYPE "WeekType" AS ENUM ('UTVIKLING', 'VEDLIKEHOLD', 'TURNERING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "WeekNote" AS ENUM ('FERIE', 'TEST', 'SAMLING', 'EVALUERING', 'PRE_TURNERING', 'TEKNIKK_UKE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "week_plans" (
  "id"                 TEXT NOT NULL,
  "playerId"           TEXT NOT NULL,
  "seasonPlanId"       TEXT,
  "isoYear"            INTEGER NOT NULL,
  "weekNumber"         INTEGER NOT NULL,
  "weekType"           "WeekType" NOT NULL DEFAULT 'UTVIKLING',
  "notes"              "WeekNote"[] NOT NULL DEFAULT ARRAY[]::"WeekNote"[],
  "plannedHoursFys"    DOUBLE PRECISION,
  "plannedHoursTek"    DOUBLE PRECISION,
  "plannedHoursSlag"   DOUBLE PRECISION,
  "plannedHoursSpill"  DOUBLE PRECISION,
  "plannedHoursTurn"   DOUBLE PRECISION,
  "repTargetDry"       INTEGER,
  "repTargetLowSpeed"  INTEGER,
  "repTargetFullSpeed" INTEGER,
  "repTargetPutting"   INTEGER,
  "repTargetShortGame" INTEGER,
  "repetitionTargets"  JSONB,
  "loadCeiling"        INTEGER,
  "customNotes"        TEXT,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "week_plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "week_plans_playerId_isoYear_weekNumber_key"
  ON "week_plans" ("playerId", "isoYear", "weekNumber");

CREATE INDEX IF NOT EXISTS "week_plans_playerId_idx"
  ON "week_plans" ("playerId");

CREATE INDEX IF NOT EXISTS "week_plans_seasonPlanId_idx"
  ON "week_plans" ("seasonPlanId");

CREATE INDEX IF NOT EXISTS "week_plans_isoYear_weekNumber_idx"
  ON "week_plans" ("isoYear", "weekNumber");

DO $$ BEGIN
  ALTER TABLE "week_plans"
    ADD CONSTRAINT "week_plans_seasonPlanId_fkey"
    FOREIGN KEY ("seasonPlanId") REFERENCES "season_plans"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
