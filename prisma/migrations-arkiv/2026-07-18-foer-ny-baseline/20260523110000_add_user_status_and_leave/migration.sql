-- P14: Permisjon/skade-modell + return-to-play

CREATE TYPE "UserStatus" AS ENUM ('AKTIV', 'PERMISJON', 'SKADET', 'INAKTIV');
CREATE TYPE "LeaveReason" AS ENUM ('SKADE', 'SYKDOM', 'REISE', 'JOBB', 'STUDIER', 'ANNET');

ALTER TABLE public.users
  ADD COLUMN "userStatus" "UserStatus" NOT NULL DEFAULT 'AKTIV';
CREATE INDEX "users_userStatus_idx" ON public.users("userStatus");

CREATE TABLE "leaves" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reason" "LeaveReason" NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3),
  "description" TEXT,
  "isInjury" BOOLEAN NOT NULL DEFAULT false,
  "rehabPlan" JSONB,
  "returnedAt" TIMESTAMP(3),
  "notifiedCoach" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "leaves_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "leaves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "leaves_userId_startAt_idx" ON "leaves"("userId", "startAt");
CREATE INDEX "leaves_userId_endAt_idx" ON "leaves"("userId", "endAt");

ALTER TABLE "leaves" ENABLE ROW LEVEL SECURITY;
