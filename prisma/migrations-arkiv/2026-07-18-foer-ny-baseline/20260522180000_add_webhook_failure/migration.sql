-- CreateTable
CREATE TABLE "webhook_failures" (
    "id" TEXT NOT NULL,
    "webhookSource" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_failures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_failures_eventId_key" ON "webhook_failures"("eventId");

-- CreateIndex
CREATE INDEX "webhook_failures_status_lastAttemptAt_idx" ON "webhook_failures"("status", "lastAttemptAt");
