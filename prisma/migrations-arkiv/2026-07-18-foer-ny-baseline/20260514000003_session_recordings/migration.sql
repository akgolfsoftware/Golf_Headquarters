-- Fase 2.9: SessionRecording for coaching-opptak
-- Applied: 2026-05-14 via psql

CREATE TABLE "session_recordings" (
  "id"           TEXT NOT NULL PRIMARY KEY,
  "sessionId"    TEXT,
  "uploadedById" TEXT NOT NULL,
  "audioUrl"     TEXT NOT NULL,
  "transcript"   TEXT,
  "duration"     INTEGER,
  "status"       TEXT NOT NULL DEFAULT 'PROCESSING',
  "deepgramId"   TEXT,
  "notes"        TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL
);
CREATE INDEX "session_recordings_uploadedById_createdAt_idx" ON "session_recordings"("uploadedById", "createdAt");

-- RLS: kun ADMIN/COACH skriver. Spilleren kan lese hvis sessionId tilhører dem.
ALTER TABLE "session_recordings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_recordings_select" ON "session_recordings"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "session_recordings"."uploadedById"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

CREATE POLICY "session_recordings_write" ON "session_recordings"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN','COACH')
    )
  );
