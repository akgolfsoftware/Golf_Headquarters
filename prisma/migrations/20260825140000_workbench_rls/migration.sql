-- RLS for workbench_sessions + workbench_drills (natt-plan 25.08.2026, Loop 1 follow-up).
--
-- Bakgrunn: tabellene ble opprettet i Loop 1 uten RLS (se schema-kommentaren
-- "Isolerte tabeller for den nye Workbench-kjernen"). All ekte app-tilgang går
-- via server actions i src/lib/workbench/wb-actions.ts, som bruker Prisma —
-- Prisma kobler til som eier/service-role og BYPASSER RLS uansett policy
-- (samme mønster som 20260614193000_enable_rls_test_assignments og
-- 20260731000000_enable_rls_four_tables dokumenterer). Denne migrasjonen er
-- derfor forsvar-i-dybden mot direkte PostgREST-tilgang (anon/authenticated-
-- nøkkelen som ligger i klient-bundlet) — ikke den primære tilgangsporten.
--
-- Policyene speiler wb-actions.ts sin tilgangslogikk så nøyaktig som mulig i
-- SQL:
--   - kreverTilgangTilSpiller(): spiller ser/eier egne rader, ELLER
--     COACH/ADMIN med harCoachTilgangTilSpiller() (src/lib/auth/coached.ts).
--   - loadPlayerDay / SPILLER_SYNLIGE_STATUSER: spilleren ser ALDRI DRAFT
--     (invariant 3, CLAUDE.md) — håndhevet her også for SELECT.
--
-- Kjøres IKKE via `prisma migrate` (se .claude/rules/gotchas.md
-- §Schema-endringer — migrate dev/deploy er begge blokkert mot denne
-- databasen). Denne fila er en RECORD. Faktisk kjøring:
-- `npx tsx scripts/apply-workbench-rls-2026-08-25.ts`.
--
-- Rollback: se docs/natt/RLS-WORKBENCH-DONE.md.

-- ─── Hjelpefunksjon: har coach/admin-brukeren tilgang til denne spilleren? ───
-- Speiler coachScopedPlayerWhere() i src/lib/auth/coached.ts sine tre grener:
--   1. Aktiv PlayerEnrollment (endedAt null, program != PLATFORM_ONLY) med
--      coachId = viewer.
--   2. Aktivt spiller-medlemskap i en gruppe viewer EIER (Group.coachId).
--   3. Aktivt spiller-medlemskap i en gruppe der viewer selv er aktivt
--      COACH/ASSISTANT-medlem.
-- ADMIN sjekkes separat i policyene (unngår å duplisere rolle-oppslaget her).
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

-- ─── workbench_sessions ──────────────────────────────────────────────────
ALTER TABLE "workbench_sessions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workbench_sessions_select" ON "workbench_sessions";
CREATE POLICY "workbench_sessions_select" ON "workbench_sessions"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR (
            u."id" = "workbench_sessions"."playerId"
            AND "workbench_sessions"."status" IN ('PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')
          )
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_sessions"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_sessions"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_sessions_insert" ON "workbench_sessions";
CREATE POLICY "workbench_sessions_insert" ON "workbench_sessions"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_sessions"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_sessions"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_sessions"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_sessions_update" ON "workbench_sessions";
CREATE POLICY "workbench_sessions_update" ON "workbench_sessions"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_sessions"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_sessions"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_sessions"."playerId")
            )
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_sessions"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_sessions"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_sessions"."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_sessions_delete" ON "workbench_sessions";
CREATE POLICY "workbench_sessions_delete" ON "workbench_sessions"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "users" u
      WHERE u."authId" = (auth.uid())::text
        AND (
          u."role" = 'ADMIN'
          OR u."id" = "workbench_sessions"."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = "workbench_sessions"."coachId"
              OR "workbench_coach_has_player_access"(u."id", "workbench_sessions"."playerId")
            )
          )
        )
    )
  );

-- ─── workbench_drills (arver tilgang fra sin session) ───────────────────────
ALTER TABLE "workbench_drills" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workbench_drills_select" ON "workbench_drills";
CREATE POLICY "workbench_drills_select" ON "workbench_drills"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "workbench_sessions" s
      JOIN "users" u ON u."authId" = (auth.uid())::text
      WHERE s."id" = "workbench_drills"."sessionId"
        AND (
          u."role" = 'ADMIN'
          OR (
            u."id" = s."playerId"
            AND s."status" IN ('PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')
          )
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = s."coachId"
              OR "workbench_coach_has_player_access"(u."id", s."playerId")
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "workbench_drills_write" ON "workbench_drills";
CREATE POLICY "workbench_drills_write" ON "workbench_drills"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "workbench_sessions" s
      JOIN "users" u ON u."authId" = (auth.uid())::text
      WHERE s."id" = "workbench_drills"."sessionId"
        AND (
          u."role" = 'ADMIN'
          OR u."id" = s."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = s."coachId"
              OR "workbench_coach_has_player_access"(u."id", s."playerId")
            )
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "workbench_sessions" s
      JOIN "users" u ON u."authId" = (auth.uid())::text
      WHERE s."id" = "workbench_drills"."sessionId"
        AND (
          u."role" = 'ADMIN'
          OR u."id" = s."playerId"
          OR (
            u."role" = 'COACH'
            AND (
              u."id" = s."coachId"
              OR "workbench_coach_has_player_access"(u."id", s."playerId")
            )
          )
        )
    )
  );
