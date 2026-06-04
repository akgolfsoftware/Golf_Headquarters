import "server-only";
import { megSupabase } from "@/lib/meg/supabase";
import { embedOne } from "@/lib/meg/embeddings";

export type MemoryKind = "fact" | "preference" | "person" | "goal" | "summary";

/**
 * Lagrer ett destillert minne i me_memory med embedding. Brukes når et faktum
 * er verdt å huske langsiktig (en preferanse, en person, et mål). Embedding
 * legges på hvis embeddings er konfigurert; ellers lagres minnet uten vektor
 * (semantisk søk hopper over det, men det finnes fortsatt).
 */
export async function lagreMinne(opts: {
  content: string;
  kind?: MemoryKind;
  tags?: string[];
  sourceRef?: string | null;
}): Promise<{ id: string } | null> {
  const db = megSupabase();
  if (!db) return null;

  const embedding = await embedOne(opts.content, "document");

  const { data, error } = await db
    .from("me_memory")
    .insert({
      content: opts.content,
      kind: opts.kind ?? "fact",
      tags: opts.tags ?? [],
      source_ref: opts.sourceRef ?? null,
      embedding,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[meg/memory] lagreMinne feilet", error?.message);
    return null;
  }
  return { id: (data as { id: string }).id };
}
