-- Additive provenance for newly calculated AK Golf SG; legacy rows remain null.
ALTER TABLE public.rounds
  ADD COLUMN IF NOT EXISTS "sgModelVersionId" uuid;
