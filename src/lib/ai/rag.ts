// RAG-søk mot kunnskapsbasen (knowledge_chunks, pgvector).
//
// Corpuset kommer fra MasterBrain rag-corpus (seedes via
// scripts/seed-rag-corpus-2026-07-19.ts): SG-matematikk, Trackman, baselines,
// MORAD/CANON og live-coaching-regler. Spørringen embeddes med samme modell
// som chunkene (openai/text-embedding-3-small via Vercel AI Gateway — direkte
// OpenAI-konto er uten kvote) og matches med cosine-avstand via HNSW-indeks.

import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const EMBED_MODEL = "openai/text-embedding-3-small";
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/embeddings";

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
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) throw new Error("AI_GATEWAY_API_KEY mangler i environment");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });
  if (!res.ok) {
    throw new Error(`Embedding-kall feilet: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { data: Array<{ embedding: number[] }> };
  return json.data[0].embedding;
}

export async function searchKnowledge(
  query: string,
  opts: { k?: number; corpus?: KnowledgeCorpus } = {},
): Promise<KnowledgeHit[]> {
  const k = Math.min(Math.max(opts.k ?? 4, 1), 10);
  const embedding = await embedQuery(query);
  const vector = `[${embedding.join(",")}]`;

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
