-- Team Norway testdag — additiv DDL, KUN reviewgrunnlag.
-- IKKE kjørt mot noen database (hosted, WANG eller den isolerte HQ-P0-
-- demostacken). Speiler nøyaktig `prisma/schema.prisma` (TestDay,
-- TestDayParticipant) slik en `prisma migrate dev`/`db push` ville generert
-- den, for at Codex/Anders kan lese den faktiske referanseintegriteten uten
-- å kjøre kommandoen selv. Se docs/design-audit/team-norway-testdag-
-- modellforslag-2026-09-14.md for begrunnelse.
--
-- Anvendelse (når/hvis avstemt): KUN mot en avstemt, tom, isolert lokal
-- testdatabase (jf. docs/utvikling/lokal-testdatabase.md) — aldri hosted,
-- WANG (54321/54322) eller den kjørende HQ-P0-demostacken (54421/54422,
-- 3011-reserven med det beviste 49-slag-resultatet).

CREATE TYPE "TestDayStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TestDayParticipantStatus" AS ENUM ('PENDING', 'DONE', 'SKIPPED', 'ABSENT');

CREATE TABLE "test_days" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "testDefinitionId" TEXT NOT NULL,
    "status" "TestDayStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_days_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "test_days_groupId_status_idx" ON "test_days"("groupId", "status");
CREATE INDEX "test_days_coachId_idx" ON "test_days"("coachId");

ALTER TABLE "test_days" ADD CONSTRAINT "test_days_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_days" ADD CONSTRAINT "test_days_coachId_fkey"
    FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_days" ADD CONSTRAINT "test_days_testDefinitionId_fkey"
    FOREIGN KEY ("testDefinitionId") REFERENCES "test_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "test_day_participants" (
    "id" TEXT NOT NULL,
    "testDayId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "TestDayParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "sessionId" TEXT,
    "resultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_day_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "test_day_participants_sessionId_key" ON "test_day_participants"("sessionId");
CREATE UNIQUE INDEX "test_day_participants_resultId_key" ON "test_day_participants"("resultId");
CREATE UNIQUE INDEX "test_day_participants_testDayId_playerId_key" ON "test_day_participants"("testDayId", "playerId");
CREATE UNIQUE INDEX "test_day_participants_testDayId_order_key" ON "test_day_participants"("testDayId", "order");
CREATE INDEX "test_day_participants_testDayId_status_idx" ON "test_day_participants"("testDayId", "status");
CREATE INDEX "test_day_participants_playerId_idx" ON "test_day_participants"("playerId");

ALTER TABLE "test_day_participants" ADD CONSTRAINT "test_day_participants_testDayId_fkey"
    FOREIGN KEY ("testDayId") REFERENCES "test_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_day_participants" ADD CONSTRAINT "test_day_participants_playerId_fkey"
    FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "test_day_participants" ADD CONSTRAINT "test_day_participants_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "test_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "test_day_participants" ADD CONSTRAINT "test_day_participants_resultId_fkey"
    FOREIGN KEY ("resultId") REFERENCES "test_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Trenerføring (samme leveranse, egen additiv kolonne — ikke ny tabell):
ALTER TABLE "test_results" ADD COLUMN "recordedById" TEXT;
CREATE INDEX "test_results_recordedById_idx" ON "test_results"("recordedById");
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_recordedById_fkey"
    FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
