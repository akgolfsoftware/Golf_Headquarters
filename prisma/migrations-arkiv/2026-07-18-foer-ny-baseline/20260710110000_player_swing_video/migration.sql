-- F3 scaffold: spiller-sentrisk swing-video + analyse (overnight W6)

CREATE TABLE "player_swing_videos" (
  "id"              TEXT NOT NULL,
  "userId"          TEXT NOT NULL,
  "liveSessionId"   TEXT,
  "liveSessionKind" TEXT,
  "videoUrl"        TEXT NOT NULL,
  "storagePath"     TEXT,
  "drillId"         TEXT,
  "status"          TEXT NOT NULL DEFAULT 'PROCESSING',
  "consentVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "player_swing_videos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "player_swing_videos_userId_createdAt_idx"
  ON "player_swing_videos"("userId", "createdAt");

ALTER TABLE "player_swing_videos"
  ADD CONSTRAINT "player_swing_videos_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "swing_analyses" (
  "id"             TEXT NOT NULL,
  "videoId"        TEXT NOT NULL,
  "status"         TEXT NOT NULL DEFAULT 'PENDING',
  "positions"      JSONB,
  "trackManShotId" TEXT,
  "summary"        TEXT,
  "confidence"     DOUBLE PRECISION,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "swing_analyses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "swing_analyses_videoId_key" ON "swing_analyses"("videoId");

ALTER TABLE "swing_analyses"
  ADD CONSTRAINT "swing_analyses_videoId_fkey"
  FOREIGN KEY ("videoId") REFERENCES "player_swing_videos"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "player_swing_videos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "swing_analyses" ENABLE ROW LEVEL SECURITY;