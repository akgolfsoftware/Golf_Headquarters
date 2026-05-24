-- Add ExerciseSource enum
DO $$ BEGIN
  CREATE TYPE "ExerciseSource" AS ENUM ('SYSTEM', 'COACH', 'PLAYER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add ExerciseVisibility enum
DO $$ BEGIN
  CREATE TYPE "ExerciseVisibility" AS ENUM ('PRIVATE', 'COACH_PLAYERS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to exercise_definitions
ALTER TABLE exercise_definitions
  ADD COLUMN IF NOT EXISTS source "ExerciseSource" NOT NULL DEFAULT 'SYSTEM',
  ADD COLUMN IF NOT EXISTS visibility "ExerciseVisibility" NOT NULL DEFAULT 'PRIVATE',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS muscle_groups TEXT[] NOT NULL DEFAULT '{}';

-- Add index for source + createdBy lookups
CREATE INDEX IF NOT EXISTS idx_exercise_definitions_source_created_by
  ON exercise_definitions(source, "createdBy");
