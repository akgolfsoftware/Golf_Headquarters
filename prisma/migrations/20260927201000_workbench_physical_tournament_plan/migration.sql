-- Workbench fysisk plan + turneringsplan (Precision Athletics, 27.09.2026).
--
-- RECORD-fil. Kjøres ikke med prisma migrate/db push/deploy i dette prosjektet.
-- Faktisk kirurgisk kjøring: `npx tsx scripts/add-workbench-fys-turnering-2026-09-27.ts`.

CREATE OR REPLACE FUNCTION "workbench_coach_has_player_access"(
  p_coach_id text,
  p_player_id text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "player_enrollments" pe
    WHERE pe."userId" = p_player_id
      AND pe."endedAt" IS NULL
      AND pe."program" != 'PLATFORM_ONLY'
      AND pe."coachId" = p_coach_id
  )
  OR EXISTS (
    SELECT 1
    FROM "group_members" gm
    JOIN "groups" g ON g."id" = gm."groupId"
    WHERE gm."userId" = p_player_id
      AND gm."role" = 'PLAYER'
      AND gm."endedAt" IS NULL
      AND g."coachId" = p_coach_id
  )
  OR EXISTS (
    SELECT 1
    FROM "group_members" gm
    JOIN "group_members" gm2 ON gm2."groupId" = gm."groupId"
    WHERE gm."userId" = p_player_id
      AND gm."role" = 'PLAYER'
      AND gm."endedAt" IS NULL
      AND gm2."userId" = p_coach_id
      AND gm2."role" IN ('COACH', 'ASSISTANT')
      AND gm2."endedAt" IS NULL
  );
$$;

