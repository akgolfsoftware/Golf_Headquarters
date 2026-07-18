-- DrillChallenge + ChallengeParticipant (M14)
CREATE TABLE "drill_challenges" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "drillId" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "startAt" TIMESTAMP(3),
  "endAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "drill_challenges_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "drill_challenges_ownerId_status_idx" ON "drill_challenges"("ownerId", "status");
CREATE INDEX "drill_challenges_endAt_idx" ON "drill_challenges"("endAt");
ALTER TABLE "drill_challenges"
  ADD CONSTRAINT "drill_challenges_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "challenge_participants" (
  "id" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "score" DOUBLE PRECISION,
  "rank" INTEGER,
  "notes" TEXT,
  CONSTRAINT "challenge_participants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "challenge_participants_challengeId_userId_key"
  ON "challenge_participants"("challengeId", "userId");
CREATE INDEX "challenge_participants_userId_idx" ON "challenge_participants"("userId");
ALTER TABLE "challenge_participants"
  ADD CONSTRAINT "challenge_participants_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "drill_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "challenge_participants"
  ADD CONSTRAINT "challenge_participants_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- EquipmentBag (M18)
CREATE TABLE "equipment_bags" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "driver" TEXT,
  "fairwayWoods" TEXT,
  "hybrids" TEXT,
  "irons" TEXT,
  "wedges" TEXT,
  "putter" TEXT,
  "ball" TEXT,
  "bag" TEXT,
  "notes" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "equipment_bags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "equipment_bags_userId_key" ON "equipment_bags"("userId");
ALTER TABLE "equipment_bags"
  ADD CONSTRAINT "equipment_bags_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- GroupSchedule (Bonus)
CREATE TABLE "group_schedules" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "location" TEXT,
  "recurring" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "group_schedules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "group_schedules_groupId_startAt_idx" ON "group_schedules"("groupId", "startAt");
ALTER TABLE "group_schedules"
  ADD CONSTRAINT "group_schedules_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
