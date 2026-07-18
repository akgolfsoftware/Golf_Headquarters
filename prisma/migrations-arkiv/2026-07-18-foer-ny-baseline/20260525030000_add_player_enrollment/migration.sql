-- Program-enrollering: kobler spiller til coaching-program + coach.
-- Støtter mange-til-mange (spiller kan tilhøre flere program simultant).
-- PLATFORM_ONLY har coach_id = null og er usynlig i CoachHQ.
-- Historikk beholdes ved ended_at — spiller slettes aldri fra systemet.

CREATE TYPE "PlayerProgram" AS ENUM (
  'WANG_TOPPIDRETT',
  'WANG_UNG',
  'GFGK_MINI',
  'GFGK_BREDDE',
  'GFGK_JENTER',
  'GFGK_ELITE',
  'AK_ACADEMY',
  'AK_ACADEMY_JUNIOR',
  'PLATFORM_ONLY'
);

CREATE TABLE "player_enrollments" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "program"     "PlayerProgram" NOT NULL,
  "coachId"     TEXT,
  "enrolledAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt"     TIMESTAMP(3),
  "notes"       TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "player_enrollments_pkey" PRIMARY KEY ("id")
);

-- Referanser
ALTER TABLE "player_enrollments"
  ADD CONSTRAINT "player_enrollments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "player_enrollments"
  ADD CONSTRAINT "player_enrollments_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indekser for CoachHQ-filtrering (aktive enrolleringer per spiller/coach/program)
CREATE INDEX "player_enrollments_userId_endedAt_idx"  ON "player_enrollments"("userId", "endedAt");
CREATE INDEX "player_enrollments_coachId_endedAt_idx" ON "player_enrollments"("coachId", "endedAt");
CREATE INDEX "player_enrollments_program_endedAt_idx" ON "player_enrollments"("program", "endedAt");
