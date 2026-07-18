-- DrillFasilitet enum
CREATE TYPE "DrillFasilitet" AS ENUM (
  'RADAR',
  'MAT_NET',
  'BUNKER',
  'KAMERA',
  'PUTTING_GREEN_KORT',
  'PUTTING_GREEN_LANG',
  'SHORT_GAME_AREA',
  'DRIVING_RANGE',
  'BANE',
  'SIMULATOR'
);

-- fasilitetKrav på exercise_definitions
ALTER TABLE exercise_definitions
  ADD COLUMN IF NOT EXISTS "fasilitetKrav" "DrillFasilitet"[] NOT NULL DEFAULT '{}';

-- tilgjengeligeFasiliteter på users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "tilgjengeligeFasiliteter" "DrillFasilitet"[] NOT NULL DEFAULT '{}';
