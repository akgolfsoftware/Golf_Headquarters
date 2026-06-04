import "server-only";
import { z } from "zod";
import { megSupabase } from "@/lib/meg/supabase";
import { embedOne, isEmbeddingsEnabled } from "@/lib/meg/embeddings";

export type SearchHit = {
  source: "memory" | "knowledge" | "log";
  content: string;
  ref: string | null;
  similarity: number | null;
};

const memoryMatchSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  kind: z.string(),
  tags: z.array(z.string()),
  similarity: z.number(),
});

const knowledgeMatchSchema = z.object({
  id: z.string().uuid(),
  vault: z.string(),
  rel_path: z.string(),
  content: z.string(),
  similarity: z.number(),
});

const logMatchSchema = z.object({
  text: z.string(),
  kind: z.string(),
  created_at: z.string(),
});

/**
 * Hybrid søk: hvis embeddings er konfigurert, semantisk søk i me_memory +
 * me_knowledge via pgvector. Faller alltid tilbake til nøkkelord-søk i me_log
 * (ilike) så søk virker selv uten embeddings.
 */
export async function sokMinne(query: string, limit = 5): Promise<SearchHit[]> {
  const db = megSupabase();
  if (!db) return [];

  const hits: SearchHit[] = [];

  if (isEmbeddingsEnabled()) {
    const vec = await embedOne(query, "query");
    if (vec) {
      const [mem, know] = await Promise.all([
        db.rpc("match_me_memory", { query_embedding: vec, match_count: limit }),
        db.rpc("match_me_knowledge", { query_embedding: vec, match_count: limit }),
      ]);
      if (!mem.error && Array.isArray(mem.data)) {
        for (const row of mem.data) {
          const v = memoryMatchSchema.safeParse(row);
          if (v.success) {
            hits.push({
              source: "memory",
              content: v.data.content,
              ref: v.data.kind,
              similarity: v.data.similarity,
            });
          }
        }
      }
      if (!know.error && Array.isArray(know.data)) {
        for (const row of know.data) {
          const v = knowledgeMatchSchema.safeParse(row);
          if (v.success) {
            hits.push({
              source: "knowledge",
              content: v.data.content,
              ref: `${v.data.vault}/${v.data.rel_path}`,
              similarity: v.data.similarity,
            });
          }
        }
      }
    }
  }

  // Nøkkelord-fallback i logg (alltid, supplerer semantisk).
  const { data: logData, error: logErr } = await db
    .from("me_log")
    .select("text, kind, created_at")
    .ilike("text", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!logErr && Array.isArray(logData)) {
    for (const row of logData) {
      const v = logMatchSchema.safeParse(row);
      if (v.success) {
        hits.push({
          source: "log",
          content: v.data.text,
          ref: `${v.data.kind} ${v.data.created_at.slice(0, 10)}`,
          similarity: null,
        });
      }
    }
  }

  // Sorter semantiske treff først (etter similarity), så logg-treff.
  hits.sort((a, b) => (b.similarity ?? -1) - (a.similarity ?? -1));
  return hits.slice(0, limit * 2);
}
