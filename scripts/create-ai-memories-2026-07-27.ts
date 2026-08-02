/**
 * Additiv DDL: ai_memories — spillerminne for AI-agentene (pgvector).
 * Gotcha: `prisma migrate dev`/`db push` er blokkert — kirurgisk DDL mot
 * DIRECT_URL (se .claude/rules/gotchas.md). Idempotent.
 *
 * Episodisk (hva skjedde) / semantisk (hva vi vet om spilleren) / prosedyrisk
 * (hva som virker for denne spilleren). FK → users med ON DELETE CASCADE:
 * sletting av bruker fjerner alt minne (GDPR). RLS på uten policies — tabellen
 * leses kun server-side via Prisma.
 *
 *   npx tsx scripts/create-ai-memories-2026-07-27.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(
    `CREATE EXTENSION IF NOT EXISTS vector;`,
  );
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ai_memories (
      id           text PRIMARY KEY,
      "playerId"   text NOT NULL,
      kind         text NOT NULL CHECK (kind IN ('EPISODIC','SEMANTIC','PROCEDURAL')),
      content      text NOT NULL,
      metadata     jsonb NOT NULL DEFAULT '{}',
      embedding    vector(1536),
      "sourceType" text NOT NULL,
      "sourceId"   text,
      strength     double precision NOT NULL DEFAULT 1,
      "createdAt"  timestamptz NOT NULL DEFAULT now(),
      "updatedAt"  timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT ai_memories_player_fk FOREIGN KEY ("playerId")
        REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS ai_memories_player_kind_idx ON ai_memories ("playerId", kind, "updatedAt");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS ai_memories_embedding_idx
       ON ai_memories USING hnsw (embedding vector_cosine_ops);`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;`,
  );

  console.log("ai_memories opprettet (tabell + indekser + RLS).");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
