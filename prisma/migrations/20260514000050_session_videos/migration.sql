CREATE TABLE "session_videos" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "coachId" TEXT NOT NULL,
  "bookingId" TEXT,
  "title" TEXT NOT NULL,
  "videoUrl" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "durationSec" INTEGER,
  "sizeBytes" INTEGER,
  "tag" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'READY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "session_videos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "session_videos_playerId_createdAt_idx"
  ON "session_videos"("playerId", "createdAt");
CREATE INDEX "session_videos_coachId_createdAt_idx"
  ON "session_videos"("coachId", "createdAt");

ALTER TABLE "session_videos"
  ADD CONSTRAINT "session_videos_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "session_videos"
  ADD CONSTRAINT "session_videos_coachId_fkey"
  FOREIGN KEY ("coachId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
