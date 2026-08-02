/**
 * RAG-innlasting: MasterBrain rag-corpus → knowledge_chunks (pgvector).
 *
 * Leser alle chunks fra ~/Developer/Masterbrain/rag-corpus (5 corpus-mapper),
 * parser YAML-frontmatter (gray-matter), lager embeddings via Vercel AI
 * Gateway (openai/text-embedding-3-small, 1536 dim) og upserter på chunk_id.
 * Redirect-stubber ("<!-- REDIRECT") hoppes over.
 *
 * Idempotent — trygg å kjøre på nytt etter endringer i corpuset.
 * Krever: AI_GATEWAY_API_KEY + DIRECT_URL i .env.local. Tabellen må finnes
 * (scripts/create-knowledge-chunks-2026-07-27.ts).
 * (Opprinnelig kjørt 2026-07-19; skriptet gjenskapes i git for reproduserbarhet.)
 *
 *   npx tsx scripts/seed-rag-corpus-2026-07-27.ts
 */
import "./_env";
import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";
import matter from "gray-matter";
import { Client } from "pg";

const MASTERBRAIN_DIR =
  process.env.MASTERBRAIN_DIR ?? join(homedir(), "Developer", "Masterbrain");
const CORPUS_DIR = join(MASTERBRAIN_DIR, "rag-corpus");
const EMBED_MODEL = "openai/text-embedding-3-small";
const BATCH_SIZE = 50;

type Chunk = {
  id: string;
  corpus: string;
  content: string;
  source: string | null;
  section: string | null;
  tags: string[];
  topics: string[];
  relevance: string[];
  wordCount: number;
};

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

function readChunks(): Chunk[] {
  const corpora = readdirSync(CORPUS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const chunks: Chunk[] = [];
  const seen = new Set<string>();

  for (const corpus of corpora) {
    const dir = join(CORPUS_DIR, corpus);
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const raw = readFileSync(join(dir, file), "utf8");
      if (raw.trimStart().startsWith("<!-- REDIRECT")) continue;

      const { data, content } = matter(raw);
      const body = content.trim();
      if (body.length === 0) continue;

      const id = String(data.chunk_id ?? basename(file, ".md"));
      if (seen.has(id)) {
        throw new Error(`Duplikat chunk_id "${id}" (${corpus}/${file}) — avbryter.`);
      }
      seen.add(id);

      chunks.push({
        id,
        corpus,
        content: body,
        source: data.source ? String(data.source) : null,
        section: data.source_section ? String(data.source_section) : null,
        tags: toList(data.tags),
        topics: toList(data.topics),
        relevance: toList(data.relevance),
        wordCount: Number(data.word_count) || body.split(/\s+/).length,
      });
    }
  }
  return chunks;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://ai-gateway.vercel.sh/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!res.ok) throw new Error(`Embedding-kall feilet: ${res.status}`);
  const json = (await res.json()) as { data: Array<{ embedding: number[] }> };
  return json.data.map((d) => d.embedding);
}

async function main() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error("AI_GATEWAY_API_KEY mangler i environment");
  }
  const db = new Client({ connectionString: process.env.DIRECT_URL });
  await db.connect();

  const chunks = readChunks();
  console.log(`Fant ${chunks.length} chunks i ${CORPUS_DIR}`);

  let upserted = 0;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const embeddings = await embedBatch(batch.map((c) => c.content));

    for (let j = 0; j < batch.length; j++) {
      const c = batch[j];
      const vector = `[${embeddings[j].join(",")}]`;
      await db.query(
        `INSERT INTO knowledge_chunks
           (id, corpus, content, source, section, tags, topics, relevance, "wordCount", embedding, "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector, now())
         ON CONFLICT (id) DO UPDATE SET
           corpus = EXCLUDED.corpus,
           content = EXCLUDED.content,
           source = EXCLUDED.source,
           section = EXCLUDED.section,
           tags = EXCLUDED.tags,
           topics = EXCLUDED.topics,
           relevance = EXCLUDED.relevance,
           "wordCount" = EXCLUDED."wordCount",
           embedding = EXCLUDED.embedding,
           "updatedAt" = now()`,
        [c.id, c.corpus, c.content, c.source, c.section, c.tags, c.topics, c.relevance, c.wordCount, vector],
      );
      upserted++;
    }
    console.log(`  ${upserted}/${chunks.length} lastet inn ...`);
  }

  const { rows } = await db.query(
    `SELECT corpus, count(*)::int AS antall, count(embedding)::int AS med_embedding
       FROM knowledge_chunks GROUP BY corpus ORDER BY corpus`,
  );
  console.log("\nStatus i knowledge_chunks:");
  for (const r of rows) {
    console.log(`  ${String(r.corpus).padEnd(14)} ${r.antall} chunks (${r.med_embedding} m/ embedding)`);
  }
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
