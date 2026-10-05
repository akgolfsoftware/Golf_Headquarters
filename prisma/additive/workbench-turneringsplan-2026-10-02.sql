-- Additiv planmetadata. Eksisterende rader, RLS, rettigheter og runder bevares.
ALTER TABLE public.workbench_tournament_plans
  ADD COLUMN IF NOT EXISTS tour text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS holes integer,
  ADD COLUMN IF NOT EXISTS priority text,
  ADD COLUMN IF NOT EXISTS "wagrPower" double precision,
  ADD COLUMN IF NOT EXISTS "wagrSourceYear" integer,
  ADD COLUMN IF NOT EXISTS "wagrSource" text;
