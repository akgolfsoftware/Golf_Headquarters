// RAG-søk mot kunnskapsbasen (knowledge_chunks, pgvector).
//
// Corpuset kommer fra MasterBrain rag-corpus (seedes via
// scripts/seed-rag-corpus-2026-07-27.ts): SG-matematikk, Trackman, baselines,
// MORAD/CANON og live-coaching-regler. Spørringen embeddes med samme modell
// som chunkene og matches med cosine-avstand via HNSW-indeks.

import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { embedQuery, isEmbeddingsEnabled, toVectorLiteral } from "./embeddings";

export type KnowledgeCorpus =
  | "sg-trackman"
  | "sg-baselines"
  | "treningsvolum"
  | "morad"
  | "live";

export type KnowledgeHit = {
  id: string;
  corpus: string;
  content: string;
  source: string | null;
  section: string | null;
  tags: string[];
  similarity: number; // 1 = identisk, 0 = urelatert (cosine)
};

export function isRagEnabled(): boolean {
  return isEmbeddingsEnabled();
}

export async function searchKnowledge(
  query: string,
  opts: { k?: number; corpus?: KnowledgeCorpus } = {},
): Promise<KnowledgeHit[]> {
  const k = Math.min(Math.max(opts.k ?? 4, 1), 10);
  const vector = toVectorLiteral(await embedQuery(query));

  const corpusFilter = opts.corpus
    ? Prisma.sql`WHERE corpus = ${opts.corpus}`
    : Prisma.empty;

  return prisma.$queryRaw<KnowledgeHit[]>`
    SELECT id, corpus, content, source, section, tags,
           1 - (embedding <=> ${vector}::vector) AS similarity
      FROM knowledge_chunks
      ${corpusFilter}
     ORDER BY embedding <=> ${vector}::vector
     LIMIT ${k}
  `;
}
