// Spillerminne-lager (ai_memories, pgvector) — episodisk, semantisk og
// prosedyrisk minne per spiller over måneder. Kodeform speiler Meg-søket
// (src/lib/meg/search.ts): semantisk søk med ilike-fallback slik at minnet
// degraderer pent (aldri knekker agenter) hvis embeddings er utilgjengelig.
//
// Skriveveien (øktoppsummering, CoachNote-indeksering, konsolidering) kobles
// på i egen PR — dette er lageret.

import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { embedQuery, embedTexts, isEmbeddingsEnabled, toVectorLiteral } from "./embeddings";

export type MemoryKind = "EPISODIC" | "SEMANTIC" | "PROCEDURAL";

export type MemoryWrite = {
  playerId: string;
  kind: MemoryKind;
  content: string;
  metadata?: Record<string, unknown>;
  /** Provenans: "coaching-session" | "coach-note" | "plan-action" | "consolidation" ... */
  sourceType: string;
  sourceId?: string | null;
};

export type MemoryHit = {
  id: string;
  kind: MemoryKind;
  content: string;
  metadata: unknown;
  sourceType: string;
  similarity: number | null; // null ved ilike-fallback
};

export async function writeMemories(entries: MemoryWrite[]): Promise<number> {
  if (entries.length === 0) return 0;
  const embeddings = isEmbeddingsEnabled()
    ? await embedTexts(entries.map((e) => e.content))
    : entries.map(() => null);

  let written = 0;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const emb = embeddings[i];
    await prisma.$executeRaw`
      INSERT INTO ai_memories
        (id, "playerId", kind, content, metadata, embedding, "sourceType", "sourceId", "updatedAt")
      VALUES
        (gen_random_uuid()::text, ${e.playerId}, ${e.kind}, ${e.content},
         ${JSON.stringify(e.metadata ?? {})}::jsonb,
         ${emb ? toVectorLiteral(emb) : null}::vector,
         ${e.sourceType}, ${e.sourceId ?? null}, now())
    `;
    written++;
  }
  return written;
}

export async function searchMemory(
  playerId: string,
  query: string,
  opts: { k?: number; kind?: MemoryKind } = {},
): Promise<MemoryHit[]> {
  const k = Math.min(Math.max(opts.k ?? 6, 1), 20);
  const kindFilter = opts.kind
    ? Prisma.sql`AND kind = ${opts.kind}`
    : Prisma.empty;

  if (isEmbeddingsEnabled()) {
    try {
      const vector = toVectorLiteral(await embedQuery(query));
      return await prisma.$queryRaw<MemoryHit[]>`
        SELECT id, kind, content, metadata, "sourceType",
               1 - (embedding <=> ${vector}::vector) AS similarity
          FROM ai_memories
         WHERE "playerId" = ${playerId} AND embedding IS NOT NULL ${kindFilter}
         ORDER BY embedding <=> ${vector}::vector
         LIMIT ${k}
      `;
    } catch {
      // fall videre til ilike
    }
  }

  const needle = `%${query.slice(0, 80)}%`;
  return prisma.$queryRaw<MemoryHit[]>`
    SELECT id, kind, content, metadata, "sourceType", NULL::float AS similarity
      FROM ai_memories
     WHERE "playerId" = ${playerId} AND content ILIKE ${needle} ${kindFilter}
     ORDER BY "updatedAt" DESC
     LIMIT ${k}
  `;
}
