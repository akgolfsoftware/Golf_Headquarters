/**
 * Additiv DDL: knowledge_chunks — RAG-kunnskapsbasen (pgvector). Idempotent.
 * Tabellen ble opprinnelig opprettet 2026-07-19; skriptet gjenskapes i git
 * for reproduserbarhet (forrige versjon gikk tapt ucommittet).
 *
 *   npx tsx scripts/create-knowledge-chunks-2026-07-27.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS knowledge_chunks (
      id          text PRIMARY KEY,
      corpus      text NOT NULL,
      content     text NOT NULL,
      source      text,
      section     text,
      tags        text[] NOT NULL DEFAULT '{}',
      topics      text[] NOT NULL DEFAULT '{}',
      relevance   text[] NOT NULL DEFAULT '{}',
      "wordCount" integer NOT NULL DEFAULT 0,
      embedding   vector(1536),
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS knowledge_chunks_corpus_idx ON knowledge_chunks (corpus);`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
       ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;`,
  );

  console.log("knowledge_chunks på plass (tabell + hnsw-indeks + RLS).");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
