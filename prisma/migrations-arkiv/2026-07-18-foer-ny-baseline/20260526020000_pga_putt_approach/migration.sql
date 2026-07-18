-- Stats Fase 2: PGA Tour putt-distance + approach-distance tabeller

CREATE TABLE "pga_putt_distance" (
  "id"              TEXT NOT NULL,
  "year"            INTEGER NOT NULL,
  "distanceMeters"  INTEGER NOT NULL,
  "tourAvgSunkPct"  DOUBLE PRECISION NOT NULL,
  "top10AvgSunkPct" DOUBLE PRECISION,
  "proximityNext"   DOUBLE PRECISION,
  "source"          TEXT NOT NULL DEFAULT 'broadie-estimate',
  "lastUpdated"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "pga_putt_distance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pga_putt_distance_year_distanceMeters_key"
  ON "pga_putt_distance"("year", "distanceMeters");

CREATE TABLE "pga_approach_distance" (
  "id"                     TEXT NOT NULL,
  "year"                   INTEGER NOT NULL,
  "yardageBucket"          TEXT NOT NULL,
  "tourAvgProximityMeters" DOUBLE PRECISION NOT NULL,
  "girPct"                 DOUBLE PRECISION,
  "source"                 TEXT NOT NULL DEFAULT 'datagolf-approach-skill',
  "lastUpdated"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "pga_approach_distance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pga_approach_distance_year_yardageBucket_key"
  ON "pga_approach_distance"("year", "yardageBucket");
