-- Meg tilbakeskrivings-pipeline: legg til destilled_at-kolonne i me_log.
-- Kjør én gang via Supabase SQL Editor for Meg-prosjektet.
ALTER TABLE me_log ADD COLUMN IF NOT EXISTS destilled_at TIMESTAMPTZ;

CREATE INDEX CONCURRENTLY IF NOT EXISTS me_log_destilled_null_idx
  ON me_log (created_at)
  WHERE destilled_at IS NULL;
