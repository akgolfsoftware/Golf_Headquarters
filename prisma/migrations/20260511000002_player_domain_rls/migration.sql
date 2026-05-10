-- Fase 1.5: RLS-policies for PlayerHQ-domenet
-- Applied: 2026-05-11 via psql
--
-- Mønster fra Fase 1.3 (parent_relations + service_types):
--   - Per-bruker-tabeller: select/insert/update — egen rad, COACH/ADMIN ser alt.
--                          delete — kun ADMIN.
--   - Delt katalog (exercise/test/course_definitions): authenticated reads,
--                          ADMIN writes.

-- =============================================================
-- Per-bruker-tabeller
-- =============================================================

ALTER TABLE "training_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "training_plan_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session_drills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "training_plan_session_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rounds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "test_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trackman_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;

-- ---------- training_plans ----------
DROP POLICY IF EXISTS "training_plans_select" ON "training_plans";
CREATE POLICY "training_plans_select" ON "training_plans"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "training_plans"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "training_plans_insert" ON "training_plans";
CREATE POLICY "training_plans_insert" ON "training_plans"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "training_plans"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "training_plans_update" ON "training_plans";
CREATE POLICY "training_plans_update" ON "training_plans"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "training_plans"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "training_plans_delete" ON "training_plans";
CREATE POLICY "training_plans_delete" ON "training_plans"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );

-- ---------- training_plan_sessions (innenfor brukers plan) ----------
DROP POLICY IF EXISTS "training_plan_sessions_select" ON "training_plan_sessions";
CREATE POLICY "training_plan_sessions_select" ON "training_plan_sessions"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "training_plans" p
      JOIN "users" u ON u."authId" = (auth.uid())::text
      WHERE p."id" = "training_plan_sessions"."planId"
        AND (p."userId" = u."id" OR u."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "training_plan_sessions_write" ON "training_plan_sessions";
CREATE POLICY "training_plan_sessions_write" ON "training_plan_sessions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "training_plans" p
      JOIN "users" u ON u."authId" = (auth.uid())::text
      WHERE p."id" = "training_plan_sessions"."planId"
        AND (p."userId" = u."id" OR u."role" IN ('ADMIN','COACH'))
    )
  );

-- ---------- session_drills (innenfor session) ----------
DROP POLICY IF EXISTS "session_drills_select" ON "session_drills";
CREATE POLICY "session_drills_select" ON "session_drills"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "training_plan_sessions" s
      JOIN "training_plans" p ON p."id" = s."planId"
      JOIN "users" u ON u."authId" = (auth.uid())::text
      WHERE s."id" = "session_drills"."sessionId"
        AND (p."userId" = u."id" OR u."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "session_drills_write" ON "session_drills";
CREATE POLICY "session_drills_write" ON "session_drills"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "training_plan_sessions" s
      JOIN "training_plans" p ON p."id" = s."planId"
      JOIN "users" u ON u."authId" = (auth.uid())::text
      WHERE s."id" = "session_drills"."sessionId"
        AND (p."userId" = u."id" OR u."role" IN ('ADMIN','COACH'))
    )
  );

-- ---------- training_plan_session_logs ----------
DROP POLICY IF EXISTS "training_plan_session_logs_select" ON "training_plan_session_logs";
CREATE POLICY "training_plan_session_logs_select" ON "training_plan_session_logs"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "training_plan_sessions" s
      JOIN "training_plans" p ON p."id" = s."planId"
      JOIN "users" u ON u."authId" = (auth.uid())::text
      WHERE s."id" = "training_plan_session_logs"."sessionId"
        AND (p."userId" = u."id" OR u."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "training_plan_session_logs_write" ON "training_plan_session_logs";
CREATE POLICY "training_plan_session_logs_write" ON "training_plan_session_logs"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "training_plan_sessions" s
      JOIN "training_plans" p ON p."id" = s."planId"
      JOIN "users" u ON u."authId" = (auth.uid())::text
      WHERE s."id" = "training_plan_session_logs"."sessionId"
        AND (p."userId" = u."id" OR u."role" IN ('ADMIN','COACH'))
    )
  );

-- ---------- rounds ----------
DROP POLICY IF EXISTS "rounds_select" ON "rounds";
CREATE POLICY "rounds_select" ON "rounds"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "rounds"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "rounds_write" ON "rounds";
CREATE POLICY "rounds_write" ON "rounds"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "rounds"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

-- ---------- test_results ----------
DROP POLICY IF EXISTS "test_results_select" ON "test_results";
CREATE POLICY "test_results_select" ON "test_results"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "test_results"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "test_results_write" ON "test_results";
CREATE POLICY "test_results_write" ON "test_results"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "test_results"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

-- ---------- trackman_sessions ----------
DROP POLICY IF EXISTS "trackman_sessions_select" ON "trackman_sessions";
CREATE POLICY "trackman_sessions_select" ON "trackman_sessions"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "trackman_sessions"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "trackman_sessions_write" ON "trackman_sessions";
CREATE POLICY "trackman_sessions_write" ON "trackman_sessions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "trackman_sessions"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

-- ---------- subscriptions ----------
DROP POLICY IF EXISTS "subscriptions_select" ON "subscriptions";
CREATE POLICY "subscriptions_select" ON "subscriptions"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "subscriptions"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

DROP POLICY IF EXISTS "subscriptions_write" ON "subscriptions";
CREATE POLICY "subscriptions_write" ON "subscriptions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."role" = 'ADMIN'
             OR ("users"."id" = "subscriptions"."userId" AND "users"."role" IN ('PLAYER','PARENT','COACH')))
    )
  );

-- =============================================================
-- Delt katalog: exercise_definitions, test_definitions, course_definitions
-- Alle authenticated leser. Kun ADMIN skriver.
-- =============================================================

ALTER TABLE "exercise_definitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "test_definitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_definitions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exercise_definitions_select" ON "exercise_definitions";
CREATE POLICY "exercise_definitions_select" ON "exercise_definitions"
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "exercise_definitions_admin_write" ON "exercise_definitions";
CREATE POLICY "exercise_definitions_admin_write" ON "exercise_definitions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "test_definitions_select" ON "test_definitions";
CREATE POLICY "test_definitions_select" ON "test_definitions"
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "test_definitions_admin_write" ON "test_definitions";
CREATE POLICY "test_definitions_admin_write" ON "test_definitions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "course_definitions_select" ON "course_definitions";
CREATE POLICY "course_definitions_select" ON "course_definitions"
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "course_definitions_admin_write" ON "course_definitions";
CREATE POLICY "course_definitions_admin_write" ON "course_definitions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );
