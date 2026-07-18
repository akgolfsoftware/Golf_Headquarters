-- Slag-for-slag statistikk (manuell wizard + UpGame-import)
-- Applied: 2026-05-16

CREATE TYPE "ShotLie" AS ENUM (
  'TEE', 'FAIRWAY', 'SEMI_ROUGH', 'ROUGH', 'DEEP_ROUGH',
  'BUNKER', 'GREEN', 'WATER', 'OOB', 'TREES'
);

CREATE TYPE "WindDir" AS ENUM (
  'STILLE', 'MEDVIND', 'MOTVIND', 'VENSTRE', 'HOYRE'
);

CREATE TYPE "ShotType" AS ENUM (
  'DRIVE', 'APPROACH', 'CHIP', 'PITCH', 'PUTT',
  'BUNKER', 'RECOVERY', 'DROP'
);

CREATE TABLE "shots" (
  "id"            TEXT NOT NULL,
  "roundId"       TEXT NOT NULL,
  "holeNumber"    INTEGER NOT NULL,
  "holePar"       INTEGER NOT NULL,
  "shotNumber"    INTEGER NOT NULL,
  "club"          TEXT,
  "lie"           "ShotLie" NOT NULL,
  "distanceToPin" DOUBLE PRECISION,
  "distanceHit"   DOUBLE PRECISION,
  "windDir"       "WindDir",
  "shotType"      "ShotType" NOT NULL,
  "isPenalty"     BOOLEAN NOT NULL DEFAULT false,
  "notes"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "shots_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "shots_roundId_holeNumber_shotNumber_key"
    UNIQUE ("roundId", "holeNumber", "shotNumber"),
  CONSTRAINT "shots_roundId_fkey"
    FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "shots_roundId_holeNumber_idx" ON "shots"("roundId", "holeNumber");
