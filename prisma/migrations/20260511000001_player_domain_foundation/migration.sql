-- Fase 1.5: PlayerHQ-domene foundation
-- Applied: 2026-05-11 via psql (Supabase MCP nede)
--
-- Oppretter 9 nye tabeller + 4 enums for trenings-, mål- og abonnement-domenet.
-- RLS-policies legges til i 20260511000002_player_domain_rls.

-- ---------- Enums ----------

CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'SKIPPED', 'CANCELLED');
CREATE TYPE "PyramidArea" AS ENUM ('FYS', 'TEK', 'SLAG', 'SPILL', 'TURN');
CREATE TYPE "LPhase" AS ENUM ('KROPP', 'ARM', 'KOLLE', 'BALL', 'AUTO');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING');

-- ---------- Trenings-domenet ----------

CREATE TABLE "training_plans" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "userId"      TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "startDate"   TIMESTAMP(3) NOT NULL,
  "endDate"     TIMESTAMP(3),
  "isActive"    BOOLEAN NOT NULL DEFAULT TRUE,
  "createdById" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_plans_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "training_plans_userId_isActive_idx" ON "training_plans"("userId", "isActive");

CREATE TABLE "training_plan_sessions" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "planId"      TEXT NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "durationMin" INTEGER NOT NULL,
  "title"       TEXT NOT NULL,
  "rationale"   TEXT,
  "pyramidArea" "PyramidArea" NOT NULL,
  "status"      "SessionStatus" NOT NULL DEFAULT 'PLANNED',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "training_plan_sessions_planId_fkey" FOREIGN KEY ("planId")
    REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "training_plan_sessions_planId_scheduledAt_idx" ON "training_plan_sessions"("planId", "scheduledAt");

CREATE TABLE "exercise_definitions" (
  "id"              TEXT NOT NULL PRIMARY KEY,
  "name"            TEXT NOT NULL,
  "description"     TEXT,
  "videoUrl"        TEXT,
  "pyramidArea"     "PyramidArea" NOT NULL,
  "lPhase"          "LPhase" NOT NULL,
  "defaultRepsSets" TEXT,
  "csMin"           INTEGER,
  "csMax"           INTEGER,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "exercise_definitions_pyramidArea_idx" ON "exercise_definitions"("pyramidArea");

CREATE TABLE "session_drills" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "sessionId"  TEXT NOT NULL,
  "exerciseId" TEXT NOT NULL,
  "repsSets"   TEXT NOT NULL,
  "csTarget"   INTEGER,
  "notes"      TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "session_drills_sessionId_fkey" FOREIGN KEY ("sessionId")
    REFERENCES "training_plan_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "session_drills_exerciseId_fkey" FOREIGN KEY ("exerciseId")
    REFERENCES "exercise_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "session_drills_sessionId_idx" ON "session_drills"("sessionId");

CREATE TABLE "training_plan_session_logs" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "sessionId"   TEXT NOT NULL UNIQUE,
  "startedAt"   TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "csAchieved"  INTEGER,
  "notes"       TEXT,
  "rating"      INTEGER,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "training_plan_session_logs_sessionId_fkey" FOREIGN KEY ("sessionId")
    REFERENCES "training_plan_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ---------- Mål-domenet ----------

CREATE TABLE "course_definitions" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "name"      TEXT NOT NULL,
  "par"       INTEGER NOT NULL,
  "rating"    DOUBLE PRECISION,
  "slope"     INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "rounds" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "courseId"  TEXT NOT NULL,
  "playedAt"  TIMESTAMP(3) NOT NULL,
  "score"     INTEGER NOT NULL,
  "sgTotal"   DOUBLE PRECISION,
  "sgOtt"     DOUBLE PRECISION,
  "sgApp"     DOUBLE PRECISION,
  "sgArg"     DOUBLE PRECISION,
  "sgPutt"    DOUBLE PRECISION,
  "notes"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rounds_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "rounds_courseId_fkey" FOREIGN KEY ("courseId")
    REFERENCES "course_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "rounds_userId_playedAt_idx" ON "rounds"("userId", "playedAt");

CREATE TABLE "test_definitions" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "pyramidArea" "PyramidArea" NOT NULL,
  "scoringRule" TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "test_results" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "testId"    TEXT NOT NULL,
  "takenAt"   TIMESTAMP(3) NOT NULL,
  "score"     DOUBLE PRECISION NOT NULL,
  "notes"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "test_results_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "test_results_testId_fkey" FOREIGN KEY ("testId")
    REFERENCES "test_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "test_results_userId_takenAt_idx" ON "test_results"("userId", "takenAt");

CREATE TABLE "trackman_sessions" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "userId"     TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL,
  "source"     TEXT NOT NULL,
  "shotCount"  INTEGER NOT NULL DEFAULT 0,
  "rawJson"    JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "trackman_sessions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "trackman_sessions_userId_recordedAt_idx" ON "trackman_sessions"("userId", "recordedAt");

-- ---------- Abonnement-domenet ----------

CREATE TABLE "subscriptions" (
  "id"                   TEXT NOT NULL PRIMARY KEY,
  "userId"               TEXT NOT NULL UNIQUE,
  "tier"                 "Tier" NOT NULL DEFAULT 'GRATIS',
  "status"               "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "currentPeriodEnd"     TIMESTAMP(3),
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripeCustomerId"     TEXT,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
