-- Workbench v2 — Sprint 1: schema-utvidelser for live session logger,
-- typeskille på Goal (Resultat/Prosess), strukturert SessionRequest,
-- PlanAdjustment og TournamentPreparation.

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('OUTCOME', 'PROCESS');

-- CreateEnum
CREATE TYPE "SessionNoteType" AS ENUM ('SELF', 'COACH_QUESTION', 'VIDEO');

-- CreateEnum
CREATE TYPE "SessionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlanAdjustmentStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- AlterTable: Goal — legg til category for Resultatmål/Prosessmål
ALTER TABLE "goals" ADD COLUMN "category" "GoalCategory" NOT NULL DEFAULT 'OUTCOME';

-- CreateIndex
CREATE INDEX "goals_userId_category_status_idx" ON "goals"("userId", "category", "status");

-- AlterTable: SessionRequest — restrukturer til workbench v2-format.
-- Konverter eksisterende status (text) til enum og rename felter til ny semantikk.

-- 1) Endre status fra TEXT til SessionRequestStatus
ALTER TABLE "session_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "session_requests"
  ALTER COLUMN "status" TYPE "SessionRequestStatus"
  USING (
    CASE "status"
      WHEN 'PENDING' THEN 'PENDING'::"SessionRequestStatus"
      WHEN 'SCHEDULED' THEN 'APPROVED'::"SessionRequestStatus"
      WHEN 'APPROVED' THEN 'APPROVED'::"SessionRequestStatus"
      WHEN 'DECLINED' THEN 'DECLINED'::"SessionRequestStatus"
      WHEN 'CANCELLED' THEN 'CANCELLED'::"SessionRequestStatus"
      ELSE 'PENDING'::"SessionRequestStatus"
    END
  );
ALTER TABLE "session_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- 2) Rename pyramidArea (text) -> preferredArea (PyramidArea enum)
ALTER TABLE "session_requests" ADD COLUMN "preferredArea" "PyramidArea";
UPDATE "session_requests"
  SET "preferredArea" = CASE "pyramidArea"
    WHEN 'FYS' THEN 'FYS'::"PyramidArea"
    WHEN 'TEK' THEN 'TEK'::"PyramidArea"
    WHEN 'SLAG' THEN 'SLAG'::"PyramidArea"
    WHEN 'SPILL' THEN 'SPILL'::"PyramidArea"
    WHEN 'TURN' THEN 'TURN'::"PyramidArea"
    ELSE NULL
  END
  WHERE "pyramidArea" IS NOT NULL;
ALTER TABLE "session_requests" DROP COLUMN "pyramidArea";

-- 3) Rename preferredAt -> preferredDate (keep DateTime)
ALTER TABLE "session_requests" RENAME COLUMN "preferredAt" TO "preferredDate";

-- 4) Rename notes -> reason (NOT NULL DEFAULT '')
ALTER TABLE "session_requests" ADD COLUMN "reason" TEXT NOT NULL DEFAULT '';
UPDATE "session_requests" SET "reason" = COALESCE("notes", '') WHERE "notes" IS NOT NULL;
ALTER TABLE "session_requests" DROP COLUMN "notes";

-- 5) Nye felter
ALTER TABLE "session_requests" ADD COLUMN "preferredTime" TEXT;
ALTER TABLE "session_requests" ADD COLUMN "durationMin" INTEGER;
ALTER TABLE "session_requests" ADD COLUMN "approvedSessionId" TEXT;
ALTER TABLE "session_requests" ADD COLUMN "coachResponse" TEXT;
ALTER TABLE "session_requests" ADD COLUMN "respondedAt" TIMESTAMP(3);

-- 6) Coach-FK og indekser
CREATE INDEX "session_requests_coachId_status_idx" ON "session_requests"("coachId", "status");
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: SessionDrillInstance
CREATE TABLE "session_drill_instances" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "drillId" TEXT,
    "drillName" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "plannedReps" INTEGER,
    "plannedSets" INTEGER,
    "pyramideArea" "PyramidArea" NOT NULL,
    "fase" TEXT,
    "belastning" TEXT,
    "praksisType" TEXT,
    "omrade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_drill_instances_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "session_drill_instances_sessionId_orderIndex_idx"
  ON "session_drill_instances"("sessionId", "orderIndex");

ALTER TABLE "session_drill_instances" ADD CONSTRAINT "session_drill_instances_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "training_sessions_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: SessionSet
CREATE TABLE "session_sets" (
    "id" TEXT NOT NULL,
    "drillInstanceId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_sets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "session_sets_drillInstanceId_setNumber_idx"
  ON "session_sets"("drillInstanceId", "setNumber");

ALTER TABLE "session_sets" ADD CONSTRAINT "session_sets_drillInstanceId_fkey"
  FOREIGN KEY ("drillInstanceId") REFERENCES "session_drill_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: SessionDrillNote
CREATE TABLE "session_drill_notes" (
    "id" TEXT NOT NULL,
    "drillInstanceId" TEXT NOT NULL,
    "type" "SessionNoteType" NOT NULL,
    "content" TEXT,
    "videoUrl" TEXT,
    "videoThumbnailUrl" TEXT,
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    "answerContent" TEXT,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_drill_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "session_drill_notes_drillInstanceId_type_idx"
  ON "session_drill_notes"("drillInstanceId", "type");

ALTER TABLE "session_drill_notes" ADD CONSTRAINT "session_drill_notes_drillInstanceId_fkey"
  FOREIGN KEY ("drillInstanceId") REFERENCES "session_drill_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: PlanAdjustment
CREATE TABLE "plan_adjustments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "focusAreas" "PyramidArea"[],
    "status" "PlanAdjustmentStatus" NOT NULL DEFAULT 'PENDING',
    "coachResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "plan_adjustments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "plan_adjustments_userId_status_idx"
  ON "plan_adjustments"("userId", "status");

ALTER TABLE "plan_adjustments" ADD CONSTRAINT "plan_adjustments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "plan_adjustments" ADD CONSTRAINT "plan_adjustments_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: TournamentPreparation
CREATE TABLE "tournament_preparations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "targetFinish" TEXT,
    "totalDays" INTEGER NOT NULL,
    "sessionsPlanned" INTEGER NOT NULL DEFAULT 0,
    "sessionsDone" INTEGER NOT NULL DEFAULT 0,
    "aiSummary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_preparations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tournament_preparations_userId_tournamentId_key"
  ON "tournament_preparations"("userId", "tournamentId");

CREATE INDEX "tournament_preparations_userId_status_idx"
  ON "tournament_preparations"("userId", "status");

ALTER TABLE "tournament_preparations" ADD CONSTRAINT "tournament_preparations_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tournament_preparations" ADD CONSTRAINT "tournament_preparations_tournamentId_fkey"
  FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
