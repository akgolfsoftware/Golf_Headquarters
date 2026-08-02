-- Schema-runde for FØR/UNDER/ETTER-sløyfen + Spillere-flaten (2026-07-31).
-- Alt additivt og idempotent. Kjøres kirurgisk med `prisma db execute` mot
-- DIRECT_URL — `migrate dev` og `db push` er begge blokkert i dette repoet,
-- se .claude/rules/gotchas.md §Schema-endringer.

-- 1. Lydsamtykke (nytt). Hard gate for all lydfangst. Ordlyden lagres som
--    kopi, aldri som peker til en tekst som kan endres i ettertid.
CREATE TABLE IF NOT EXISTS lyd_samtykker (
  id text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'VENTER',
  "gittAv" text NOT NULL,
  "foresattEpost" text,
  "gittAt" timestamp(3),
  "trukketAt" timestamp(3),
  ordlyd text NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "lyd_samtykker_userId_key" ON lyd_samtykker("userId");

-- 2. Trådåpning (ny). «Sist sjekket av meg» — skrives kun når Tråd-fanen åpnes.
CREATE TABLE IF NOT EXISTS trad_apninger (
  id text PRIMARY KEY,
  "coachId" text NOT NULL,
  "spillerId" text NOT NULL,
  "apnetAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "trad_apninger_coachId_spillerId_key"
  ON trad_apninger("coachId", "spillerId");

-- 3. PlanAction: sjekkpunktet er den tekniske tråden mellom ETTER og neste FØR.
ALTER TABLE plan_actions ADD COLUMN IF NOT EXISTS sjekkpunkt text;
ALTER TABLE plan_actions ADD COLUMN IF NOT EXISTS "fangstId" text;

-- 4. Group.kind: gir GroupCards tre varianter en ekte datakilde.
--    NB: GroupSchedule har et eget, urelatert kind-felt (SAMLING/HELDAGSSAMLING).
ALTER TABLE groups ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'adhoc';
