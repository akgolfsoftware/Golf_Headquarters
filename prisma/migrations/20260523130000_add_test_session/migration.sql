CREATE TYPE "TestSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABORTED');

CREATE TABLE "test_sessions" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "testId" TEXT NOT NULL REFERENCES "test_definitions"("id"),
  "status" "TestSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
  "scoringData" JSONB NOT NULL DEFAULT '{}',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMP(3),
  "abortedAt" TIMESTAMP(3),
  "testResultId" TEXT
);

CREATE INDEX "test_sessions_userId_status_idx" ON "test_sessions"("userId", "status");
CREATE INDEX "test_sessions_testId_status_idx" ON "test_sessions"("testId", "status");