CREATE TABLE IF NOT EXISTS "workbench_physical_blocks" (
  "id" TEXT PRIMARY KEY,
  "playerId" TEXT NOT NULL,
  "coachId" TEXT NOT NULL,
  "groupId" TEXT,
  "sourceGroupBlockId" TEXT,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "periodKind" TEXT NOT NULL DEFAULT 'SIX_WEEK_BLOCK',
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "focus" TEXT,
  "notes" TEXT,
  "publishedAt" TIMESTAMPTZ,
  "publishedBy" TEXT,
  "withdrawnAt" TIMESTAMPTZ,
  "withdrawnBy" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_physical_weeks" (
  "id" TEXT PRIMARY KEY,
  "blockId" TEXT NOT NULL REFERENCES "workbench_physical_blocks"("id") ON DELETE CASCADE,
  "weekIndex" INTEGER NOT NULL,
  "weekStart" DATE NOT NULL,
  "label" TEXT NOT NULL,
  "plannedMinutes" INTEGER,
  "targetTonnageKg" DOUBLE PRECISION,
  "actualTonnageKg" DOUBLE PRECISION,
  "readinessSummary" JSONB,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_physical_sessions" (
  "id" TEXT PRIMARY KEY,
  "weekId" TEXT NOT NULL REFERENCES "workbench_physical_weeks"("id") ON DELETE CASCADE,
  "playerId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "startMinute" INTEGER,
  "durationMinutes" INTEGER,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "type" TEXT NOT NULL DEFAULT 'STYRKE',
  "location" TEXT,
  "sortOrder" INTEGER NOT NULL,
  "plannedLoad" INTEGER,
  "actualLoad" INTEGER,
  "perceivedEffort" INTEGER,
  "readiness" INTEGER,
  "playerNote" TEXT,
  "completedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_physical_exercises" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL REFERENCES "workbench_physical_sessions"("id") ON DELETE CASCADE,
  "exerciseId" TEXT,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "setsTarget" INTEGER,
  "repsMin" INTEGER,
  "repsMax" INTEGER,
  "weightKg" DOUBLE PRECISION,
  "rirTarget" INTEGER,
  "restSeconds" INTEGER,
  "tempo" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_physical_logs" (
  "id" TEXT PRIMARY KEY,
  "exerciseId" TEXT NOT NULL REFERENCES "workbench_physical_exercises"("id") ON DELETE CASCADE,
  "playerId" TEXT NOT NULL,
  "setNumber" INTEGER NOT NULL,
  "reps" INTEGER,
  "weightKg" DOUBLE PRECISION,
  "rir" INTEGER,
  "completedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "note" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_tournament_plans" (
  "id" TEXT PRIMARY KEY,
  "playerId" TEXT NOT NULL,
  "coachId" TEXT NOT NULL,
  "groupId" TEXT,
  "tournamentId" TEXT,
  "tournamentEntryId" TEXT,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "focus" TEXT NOT NULL DEFAULT 'UTVIKLING',
  "format" TEXT,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "travelStartDate" DATE,
  "travelEndDate" DATE,
  "notes" TEXT,
  "publishedAt" TIMESTAMPTZ,
  "publishedBy" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_tournament_preparations" (
  "id" TEXT PRIMARY KEY,
  "planId" TEXT NOT NULL REFERENCES "workbench_tournament_plans"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "playerVisible" BOOLEAN NOT NULL DEFAULT true,
  "completedAt" TIMESTAMPTZ,
  "sortOrder" INTEGER NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_tournament_rounds" (
  "id" TEXT PRIMARY KEY,
  "planId" TEXT NOT NULL REFERENCES "workbench_tournament_plans"("id") ON DELETE CASCADE,
  "roundNumber" INTEGER NOT NULL,
  "date" DATE NOT NULL,
  "teeTimeMinutes" INTEGER,
  "startHole" TEXT,
  "routine" TEXT,
  "gamePlan" TEXT,
  "grossScore" INTEGER,
  "strokesGained" DOUBLE PRECISION,
  "source" TEXT,
  "sourceDate" TIMESTAMPTZ,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_tournament_goals" (
  "id" TEXT PRIMARY KEY,
  "planId" TEXT NOT NULL REFERENCES "workbench_tournament_plans"("id") ON DELETE CASCADE,
  "kind" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "targetValue" DOUBLE PRECISION,
  "unit" TEXT,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_tournament_evaluations" (
  "id" TEXT PRIMARY KEY,
  "planId" TEXT NOT NULL REFERENCES "workbench_tournament_plans"("id") ON DELETE CASCADE,
  "grossTotal" INTEGER,
  "sgTotal" DOUBLE PRECISION,
  "source" TEXT,
  "sourceDate" TIMESTAMPTZ,
  "summary" TEXT,
  "learnings" TEXT,
  "nextAction" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workbench_plan_conflicts" (
  "id" TEXT PRIMARY KEY,
  "playerId" TEXT NOT NULL,
  "tournamentPlanId" TEXT REFERENCES "workbench_tournament_plans"("id") ON DELETE CASCADE,
  "physicalBlockId" TEXT,
  "physicalSessionId" TEXT,
  "date" DATE,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "title" TEXT NOT NULL,
  "details" TEXT,
  "resolutionStatus" TEXT NOT NULL DEFAULT 'OPEN',
  "resolvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "workbench_physical_weeks_blockId_weekIndex_key"
  ON "workbench_physical_weeks" ("blockId", "weekIndex");
CREATE UNIQUE INDEX IF NOT EXISTS "workbench_tournament_rounds_planId_roundNumber_key"
  ON "workbench_tournament_rounds" ("planId", "roundNumber");

CREATE INDEX IF NOT EXISTS "workbench_physical_blocks_playerId_startDate_idx" ON "workbench_physical_blocks" ("playerId", "startDate");
CREATE INDEX IF NOT EXISTS "workbench_physical_blocks_coachId_startDate_idx" ON "workbench_physical_blocks" ("coachId", "startDate");
CREATE INDEX IF NOT EXISTS "workbench_physical_blocks_groupId_idx" ON "workbench_physical_blocks" ("groupId");
CREATE INDEX IF NOT EXISTS "workbench_physical_blocks_status_idx" ON "workbench_physical_blocks" ("status");
CREATE INDEX IF NOT EXISTS "workbench_physical_blocks_sourceGroupBlockId_idx" ON "workbench_physical_blocks" ("sourceGroupBlockId");
CREATE INDEX IF NOT EXISTS "workbench_physical_weeks_blockId_weekStart_idx" ON "workbench_physical_weeks" ("blockId", "weekStart");
CREATE INDEX IF NOT EXISTS "workbench_physical_sessions_weekId_sortOrder_idx" ON "workbench_physical_sessions" ("weekId", "sortOrder");
CREATE INDEX IF NOT EXISTS "workbench_physical_sessions_playerId_date_idx" ON "workbench_physical_sessions" ("playerId", "date");
CREATE INDEX IF NOT EXISTS "workbench_physical_sessions_status_idx" ON "workbench_physical_sessions" ("status");
CREATE INDEX IF NOT EXISTS "workbench_physical_exercises_sessionId_sortOrder_idx" ON "workbench_physical_exercises" ("sessionId", "sortOrder");
CREATE INDEX IF NOT EXISTS "workbench_physical_exercises_exerciseId_idx" ON "workbench_physical_exercises" ("exerciseId");
CREATE INDEX IF NOT EXISTS "workbench_physical_logs_exerciseId_setNumber_idx" ON "workbench_physical_logs" ("exerciseId", "setNumber");
CREATE INDEX IF NOT EXISTS "workbench_physical_logs_playerId_completedAt_idx" ON "workbench_physical_logs" ("playerId", "completedAt");

CREATE INDEX IF NOT EXISTS "workbench_tournament_plans_playerId_startDate_idx" ON "workbench_tournament_plans" ("playerId", "startDate");
CREATE INDEX IF NOT EXISTS "workbench_tournament_plans_coachId_startDate_idx" ON "workbench_tournament_plans" ("coachId", "startDate");
CREATE INDEX IF NOT EXISTS "workbench_tournament_plans_groupId_idx" ON "workbench_tournament_plans" ("groupId");
CREATE INDEX IF NOT EXISTS "workbench_tournament_plans_tournamentId_idx" ON "workbench_tournament_plans" ("tournamentId");
CREATE INDEX IF NOT EXISTS "workbench_tournament_plans_tournamentEntryId_idx" ON "workbench_tournament_plans" ("tournamentEntryId");
CREATE INDEX IF NOT EXISTS "workbench_tournament_plans_status_idx" ON "workbench_tournament_plans" ("status");
CREATE INDEX IF NOT EXISTS "workbench_tournament_preparations_planId_date_idx" ON "workbench_tournament_preparations" ("planId", "date");
CREATE INDEX IF NOT EXISTS "workbench_tournament_preparations_planId_sortOrder_idx" ON "workbench_tournament_preparations" ("planId", "sortOrder");
CREATE INDEX IF NOT EXISTS "workbench_tournament_rounds_planId_date_idx" ON "workbench_tournament_rounds" ("planId", "date");
CREATE INDEX IF NOT EXISTS "workbench_tournament_goals_planId_sortOrder_idx" ON "workbench_tournament_goals" ("planId", "sortOrder");
CREATE INDEX IF NOT EXISTS "workbench_tournament_evaluations_planId_createdAt_idx" ON "workbench_tournament_evaluations" ("planId", "createdAt");
CREATE INDEX IF NOT EXISTS "workbench_plan_conflicts_playerId_date_idx" ON "workbench_plan_conflicts" ("playerId", "date");
CREATE INDEX IF NOT EXISTS "workbench_plan_conflicts_tournamentPlanId_idx" ON "workbench_plan_conflicts" ("tournamentPlanId");
CREATE INDEX IF NOT EXISTS "workbench_plan_conflicts_physicalBlockId_idx" ON "workbench_plan_conflicts" ("physicalBlockId");
CREATE INDEX IF NOT EXISTS "workbench_plan_conflicts_physicalSessionId_idx" ON "workbench_plan_conflicts" ("physicalSessionId");
CREATE INDEX IF NOT EXISTS "workbench_plan_conflicts_resolutionStatus_idx" ON "workbench_plan_conflicts" ("resolutionStatus");

ALTER TABLE "workbench_physical_blocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_physical_weeks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_physical_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_physical_exercises" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_physical_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_tournament_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_tournament_preparations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_tournament_rounds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_tournament_goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_tournament_evaluations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workbench_plan_conflicts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workbench_physical_blocks_read" ON "workbench_physical_blocks";
CREATE POLICY "workbench_physical_blocks_read" ON "workbench_physical_blocks"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR (
            u."id" = "workbench_physical_blocks"."playerId"
            AND "workbench_physical_blocks"."status" IN ('PUBLISHED', 'CHANGED_AFTER_PUBLISH', 'WITHDRAWN')
          )
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_physical_blocks"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_physical_blocks"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_physical_blocks_insert" ON "workbench_physical_blocks";
CREATE POLICY "workbench_physical_blocks_insert" ON "workbench_physical_blocks"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_physical_blocks"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_physical_blocks"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_physical_blocks"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_physical_blocks_update" ON "workbench_physical_blocks";
CREATE POLICY "workbench_physical_blocks_update" ON "workbench_physical_blocks"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_physical_blocks"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_physical_blocks"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_physical_blocks"."playerId")
            )
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_physical_blocks"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_physical_blocks"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_physical_blocks"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_physical_blocks_delete" ON "workbench_physical_blocks";
CREATE POLICY "workbench_physical_blocks_delete" ON "workbench_physical_blocks"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_physical_blocks"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_physical_blocks"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_physical_blocks"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_tournament_plans_read" ON "workbench_tournament_plans";
CREATE POLICY "workbench_tournament_plans_read" ON "workbench_tournament_plans"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR (
            u."id" = "workbench_tournament_plans"."playerId"
            AND "workbench_tournament_plans"."status" IN ('PUBLISHED', 'CHANGED_AFTER_PUBLISH', 'WITHDRAWN')
          )
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_tournament_plans"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_tournament_plans"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_tournament_plans_insert" ON "workbench_tournament_plans";
CREATE POLICY "workbench_tournament_plans_insert" ON "workbench_tournament_plans"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_tournament_plans"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_tournament_plans"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_tournament_plans"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_tournament_plans_update" ON "workbench_tournament_plans";
CREATE POLICY "workbench_tournament_plans_update" ON "workbench_tournament_plans"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_tournament_plans"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_tournament_plans"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_tournament_plans"."playerId")
            )
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_tournament_plans"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_tournament_plans"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_tournament_plans"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_tournament_plans_delete" ON "workbench_tournament_plans";
CREATE POLICY "workbench_tournament_plans_delete" ON "workbench_tournament_plans"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_tournament_plans"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_tournament_plans"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_tournament_plans"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_physical_weeks_inherit" ON "workbench_physical_weeks";
CREATE POLICY "workbench_physical_weeks_inherit" ON "workbench_physical_weeks"
  FOR ALL USING (EXISTS (SELECT 1 FROM "workbench_physical_blocks" b WHERE b."id" = "workbench_physical_weeks"."blockId"))
  WITH CHECK (EXISTS (SELECT 1 FROM "workbench_physical_blocks" b WHERE b."id" = "workbench_physical_weeks"."blockId"));

