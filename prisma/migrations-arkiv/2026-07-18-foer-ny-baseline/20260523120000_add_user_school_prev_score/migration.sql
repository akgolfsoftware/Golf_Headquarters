-- Legg til VGS (skole) og snittscore forrige sesong på User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "school" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "prevSeasonAvgScore" INTEGER;
