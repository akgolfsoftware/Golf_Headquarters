-- Fase 3.3: Lead-modell for marketing-funnel
-- Applied: 2026-05-14 via psql

CREATE TABLE "leads" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "email"     TEXT NOT NULL,
  "name"      TEXT,
  "source"    TEXT,
  "status"    TEXT NOT NULL DEFAULT 'NEW',
  "metadata"  JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "leads_email_idx" ON "leads"("email");
CREATE INDEX "leads_source_status_idx" ON "leads"("source", "status");

-- RLS: kun ADMIN/COACH leser. Public POST via /api/lead bypasser RLS via service-role (Prisma).
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_admin_select" ON "leads"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "users"
      WHERE "users"."authId" = (auth.uid())::text
        AND "users"."role" IN ('ADMIN', 'COACH')
    )
  );
