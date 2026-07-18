-- Fase 1.14: Goal, Achievement, Friendship + RLS
-- Applied: 2026-05-13 via psql

CREATE TABLE "goals" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "userId"      TEXT NOT NULL,
  "type"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "targetValue" DOUBLE PRECISION,
  "targetDate"  TIMESTAMP(3),
  "status"      TEXT NOT NULL DEFAULT 'ACTIVE',
  "payload"     JSONB,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "goals_userId_status_idx" ON "goals"("userId", "status");

CREATE TABLE "achievements" (
  "id"       TEXT NOT NULL PRIMARY KEY,
  "userId"   TEXT NOT NULL,
  "kind"     TEXT NOT NULL,
  "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload"  JSONB,
  CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "achievements_userId_kind_key" ON "achievements"("userId", "kind");
CREATE INDEX "achievements_userId_earnedAt_idx" ON "achievements"("userId", "earnedAt");

CREATE TABLE "friendships" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userAId"   TEXT NOT NULL,
  "userBId"   TEXT NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "friendships_userAId_fkey" FOREIGN KEY ("userAId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "friendships_userBId_fkey" FOREIGN KEY ("userBId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "friendships_userAId_userBId_key" ON "friendships"("userAId", "userBId");

-- RLS
ALTER TABLE "goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "friendships" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_select" ON "goals"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "goals"."userId" OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

CREATE POLICY "goals_write" ON "goals"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "goals"."userId" OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

CREATE POLICY "achievements_select" ON "achievements"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "achievements"."userId" OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

-- Achievements opprettes av agenter — leverte via prisma som bypasser RLS.

CREATE POLICY "friendships_select" ON "friendships"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "friendships"."userAId"
             OR "users"."id" = "friendships"."userBId"
             OR "users"."role" = 'ADMIN')
    )
  );

CREATE POLICY "friendships_write" ON "friendships"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "friendships"."userAId" OR "users"."role" = 'ADMIN')
    )
  );
