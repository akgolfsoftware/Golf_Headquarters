-- Logg økt i etterkant (PlayerHQ pakke 13, vedtak 16.10.2026 §STATS-RESTEN punkt 2).
-- Additivt: pyramide, område, sted, belastning og fokus på training_logs. sgArea blir valgfri,
-- fordi en fysisk eller teknisk økt ikke har et SG-område. Ingen rader endres.
-- Kjøres kirurgisk med scripts/add-pakke13-logg-okt-og-runde-deling-2026-10-18.ts (gotchas §Database).
ALTER TABLE "training_logs" ADD COLUMN IF NOT EXISTS "pyramid" TEXT;
ALTER TABLE "training_logs" ADD COLUMN IF NOT EXISTS "area" TEXT;
ALTER TABLE "training_logs" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "training_logs" ADD COLUMN IF NOT EXISTS "effort" SMALLINT;
ALTER TABLE "training_logs" ADD COLUMN IF NOT EXISTS "focus" SMALLINT;
ALTER TABLE "training_logs" ALTER COLUMN "sgArea" DROP NOT NULL;

-- Del runde (pakke 13, vedtak 16.10 §DEL RUNDE FINNES VED LANSERING): synligheten lagres på runden.
-- Standard true = slik det er i dag (coachen ser rundene). «Bare deg» setter false.
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "sharedWithCoach" BOOLEAN NOT NULL DEFAULT true;