DROP POLICY IF EXISTS "workbench_physical_sessions_inherit" ON "workbench_physical_sessions";
CREATE POLICY "workbench_physical_sessions_inherit" ON "workbench_physical_sessions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "workbench_physical_weeks" w
      JOIN "workbench_physical_blocks" b ON b."id" = w."blockId"
      WHERE w."id" = "workbench_physical_sessions"."weekId"
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "workbench_physical_weeks" w
      JOIN "workbench_physical_blocks" b ON b."id" = w."blockId"
      WHERE w."id" = "workbench_physical_sessions"."weekId"
    )
  );

DROP POLICY IF EXISTS "workbench_physical_exercises_inherit" ON "workbench_physical_exercises";
CREATE POLICY "workbench_physical_exercises_inherit" ON "workbench_physical_exercises"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "workbench_physical_sessions" s
      JOIN "workbench_physical_weeks" w ON w."id" = s."weekId"
      JOIN "workbench_physical_blocks" b ON b."id" = w."blockId"
      WHERE s."id" = "workbench_physical_exercises"."sessionId"
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "workbench_physical_sessions" s
      JOIN "workbench_physical_weeks" w ON w."id" = s."weekId"
      JOIN "workbench_physical_blocks" b ON b."id" = w."blockId"
      WHERE s."id" = "workbench_physical_exercises"."sessionId"
    )
  );

