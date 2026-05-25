-- 1. Enums
CREATE TYPE "ParticipationStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED', 'MAYBE', 'ATTENDED', 'NO_SHOW');
CREATE TYPE "TestVisibility" AS ENUM ('PRIVATE', 'COACH', 'GROUP', 'ACADEMY');

-- 2. Utvid training_sessions_v2
ALTER TABLE "training_sessions_v2"
  ADD COLUMN "isShared" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "hostId" TEXT,
  ADD COLUMN "maxParticipants" INTEGER,
  ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "training_sessions_v2"
  ADD CONSTRAINT "training_sessions_v2_hostId_fkey"
  FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "training_sessions_v2_hostId_idx" ON "training_sessions_v2"("hostId");

-- 3. SessionParticipant
CREATE TABLE "session_participants" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "ParticipationStatus" NOT NULL DEFAULT 'INVITED',
  "joinedAt" TIMESTAMP(3),
  "respondedAt" TIMESTAMP(3),
  "individualNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "session_participants_sessionId_userId_key" ON "session_participants"("sessionId", "userId");
CREATE INDEX "session_participants_userId_status_idx" ON "session_participants"("userId", "status");
CREATE INDEX "session_participants_sessionId_idx" ON "session_participants"("sessionId");
ALTER TABLE "session_participants"
  ADD CONSTRAINT "session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "training_sessions_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "session_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. CoachNote
CREATE TABLE "coach_notes" (
  "id" TEXT NOT NULL,
  "coachId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "title" TEXT,
  "content" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "isPrivate" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coach_notes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "coach_notes_coachId_playerId_createdAt_idx" ON "coach_notes"("coachId", "playerId", "createdAt");
CREATE INDEX "coach_notes_playerId_idx" ON "coach_notes"("playerId");
ALTER TABLE "coach_notes"
  ADD CONSTRAINT "coach_notes_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "coach_notes_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. TestDefinition utvidelser
ALTER TABLE "test_definitions"
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "isCustom" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "visibility" "TestVisibility" NOT NULL DEFAULT 'PRIVATE',
  ADD COLUMN "isCoachApproved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "test_definitions"
  ADD CONSTRAINT "test_definitions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "test_definitions_createdById_isCustom_idx" ON "test_definitions"("createdById", "isCustom");
CREATE INDEX "test_definitions_visibility_isCustom_idx" ON "test_definitions"("visibility", "isCustom");
