-- Runde/SG metadata for source, status and data quality.
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "sourceDate" TIMESTAMP(3);
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "dataQuality" TEXT;
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "partialSave" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "importMetadata" JSONB;

CREATE INDEX IF NOT EXISTS "rounds_userId_status_idx" ON "rounds"("userId", "status");
CREATE INDEX IF NOT EXISTS "rounds_source_idx" ON "rounds"("source");
