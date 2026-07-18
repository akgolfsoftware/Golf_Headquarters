-- Fase 2.1: RLS for CoachHQ-domene
-- Applied: 2026-05-14 via psql

ALTER TABLE "tournaments"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tournament_results"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "groups"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "group_members"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_templates"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_keys"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coach_availability"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "facilities"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_templates"       ENABLE ROW LEVEL SECURITY;

-- ============================
-- Tournaments — alle authenticated leser, COACH/ADMIN skriver
-- ============================
CREATE POLICY "tournaments_select" ON "tournaments"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "tournaments_write" ON "tournaments"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN','COACH')
    )
  );

-- ============================
-- TournamentResults — bruker leser egne, COACH/ADMIN ser alt
-- ============================
CREATE POLICY "tournament_results_select" ON "tournament_results"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "tournament_results"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

CREATE POLICY "tournament_results_write" ON "tournament_results"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN','COACH')
    )
  );

-- ============================
-- Groups — alle authenticated leser, COACH/ADMIN skriver
-- ============================
CREATE POLICY "groups_select" ON "groups"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "groups_write" ON "groups"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN','COACH')
    )
  );

-- ============================
-- GroupMembers — bruker leser egne medlemskap + sin gruppe, COACH/ADMIN ser alt
-- ============================
CREATE POLICY "group_members_select" ON "group_members"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "group_members"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

CREATE POLICY "group_members_write" ON "group_members"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN','COACH')
    )
  );

-- ============================
-- EmailTemplates — kun ADMIN/COACH (ingen player-eksponering)
-- ============================
CREATE POLICY "email_templates_admin" ON "email_templates"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN','COACH')
    )
  );

-- ============================
-- ApiKeys — bruker leser egne, ADMIN ser alt
-- ============================
CREATE POLICY "api_keys_select" ON "api_keys"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "api_keys"."userId" OR "users"."role" = 'ADMIN')
    )
  );

CREATE POLICY "api_keys_write" ON "api_keys"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "api_keys"."userId" OR "users"."role" = 'ADMIN')
    )
  );

-- ============================
-- AuditLogs — kun ADMIN leser. Skriving via service-role (Prisma bypasser RLS).
-- ============================
CREATE POLICY "audit_logs_admin_select" ON "audit_logs"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );

-- ============================
-- CoachAvailability — alle authenticated leser (for booking-velger),
-- coachen skriver egen + ADMIN ser/skriver alt
-- ============================
CREATE POLICY "coach_availability_select" ON "coach_availability"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "coach_availability_write" ON "coach_availability"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "coach_availability"."coachId" OR "users"."role" = 'ADMIN')
    )
  );

-- ============================
-- Facilities — alle authenticated leser, ADMIN skriver
-- ============================
CREATE POLICY "facilities_select" ON "facilities"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "facilities_write" ON "facilities"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );

-- ============================
-- PlanTemplates — alle authenticated leser, COACH/ADMIN skriver
-- ============================
CREATE POLICY "plan_templates_select" ON "plan_templates"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "plan_templates_write" ON "plan_templates"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN','COACH')
    )
  );
