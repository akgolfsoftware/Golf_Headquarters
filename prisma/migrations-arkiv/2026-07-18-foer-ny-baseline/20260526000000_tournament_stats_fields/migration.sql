-- Stats Fase 1: utvide tournaments-tabellen med nye felter for /turneringer og manuell innlegg

-- 1. Nye kolonner
ALTER TABLE "tournaments"
  ADD COLUMN "shortName" TEXT,
  ADD COLUMN "purseUsd" INTEGER,
  ADD COLUMN "tier" INTEGER,
  ADD COLUMN "weekStart" TIMESTAMP(3),
  ADD COLUMN "norskeAntall" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "createdByUserId" TEXT,
  ADD COLUMN "mergedIntoId" TEXT;

-- 2. Foreign keys
ALTER TABLE "tournaments"
  ADD CONSTRAINT "tournaments_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tournaments"
  ADD CONSTRAINT "tournaments_mergedIntoId_fkey"
  FOREIGN KEY ("mergedIntoId") REFERENCES "tournaments"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Indekser
CREATE INDEX "tournaments_weekStart_status_idx" ON "tournaments"("weekStart", "status");
CREATE INDEX "tournaments_createdByUserId_idx" ON "tournaments"("createdByUserId");
CREATE INDEX "tournaments_mergedIntoId_idx" ON "tournaments"("mergedIntoId");
