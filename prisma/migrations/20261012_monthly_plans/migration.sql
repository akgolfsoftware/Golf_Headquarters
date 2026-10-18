-- Additiv record. Root kontrollerer prosjekt/miljø og kjører bare dette tillegget.
-- Ikke migrate dev / db push / migrate deploy mot den hostede basen.
CREATE TABLE IF NOT EXISTS public.monthly_plans (
  id TEXT PRIMARY KEY,
  "playerId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  "groupId" TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 9998),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  details JSONB,
  "proposedDetails" JSONB,
  "proposedBy" TEXT,
  "proposalBaseActiveRevision" INTEGER,
  "playerEvaluation" JSONB,
  "coachEvaluation" JSONB,
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  "activeRevision" INTEGER NOT NULL DEFAULT 0 CHECK ("activeRevision" >= 0),
  "lastRequestId" TEXT,
  "lastRequestHash" TEXT,
  "createdBy" TEXT NOT NULL,
  "updatedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT monthly_plans_exclusive_owner CHECK (("playerId" IS NOT NULL) <> ("groupId" IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS "monthly_plans_playerId_year_month_key" ON public.monthly_plans("playerId", year, month);
CREATE UNIQUE INDEX IF NOT EXISTS "monthly_plans_groupId_year_month_key" ON public.monthly_plans("groupId", year, month);
ALTER TABLE public.monthly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_plans FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.monthly_plans FROM PUBLIC, anon, authenticated;
-- Ingen offentlig Data API-policy. Kun appens bevoktede serverhandlinger.
