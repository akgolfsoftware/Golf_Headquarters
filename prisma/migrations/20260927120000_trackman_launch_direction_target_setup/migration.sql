-- Additive record only. Apply separately against the authorized database via
-- the project's guarded db-execute procedure; do not use migrate deploy.
ALTER TABLE "trackman_sessions"
  ADD COLUMN IF NOT EXISTS "targetLineStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN IF NOT EXISTS "targetDistanceM" DOUBLE PRECISION;

ALTER TABLE "trackman_shots"
  ADD COLUMN IF NOT EXISTS "launchDirection" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "targetDistanceM" DOUBLE PRECISION;
