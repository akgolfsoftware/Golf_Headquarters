-- Rename LPhase enum: KROPP|ARM|KOLLE|BALL|AUTO → GRUNN|SPESIAL|TURNERING
-- Applied 2026-05-15 via Supabase MCP

ALTER TYPE "LPhase" RENAME TO "LPhase_old";
CREATE TYPE "LPhase" AS ENUM ('GRUNN', 'SPESIAL', 'TURNERING');

-- training_plan_sessions.lPhase (nullable)
ALTER TABLE "training_plan_sessions"
  ALTER COLUMN "lPhase" TYPE "LPhase" USING (
    CASE "lPhase"::text
      WHEN 'KROPP' THEN 'GRUNN'::"LPhase"
      WHEN 'ARM'   THEN 'GRUNN'::"LPhase"
      WHEN 'KOLLE' THEN 'SPESIAL'::"LPhase"
      WHEN 'BALL'  THEN 'SPESIAL'::"LPhase"
      WHEN 'AUTO'  THEN 'TURNERING'::"LPhase"
      ELSE NULL
    END
  );

-- exercise_definitions.lPhase (required)
ALTER TABLE "exercise_definitions"
  ALTER COLUMN "lPhase" TYPE "LPhase" USING (
    CASE "lPhase"::text
      WHEN 'KROPP' THEN 'GRUNN'::"LPhase"
      WHEN 'ARM'   THEN 'GRUNN'::"LPhase"
      WHEN 'KOLLE' THEN 'SPESIAL'::"LPhase"
      WHEN 'BALL'  THEN 'SPESIAL'::"LPhase"
      WHEN 'AUTO'  THEN 'TURNERING'::"LPhase"
      ELSE 'GRUNN'::"LPhase"
    END
  );

-- period_blocks.lPhase (required)
ALTER TABLE "period_blocks"
  ALTER COLUMN "lPhase" TYPE "LPhase" USING (
    CASE "lPhase"::text
      WHEN 'KROPP' THEN 'GRUNN'::"LPhase"
      WHEN 'ARM'   THEN 'GRUNN'::"LPhase"
      WHEN 'KOLLE' THEN 'SPESIAL'::"LPhase"
      WHEN 'BALL'  THEN 'SPESIAL'::"LPhase"
      WHEN 'AUTO'  THEN 'TURNERING'::"LPhase"
      ELSE 'GRUNN'::"LPhase"
    END
  );

DROP TYPE "LPhase_old";
