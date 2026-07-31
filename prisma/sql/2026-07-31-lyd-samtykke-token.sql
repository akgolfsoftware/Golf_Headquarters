-- Lydsamtykke: magisk lenke til foresatt (2026-07-31).
-- Additivt og idempotent. Kjør kirurgisk mot DIRECT_URL — ikke migrate dev/db push.
-- Se .claude/rules/gotchas.md §Schema-endringer.

ALTER TABLE lyd_samtykker ADD COLUMN IF NOT EXISTS token text;
ALTER TABLE lyd_samtykker ADD COLUMN IF NOT EXISTS "tokenExpiresAt" timestamp(3);
CREATE UNIQUE INDEX IF NOT EXISTS "lyd_samtykker_token_key" ON lyd_samtykker(token);
