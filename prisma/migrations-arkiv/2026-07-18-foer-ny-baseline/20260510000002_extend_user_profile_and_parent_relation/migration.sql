-- Fase 1.2: User-profil-utvidelse + ParentRelation
-- Applied: 2026-05-10 via Supabase MCP

ALTER TABLE "users"
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "avatarUrl" TEXT,
  ADD COLUMN "tier" "Tier" NOT NULL DEFAULT 'GRATIS',
  ADD COLUMN "lastLoginAt" TIMESTAMP(3);

CREATE TABLE "parent_relations" (
  "id" TEXT NOT NULL,
  "parentId" TEXT NOT NULL,
  "childId" TEXT NOT NULL,
  "relationship" TEXT NOT NULL DEFAULT 'Foresatt',
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "parent_relations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "parent_relations_parentId_childId_key" ON "parent_relations"("parentId", "childId");
CREATE INDEX "parent_relations_childId_idx" ON "parent_relations"("childId");

ALTER TABLE "parent_relations" ADD CONSTRAINT "parent_relations_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parent_relations" ADD CONSTRAINT "parent_relations_childId_fkey"
  FOREIGN KEY ("childId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parent_relations" ENABLE ROW LEVEL SECURITY;
