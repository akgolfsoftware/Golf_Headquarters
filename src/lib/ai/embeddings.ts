// Embeddings via Vercel AI Gateway (OpenAI-kompatibel) — delt av RAG
// (knowledge_chunks) og spillerminnet (ai_memories).
//
// Modell: openai/text-embedding-3-small, 1536 dim — MÅ matche vector(1536) i
// begge tabellene. Går via AI Gateway fordi direkte OpenAI-konto er uten
// kvote (verifisert 2026-07-19); samme mønster som Meg bruker mot Voyage.

import "server-only";

export const EMBED_MODEL = "openai/text-embedding-3-small";
export const EMBED_DIM = 1536;
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/embeddings";

export function isEmbeddingsEnabled(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) throw new Error("AI_GATEWAY_API_KEY mangler i environment");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!res.ok) {
    throw new Error(`Embedding-kall feilet: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { data: Array<{ embedding: number[] }> };
  return json.data.map((d) => d.embedding);
}

export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

/** pgvector-literal for $queryRaw-parametre. */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