DROP POLICY IF EXISTS "workbench_physical_logs_inherit" ON "workbench_physical_logs";
CREATE POLICY "workbench_physical_logs_inherit" ON "workbench_physical_logs"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "workbench_physical_exercises" e
      JOIN "workbench_physical_sessions" s ON s."id" = e."sessionId"
      JOIN "workbench_physical_weeks" w ON w."id" = s."weekId"
      JOIN "workbench_physical_blocks" b ON b."id" = w."blockId"
      WHERE e."id" = "workbench_physical_logs"."exerciseId"
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "workbench_physical_exercises" e
      JOIN "workbench_physical_sessions" s ON s."id" = e."sessionId"
      JOIN "workbench_physical_weeks" w ON w."id" = s."weekId"
      JOIN "workbench_physical_blocks" b ON b."id" = w."blockId"
      WHERE e."id" = "workbench_physical_logs"."exerciseId"
    )
  );

DROP POLICY IF EXISTS "workbench_tournament_preparations_inherit" ON "workbench_tournament_preparations";
CREATE POLICY "workbench_tournament_preparations_inherit" ON "workbench_tournament_preparations"
  FOR ALL USING (EXISTS (SELECT 1 FROM "workbench_tournament_plans" p WHERE p."id" = "workbench_tournament_preparations"."planId"))
  WITH CHECK (EXISTS (SELECT 1 FROM "workbench_tournament_plans" p WHERE p."id" = "workbench_tournament_preparations"."planId"));

