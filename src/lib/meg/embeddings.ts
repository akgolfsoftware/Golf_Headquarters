import "server-only";
import { readMegEnv } from "@/lib/meg/env";

// Supabase innebygd gte-small via Edge Function «embed» (supabase-meg/functions/embed).
// Byttet fra Voyage 2026-07-25 — gratis, og samme modell for query (her) og
// dokumenter (scripts/meg-index-vaults.ts). Endres dimensjonen, må me_memory/
// me_knowledge-kolonnene og match-RPC-ene endres (supabase-meg/migrations/0007).
export const EMBEDDING_DIM = 384;

type EmbedResponse = {
  embeddings?: number[][];
};

/**
 * Embedder tekst(er) via Meg-Supabase Edge Function «embed» (gte-small).
 * inputType beholdes for API-kompatibilitet, men gte-small skiller ikke
 * query/dokument. Returnerer null hvis Meg ikke er konfigurert eller kallet
 * feiler — kallere må håndtere null (fallback til nøkkelord-søk).
 */
export async function embed(
  texts: string | string[],
  _inputType: "query" | "document" = "query",
): Promise<number[][] | null> {
  const env = readMegEnv();
  if (!env) return null;

  const input = Array.isArray(texts) ? texts : [texts];
  if (input.length === 0) return [];

  try {
    const res = await fetch(`${env.supabaseUrl}/functions/v1/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({ input }),
    });
    if (!res.ok) {
      console.error("[meg/embeddings] embed-funksjon feilet", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as EmbedResponse;
    if (!json.embeddings) return null;
    return json.embeddings;
  } catch (err) {
    console.error("[meg/embeddings] fetch feilet", err);
    return null;
  }
}

/** Embedder én tekst. Returnerer null ved feil. */
export async function embedOne(
  text: string,
  inputType: "query" | "document" = "query",
): Promise<number[] | null> {
  const out = await embed(text, inputType);
  return out && out[0] ? out[0] : null;
}

export function isEmbeddingsEnabled(): boolean {
  return readMegEnv() !== null;
}
