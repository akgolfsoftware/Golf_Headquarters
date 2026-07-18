-- Fase 1.9: CoachingSession (chat-historikk per spiller × coach)
-- Applied: 2026-05-12 via psql

CREATE TABLE "coaching_sessions" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "coachId"   TEXT NOT NULL,
  "messages"  JSONB NOT NULL DEFAULT '[]'::jsonb,
  "kind"      TEXT NOT NULL DEFAULT 'AI',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coaching_sessions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "coaching_sessions_coachId_fkey" FOREIGN KEY ("coachId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "coaching_sessions_userId_updatedAt_idx" ON "coaching_sessions"("userId", "updatedAt");

-- RLS: bruker ser egne, COACH/ADMIN ser alle de er involvert i, ADMIN ser alt
ALTER TABLE "coaching_sessions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaching_sessions_select" ON "coaching_sessions"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "coaching_sessions"."userId"
             OR "users"."id" = "coaching_sessions"."coachId"
             OR "users"."role" = 'ADMIN')
    )
  );

CREATE POLICY "coaching_sessions_insert" ON "coaching_sessions"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "coaching_sessions"."userId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

CREATE POLICY "coaching_sessions_update" ON "coaching_sessions"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "coaching_sessions"."userId"
             OR "users"."id" = "coaching_sessions"."coachId"
             OR "users"."role" = 'ADMIN')
    )
  );
