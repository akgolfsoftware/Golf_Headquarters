-- Retting av produksjonsdatabasen 07.10.2026.
-- Kjøres med: npx prisma db execute --file scripts/db-retting-2026-10-07.sql
--
-- Del 1: additive tillegg som schema.prisma har, men databasen manglet. Funnet med
--   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma
-- Bare CREATE/ADD med IF NOT EXISTS. Ingen DROP, ingen typeendring, ingen nye
-- fremmednøkler på eksisterende tabeller (resten av diffen står til egen vurdering).
--
-- Del 2: fjerner Notion-koblingen «Tasks» (data source b0f3f0f6-…), som ikke var
-- delt med integrasjonen og feilet hvert femte minutt. Anders 07.10: «Ta bort».
--
-- Alt i én transaksjon: enten går alt gjennom, eller ingenting. Trygt å kjøre to ganger.
BEGIN;

-- Del 1 ---------------------------------------------------------------------

ALTER TABLE "test_days" ADD COLUMN IF NOT EXISTS "eventId" TEXT;
ALTER TABLE "test_days" ADD COLUMN IF NOT EXISTS "stationName" TEXT;

ALTER TABLE "workbench_tournament_plans" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "workbench_tournament_plans" ADD COLUMN IF NOT EXISTS "holes" INTEGER;
ALTER TABLE "workbench_tournament_plans" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "workbench_tournament_plans" ADD COLUMN IF NOT EXISTS "priority" TEXT;
ALTER TABLE "workbench_tournament_plans" ADD COLUMN IF NOT EXISTS "tour" TEXT;
ALTER TABLE "workbench_tournament_plans" ADD COLUMN IF NOT EXISTS "wagrPower" DOUBLE PRECISION;
ALTER TABLE "workbench_tournament_plans" ADD COLUMN IF NOT EXISTS "wagrSource" TEXT;
ALTER TABLE "workbench_tournament_plans" ADD COLUMN IF NOT EXISTS "wagrSourceYear" INTEGER;

CREATE TABLE IF NOT EXISTS "test_shots" (
    "id" TEXT NOT NULL,
    "testResultId" TEXT NOT NULL,
    "shotNumber" INTEGER NOT NULL,
    "pei" DOUBLE PRECISION,
    "sg" DOUBLE PRECISION,
    "pgaPutts" DOUBLE PRECISION,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "retning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_shots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "test_shots_testResultId_fkey" FOREIGN KEY ("testResultId") REFERENCES "test_results"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "test_shots_testResultId_shotNumber_idx" ON "test_shots"("testResultId", "shotNumber");

CREATE TABLE IF NOT EXISTS "test_session_photos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testSessionId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_session_photos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "test_session_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "test_session_photos_testSessionId_fkey" FOREIGN KEY ("testSessionId") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "test_session_photos_storagePath_key" ON "test_session_photos"("storagePath");
CREATE INDEX IF NOT EXISTS "test_session_photos_userId_createdAt_idx" ON "test_session_photos"("userId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "test_session_photos_testSessionId_attemptNumber_key" ON "test_session_photos"("testSessionId", "attemptNumber");

CREATE TABLE IF NOT EXISTS "test_day_events" (
    "id" TEXT NOT NULL,
    "organizerGroupId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "TestDayStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "test_day_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "test_day_events_organizerGroupId_fkey" FOREIGN KEY ("organizerGroupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "test_day_events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "test_day_events_organizerGroupId_status_idx" ON "test_day_events"("organizerGroupId", "status");
CREATE INDEX IF NOT EXISTS "test_day_events_organizerId_idx" ON "test_day_events"("organizerId");
CREATE INDEX IF NOT EXISTS "test_day_events_scheduledAt_idx" ON "test_day_events"("scheduledAt");
CREATE INDEX IF NOT EXISTS "test_days_eventId_idx" ON "test_days"("eventId");

CREATE TABLE IF NOT EXISTS "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "corpus" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT,
    "section" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relevance" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "knowledge_chunks_corpus_idx" ON "knowledge_chunks"("corpus");

CREATE TABLE IF NOT EXISTS "ai_memories" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "embedding" vector(1536),
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_memories_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ai_memories_playerId_kind_updatedAt_idx" ON "ai_memories"("playerId", "kind", "updatedAt");

CREATE TABLE IF NOT EXISTS "jarvis_innstillinger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kanalGmail" BOOLEAN NOT NULL DEFAULT true,
    "kanalImessage" BOOLEAN NOT NULL DEFAULT true,
    "kanalTelegram" BOOLEAN NOT NULL DEFAULT true,
    "kanalAnrop" BOOLEAN NOT NULL DEFAULT true,
    "kanalKalender" BOOLEAN NOT NULL DEFAULT true,
    "slaTerskelTimer" INTEGER NOT NULL DEFAULT 6,
    "stemmeAktivert" BOOLEAN NOT NULL DEFAULT true,
    "stilleTidsromAktivert" BOOLEAN NOT NULL DEFAULT true,
    "oppdatert" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "jarvis_innstillinger_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "jarvis_innstillinger_userId_key" ON "jarvis_innstillinger"("userId");

-- Del 2 ---------------------------------------------------------------------

DELETE FROM "notion_database_links"
WHERE "notionDatabaseId" = '1781b48bdc1a4f8fbd2c38cb10af6220';

COMMIT;
