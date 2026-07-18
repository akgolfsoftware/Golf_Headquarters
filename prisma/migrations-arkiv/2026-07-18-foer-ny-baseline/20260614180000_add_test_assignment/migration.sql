-- CreateEnum
CREATE TYPE "TestAssignmentStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "test_assignments" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "note" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "TestAssignmentStatus" NOT NULL DEFAULT 'OPEN',
    "completedResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_assignments_playerId_status_idx" ON "test_assignments"("playerId", "status");

-- CreateIndex
CREATE INDEX "test_assignments_coachId_status_idx" ON "test_assignments"("coachId", "status");

-- CreateIndex
CREATE INDEX "test_assignments_testId_idx" ON "test_assignments"("testId");

-- AddForeignKey
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_testId_fkey" FOREIGN KEY ("testId") REFERENCES "test_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
