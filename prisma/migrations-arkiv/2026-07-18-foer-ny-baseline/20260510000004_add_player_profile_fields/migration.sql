-- Fase 1.4: spiller-profil-felt på User
-- Applied: 2026-05-10 via Supabase MCP

ALTER TABLE "users"
  ADD COLUMN "hcp" DOUBLE PRECISION,
  ADD COLUMN "playingYears" INTEGER,
  ADD COLUMN "ambition" TEXT,
  ADD COLUMN "homeClub" TEXT;
