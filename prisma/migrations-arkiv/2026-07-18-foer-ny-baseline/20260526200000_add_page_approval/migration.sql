-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'MINOR_AVVIK', 'MAJOR_AVVIK', 'SKIP');

-- CreateTable
CREATE TABLE "page_approvals" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "designPath" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_approvals_route_key" ON "page_approvals"("route");

-- CreateIndex
CREATE INDEX "page_approvals_status_idx" ON "page_approvals"("status");
