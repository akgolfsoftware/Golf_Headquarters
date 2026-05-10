-- Fase 1.3: RLS-policies for parent_relations + service_types (admin-write)
-- Applied: 2026-05-10 via Supabase MCP

-- =============================================================
-- parent_relations: foresatt og barn ser sin relasjon. ADMIN/COACH ser alt.
-- (RLS er allerede enablet på tabellen i migrasjon 20260510000002, men ingen
--  policies lå på — så all tilgang har vært blokkert siden den ble laget.)
-- =============================================================

DROP POLICY IF EXISTS "parent_relations_select" ON "parent_relations";
CREATE POLICY "parent_relations_select" ON "parent_relations"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND (
          "users"."id" = "parent_relations"."parentId"
          OR "users"."id" = "parent_relations"."childId"
          OR "users"."role" IN ('ADMIN', 'COACH')
        )
    )
  );

DROP POLICY IF EXISTS "parent_relations_insert" ON "parent_relations";
CREATE POLICY "parent_relations_insert" ON "parent_relations"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN', 'COACH', 'PARENT')
    )
  );

DROP POLICY IF EXISTS "parent_relations_update" ON "parent_relations";
CREATE POLICY "parent_relations_update" ON "parent_relations"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN', 'COACH')
    )
  );

DROP POLICY IF EXISTS "parent_relations_delete" ON "parent_relations";
CREATE POLICY "parent_relations_delete" ON "parent_relations"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN', 'COACH')
    )
  );

-- =============================================================
-- service_types: behold eksisterende `service_types_select_public`
-- (active = true → alle, inkl. anon — for offentlig bookingside).
-- Legg på admin-write-policies for INSERT/UPDATE/DELETE.
-- =============================================================

DROP POLICY IF EXISTS "service_types_admin_insert" ON "service_types";
CREATE POLICY "service_types_admin_insert" ON "service_types"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "service_types_admin_update" ON "service_types";
CREATE POLICY "service_types_admin_update" ON "service_types"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "service_types_admin_delete" ON "service_types";
CREATE POLICY "service_types_admin_delete" ON "service_types"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );
