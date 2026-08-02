-- Lydsamtykke: lagre hash av magisk lenke (ikke rå token) — 2026-08-01.
-- Additivt og idempotent. Kjør kirurgisk mot DIRECT_URL.

ALTER TABLE lyd_samtykker ADD COLUMN IF NOT EXISTS "tokenHash" text;
CREATE UNIQUE INDEX IF NOT EXISTS "lyd_samtykker_tokenHash_key" ON lyd_samtykker("tokenHash");
