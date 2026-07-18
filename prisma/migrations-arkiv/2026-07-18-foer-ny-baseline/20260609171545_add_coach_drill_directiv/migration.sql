-- F2: coach-direktiv på en drill for én spiller (PIN/BLOCK/PRIORITER).
-- KUN additiv: ny enum + ny tabell + FK + RLS. Rører ingen eksisterende tabell.

-- CreateEnum
CREATE TYPE "CoachDirektivType" AS ENUM ('PIN', 'BLOCK', 'PRIORITER');

-- CreateTable
CREATE TABLE "coach_drill_directiv" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "type" "CoachDirektivType" NOT NULL,
    "kommentar" TEXT,
    "gyldigTil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_drill_directiv_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_drill_directiv_userId_idx" ON "coach_drill_directiv"("userId");
CREATE INDEX "coach_drill_directiv_coachId_idx" ON "coach_drill_directiv"("coachId");
CREATE INDEX "coach_drill_directiv_drillId_idx" ON "coach_drill_directiv"("drillId");
CREATE UNIQUE INDEX "coach_drill_directiv_coachId_userId_drillId_type_key" ON "coach_drill_directiv"("coachId", "userId", "drillId", "type");

-- AddForeignKey
ALTER TABLE "coach_drill_directiv" ADD CONSTRAINT "coach_drill_directiv_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coach_drill_directiv" ADD CONSTRAINT "coach_drill_directiv_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coach_drill_directiv" ADD CONSTRAINT "coach_drill_directiv_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "exercise_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable RLS (deny-all): Prisma service-role bypasser; anon/authenticated DENY.
ALTER TABLE "coach_drill_directiv" ENABLE ROW LEVEL SECURITY;
