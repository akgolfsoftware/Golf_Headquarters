-- WagrSnapshot — referansespillere fra wagr.com + AK Golf-spillere
CREATE TABLE IF NOT EXISTS "wagr_snapshots" (
  "id" TEXT PRIMARY KEY,
  "wagrPlayerSlug" TEXT NOT NULL UNIQUE,
  "fullName" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "rank" INTEGER NOT NULL,
  "moveDelta" INTEGER,
  "ptsAvg" DOUBLE PRECISION NOT NULL,
  "divisor" DOUBLE PRECISION NOT NULL,
  "wins" INTEGER NOT NULL DEFAULT 0,
  "top10s" INTEGER NOT NULL DEFAULT 0,
  "bestRank" INTEGER,
  "countingEvents" INTEGER NOT NULL DEFAULT 0,
  "ngfCategory" TEXT,
  "userId" TEXT UNIQUE,
  "snapshotAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "metadata" JSONB,
  CONSTRAINT "wagr_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "wagr_snapshots_country_rank_idx" ON "wagr_snapshots"("country", "rank");
CREATE INDEX IF NOT EXISTS "wagr_snapshots_ngfCategory_idx" ON "wagr_snapshots"("ngfCategory");
CREATE INDEX IF NOT EXISTS "wagr_snapshots_userId_idx" ON "wagr_snapshots"("userId");
