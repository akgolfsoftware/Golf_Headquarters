/**
 * Additiv DDL for kunnskapsbasen (RAG) — knowledge_chunks med pgvector.
 * Gotcha: `prisma migrate dev`/`db push` er blokkert i dette repoet (se
 * .claude/rules/gotchas.md) — kirurgisk CREATE TABLE mot DIRECT_URL. Idempotent.
 *
 * pgvector (0.8.2) er allerede installert i public-schema i Supabase-prosjektet.
 * RLS skrus på uten policies: tabellen skal kun leses server-side via Prisma
 * (postgres-rollen omgår RLS) — aldri via PostgREST/klient.
 *
 *   npx tsx scripts/create-knowledge-chunks-2026-07-19.ts
 */
import "./_env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Supabase-konvensjon: extensions inn i eget schema. Databasens search_path
  // inkluderer `extensions`, så typen kan refereres uten prefiks etterpå.
  await prisma.$executeRawUnsafe(
    `CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;`,
  );
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

  console.log("knowledge_chunks opprettet (tabell + hnsw-indeks + RLS).");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
