-- Recording V1: chunked upload + booking-kobling + AI-analyse-felter.
-- AlterTable
ALTER TABLE "session_recordings" DROP COLUMN "duration",
ADD COLUMN     "aiAnalysis" JSONB,
ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "chunks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "durationSec" INTEGER,
ADD COLUMN     "notionPageId" TEXT,
ADD COLUMN     "playerId" TEXT,
ADD COLUMN     "retentionUntil" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "audioUrl" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'RECORDING';

-- CreateIndex
CREATE INDEX "session_recordings_bookingId_idx" ON "session_recordings"("bookingId");

-- CreateIndex
CREATE INDEX "session_recordings_playerId_createdAt_idx" ON "session_recordings"("playerId", "createdAt");

-- AddForeignKey
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_recordings" ADD CONSTRAINT "session_recordings_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
