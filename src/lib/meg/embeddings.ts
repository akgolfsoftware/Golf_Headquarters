import "server-only";
import { readMegEmbeddingsEnv } from "@/lib/meg/env";

export const EMBEDDING_DIM = 512;

type VoyageResponse = {
  data?: { embedding: number[]; index: number }[];
};

/**
 * Embedder tekst(er) via Voyage AI. input_type skiller spørringer fra
 * dokumenter (bedre treff). Returnerer null hvis embeddings ikke er
 * konfigurert eller API-et feiler — kallere må håndtere null (fallback til
 * nøkkelord-søk).
 */
export async function embed(
  texts: string | string[],
  inputType: "query" | "document" = "query",
): Promise<number[][] | null> {
  const env = readMegEmbeddingsEnv();
  if (!env) return null;

  const input = Array.isArray(texts) ? texts : [texts];
  if (input.length === 0) return [];

  try {
    const res = await fetch(env.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.apiKey}`,
      },
      body: JSON.stringify({
        input,
        model: env.model,
        input_type: inputType,
        output_dimension: EMBEDDING_DIM,
      }),
    });
    if (!res.ok) {
      console.error("[meg/embeddings] API-feil", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as VoyageResponse;
    if (!json.data) return null;
    return json.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
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
  return readMegEmbeddingsEnv() !== null;
}
