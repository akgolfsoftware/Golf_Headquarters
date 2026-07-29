-- AiMemory: persistert nøkkel/verdi-minne per bruker for AI-agenter (Spor 3).
-- Erstatter in-memory-stubben i src/lib/ai/memory.ts.

CREATE TABLE "ai_memory" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "key"       TEXT NOT NULL,
  "value"     TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ai_memory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_memory_userId_key_key" ON "ai_memory"("userId", "key");

ALTER TABLE "ai_memory"
  ADD CONSTRAINT "ai_memory_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ai_memory" ENABLE ROW LEVEL SECURITY;
