-- Stats Fase 2: PGA Tour playground — sesong-aggregat per spiller per år

CREATE TABLE "pga_player_seasons" (
  "id"            TEXT NOT NULL,
  "dgPlayerId"    INTEGER NOT NULL,
  "tour"          TEXT NOT NULL,
  "year"          INTEGER NOT NULL,
  "playerName"    TEXT NOT NULL,
  "country"       TEXT,

  "rounds"        INTEGER,
  "avgScore"      DOUBLE PRECISION,
  "driveDist"     DOUBLE PRECISION,
  "fairwayPct"    DOUBLE PRECISION,
  "girPct"        DOUBLE PRECISION,
  "puttsPerRound" DOUBLE PRECISION,
  "scrambling"    DOUBLE PRECISION,

  "sgTotal"       DOUBLE PRECISION,
  "sgOtt"         DOUBLE PRECISION,
  "sgApp"         DOUBLE PRECISION,
  "sgArg"         DOUBLE PRECISION,
  "sgPutt"        DOUBLE PRECISION,

  "source"        TEXT NOT NULL DEFAULT 'datagolf',
  "lastUpdated"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "pga_player_seasons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pga_player_seasons_dgPlayerId_tour_year_key"
  ON "pga_player_seasons"("dgPlayerId", "tour", "year");

CREATE INDEX "pga_player_seasons_tour_year_driveDist_idx"
  ON "pga_player_seasons"("tour", "year", "driveDist");

CREATE INDEX "pga_player_seasons_tour_year_sgTotal_idx"
  ON "pga_player_seasons"("tour", "year", "sgTotal");

CREATE INDEX "pga_player_seasons_tour_year_fairwayPct_idx"
  ON "pga_player_seasons"("tour", "year", "fairwayPct");

CREATE INDEX "pga_player_seasons_tour_year_girPct_idx"
  ON "pga_player_seasons"("tour", "year", "girPct");

CREATE INDEX "pga_player_seasons_tour_year_puttsPerRound_idx"
  ON "pga_player_seasons"("tour", "year", "puttsPerRound");

CREATE INDEX "pga_player_seasons_tour_year_avgScore_idx"
  ON "pga_player_seasons"("tour", "year", "avgScore");
