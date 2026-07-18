-- KimiCode PlayerHQ-skjema: rent additivt. Ingen sletting/omdøping → ingen datatap.
-- Eksisterende tabeller (shots, drill_logs_v2) har allerede RLS — kun nye kolonner her.
-- To NYE tabeller (hole_scores, plan_change_requests) får RLS aktivert nederst (deny-all).

-- AlterTable: shot-map + mental-score (alle nullable)
ALTER TABLE "shots" ADD COLUMN     "endX" DOUBLE PRECISION,
ADD COLUMN     "endY" DOUBLE PRECISION,
ADD COLUMN     "mentalScore" SMALLINT,
ADD COLUMN     "startX" DOUBLE PRECISION,
ADD COLUMN     "startY" DOUBLE PRECISION;

-- AlterTable: rep-kategorier for live-økt-logging (NOT NULL DEFAULT 0 → eksisterende rader backfilles trygt)
ALTER TABLE "drill_logs_v2" ADD COLUMN     "repsAutomatic" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "repsHit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "repsLowSpeed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "repsTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "repsWithoutBall" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "hole_scores" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "strokes" INTEGER NOT NULL,
    "putts" INTEGER,
    "fairway" BOOLEAN,
    "gir" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hole_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_change_requests" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "planId" TEXT,
    "sessionId" TEXT,
    "changeType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "coachId" TEXT,
    "coachNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hole_scores_roundId_idx" ON "hole_scores"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "hole_scores_roundId_holeNumber_key" ON "hole_scores"("roundId", "holeNumber");

-- CreateIndex
CREATE INDEX "plan_change_requests_playerId_status_idx" ON "plan_change_requests"("playerId", "status");

-- CreateIndex
CREATE INDEX "plan_change_requests_coachId_status_idx" ON "plan_change_requests"("coachId", "status");

-- AddForeignKey
ALTER TABLE "hole_scores" ADD CONSTRAINT "hole_scores_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_change_requests" ADD CONSTRAINT "plan_change_requests_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_change_requests" ADD CONSTRAINT "plan_change_requests_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable RLS (deny-all): Prisma service-role bypasser; anon/authenticated DENY.
ALTER TABLE "hole_scores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_change_requests" ENABLE ROW LEVEL SECURITY;