DROP POLICY IF EXISTS "workbench_tournament_rounds_inherit" ON "workbench_tournament_rounds";
CREATE POLICY "workbench_tournament_rounds_inherit" ON "workbench_tournament_rounds"
  FOR ALL USING (EXISTS (SELECT 1 FROM "workbench_tournament_plans" p WHERE p."id" = "workbench_tournament_rounds"."planId"))
  WITH CHECK (EXISTS (SELECT 1 FROM "workbench_tournament_plans" p WHERE p."id" = "workbench_tournament_rounds"."planId"));

DROP POLICY IF EXISTS "workbench_tournament_goals_inherit" ON "workbench_tournament_goals";
CREATE POLICY "workbench_tournament_goals_inherit" ON "workbench_tournament_goals"
  FOR ALL USING (EXISTS (SELECT 1 FROM "workbench_tournament_plans" p WHERE p."id" = "workbench_tournament_goals"."planId"))
  WITH CHECK (EXISTS (SELECT 1 FROM "workbench_tournament_plans" p WHERE p."id" = "workbench_tournament_goals"."planId"));

DROP POLICY IF EXISTS "workbench_tournament_evaluations_inherit" ON "workbench_tournament_evaluations";
CREATE POLICY "workbench_tournament_evaluations_inherit" ON "workbench_tournament_evaluations"
  FOR ALL USING (EXISTS (SELECT 1 FROM "workbench_tournament_plans" p WHERE p."id" = "workbench_tournament_evaluations"."planId"))
  WITH CHECK (EXISTS (SELECT 1 FROM "workbench_tournament_plans" p WHERE p."id" = "workbench_tournament_evaluations"."planId"));

DROP POLICY IF EXISTS "workbench_plan_conflicts_read_write" ON "workbench_plan_conflicts";
CREATE POLICY "workbench_plan_conflicts_read_write" ON "workbench_plan_conflicts"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_plan_conflicts"."playerId"
          OR (u."role" = 'COACH' AND "workbench_coach_has_player_access"(u."id", "workbench_plan_conflicts"."playerId"))
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (select auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_plan_conflicts"."playerId"
          OR (u."role" = 'COACH' AND "workbench_coach_has_player_access"(u."id", "workbench_plan_conflicts"."playerId"))
        )
    )
  );
