-- Turneringsplaner for referansespillerne (Anders 20.10.2026): én plan per WAGR-spiller og sesong,
-- delt mellom trenerne. Siden teamnorwayref.vercel.app leser og skriver direkte med Supabase-klienten
-- (innlogget HQ-konto), så låsen her ER tilgangsporten — ikke forsvar-i-dybden.
--
-- Hvem kan lese og skrive: aktiv HQ-bruker (deletedAt null, ikke demokonto) som er ADMIN eller COACH,
-- eller aktiv COACH/ASSISTANT på Team Norway-gruppa (tn-tilgang.ts). Spillere, foreldre, gjester og
-- utloggede får ingenting. Ingen sletting: en tom plan er events = [].
--
-- Kjøres IKKE via prisma migrate (gotchas §Schema-endringer). Denne fila er en RECORD. Kjøring:
--   npx tsx scripts/add-wagr-reference-plans-2026-10-20.ts
-- Rent additivt og idempotent.

CREATE TABLE IF NOT EXISTS "wagr_reference_plans" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "wagrPlayerId" INTEGER NOT NULL,
  "season" INTEGER NOT NULL,
  "playerName" TEXT NOT NULL,
  "events" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "updatedByUserId" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "updatedByName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wagr_reference_plans_events_is_array" CHECK (jsonb_typeof("events") = 'array')
);
CREATE UNIQUE INDEX IF NOT EXISTS "wagr_reference_plans_wagrPlayerId_season_key"
  ON "wagr_reference_plans" ("wagrPlayerId", "season");

-- HQ-brukeren bak den innloggede Supabase-kontoen, hvis vedkommende er trener. Ingen rad ellers.
CREATE OR REPLACE FUNCTION "wagr_reference_plans_editor"() RETURNS TABLE ("userId" text, "name" text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u."id", u."name"
    FROM "users" u
   WHERE u."authId" = auth.uid()::text
     AND u."deletedAt" IS NULL
     AND lower(u."email") NOT IN ('demo@golfforbundet.no', 'demo.trener@golfforbundet.no', 'demo@wang.no', 'demo.sportssjef@wang.no')
     AND (
       u."role" IN ('ADMIN', 'COACH')
       OR EXISTS (
         SELECT 1 FROM "group_members" gm JOIN "groups" g ON g."id" = gm."groupId"
          WHERE gm."userId" = u."id" AND g."slug" = 'team-norway'
            AND gm."role" IN ('COACH', 'ASSISTANT') AND gm."endedAt" IS NULL
       )
     )
   LIMIT 1
$$;
REVOKE ALL ON FUNCTION "wagr_reference_plans_editor"() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION "wagr_reference_plans_editor"() TO authenticated;

-- Hvem som lagret og når settes av databasen, aldri av klienten.
CREATE OR REPLACE FUNCTION "wagr_reference_plans_stamp"() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e record;
BEGIN
  SELECT * INTO e FROM "wagr_reference_plans_editor"();
  NEW."updatedByUserId" := e."userId";
  NEW."updatedByName" := e."name";
  NEW."updatedAt" := CURRENT_TIMESTAMP;
  IF TG_OP = 'INSERT' THEN
    NEW."createdAt" := CURRENT_TIMESTAMP;
  ELSE
    NEW."createdAt" := OLD."createdAt";
    NEW."id" := OLD."id";
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION "wagr_reference_plans_stamp"() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS "wagr_reference_plans_stamp" ON "wagr_reference_plans";
CREATE TRIGGER "wagr_reference_plans_stamp" BEFORE INSERT OR UPDATE ON "wagr_reference_plans"
  FOR EACH ROW EXECUTE FUNCTION "wagr_reference_plans_stamp"();

ALTER TABLE "wagr_reference_plans" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "wagr_reference_plans" FROM anon;
REVOKE ALL ON "wagr_reference_plans" FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON "wagr_reference_plans" TO authenticated;

DROP POLICY IF EXISTS "wagr_reference_plans_select" ON "wagr_reference_plans";
CREATE POLICY "wagr_reference_plans_select" ON "wagr_reference_plans" FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM "wagr_reference_plans_editor"()));
DROP POLICY IF EXISTS "wagr_reference_plans_insert" ON "wagr_reference_plans";
CREATE POLICY "wagr_reference_plans_insert" ON "wagr_reference_plans" FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM "wagr_reference_plans_editor"()));
DROP POLICY IF EXISTS "wagr_reference_plans_update" ON "wagr_reference_plans";
CREATE POLICY "wagr_reference_plans_update" ON "wagr_reference_plans" FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM "wagr_reference_plans_editor"()))
  WITH CHECK (EXISTS (SELECT 1 FROM "wagr_reference_plans_editor"()));
