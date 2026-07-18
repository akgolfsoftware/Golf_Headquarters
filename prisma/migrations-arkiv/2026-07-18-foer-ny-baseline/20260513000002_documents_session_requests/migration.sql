-- Fase 1.17: Document + SessionRequest + RLS
-- Applied: 2026-05-13 via psql

CREATE TABLE "documents" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "userId"    TEXT,
  "title"     TEXT NOT NULL,
  "url"       TEXT NOT NULL,
  "kind"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "documents_userId_kind_idx" ON "documents"("userId", "kind");

CREATE TABLE "session_requests" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "userId"      TEXT NOT NULL,
  "coachId"     TEXT,
  "preferredAt" TIMESTAMP(3),
  "pyramidArea" TEXT,
  "notes"       TEXT,
  "status"      TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "session_requests_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "session_requests_userId_status_idx" ON "session_requests"("userId", "status");

-- RLS
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session_requests" ENABLE ROW LEVEL SECURITY;

-- Globale dokumenter (userId IS NULL) er synlige for alle authenticated.
-- Person-spesifikke dokumenter er kun synlige for eier + ADMIN/COACH.
CREATE POLICY "documents_select" ON "documents"
  FOR SELECT USING (
    "userId" IS NULL OR
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "documents"."userId" OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

-- Kun ADMIN skriver dokumenter.
CREATE POLICY "documents_admin_write" ON "documents"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" = 'ADMIN'
    )
  );

CREATE POLICY "session_requests_select" ON "session_requests"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "session_requests"."userId"
             OR "users"."id" = "session_requests"."coachId"
             OR "users"."role" IN ('ADMIN','COACH'))
    )
  );

CREATE POLICY "session_requests_write" ON "session_requests"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND ("users"."id" = "session_requests"."userId" OR "users"."role" IN ('ADMIN','COACH'))
    )
  );
