/**
 * meg-index-vaults.ts — indekserer kunnskaps-vaultene til Meg-DB (me_knowledge).
 *
 * Kjøres på Mac (IKKE Vercel) via LaunchAgent. Self-contained: leser env via
 * dotenv, snakker direkte med Meg-Supabase + Voyage. Importerer IKKE @/lib/meg/*
 * (de har "server-only" og ville krevd react-server-condition).
 *
 * Indekserer KUN tekst fra ~/Developer/ak-brain + ~/Developer/ak-second-brain.
 * Hard sperre på secrets/binær/kode. Hopper over uendrede biter via content_hash.
 *
 * Kjør: npx tsx scripts/meg-index-vaults.ts
 */
import "./_env";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, relative, extname } from "node:path";

const EMBEDDING_DIM = 512;

const VAULTS: { name: "ak-brain" | "ak-second-brain"; dir: string }[] = [
  { name: "ak-brain", dir: join(homedir(), "Developer", "ak-brain") },
  { name: "ak-second-brain", dir: join(homedir(), "Developer", "ak-second-brain") },
];

// Mapper som ALDRI åpnes (secrets, kode, config, binær-kataloger).
const BLOCKED_DIRS = new Set([
  ".git", ".claude", ".obsidian", "venv", ".venv", "node_modules",
  "__pycache__", ".next", "dist", "build", ".cache",
]);

// Kun disse filtypene indekseres (ren tekst).
const ALLOWED_EXT = new Set([".md", ".txt", ".markdown"]);

function isBlockedName(name: string): boolean {
  if (name.startsWith(".env")) return true;
  if (name === ".DS_Store") return true;
  if (name.endsWith(".canvas") || name.endsWith(".base")) return true;
  return false;
}

/** Rekursivt: samle alle tillatte tekstfiler under en vault. */
async function samleFiler(root: string, dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (BLOCKED_DIRS.has(e.name) || e.name.startsWith(".")) continue;
      out.push(...(await samleFiler(root, join(dir, e.name))));
    } else if (e.isFile()) {
      if (isBlockedName(e.name)) continue;
      if (!ALLOWED_EXT.has(extname(e.name).toLowerCase())) continue;
      out.push(join(dir, e.name));
    }
  }
  return out;
}

/** Deler tekst i biter på ~1000 tegn, brytes på avsnitt. */
function delIBiter(text: string, maxLen = 1000): string[] {
  const avsnitt = text.split(/\n\s*\n/);
  const biter: string[] = [];
  let buf = "";
  for (const a of avsnitt) {
    const t = a.trim();
    if (!t) continue;
    if (buf.length + t.length + 2 > maxLen && buf.length > 0) {
      biter.push(buf.trim());
      buf = "";
    }
    buf += t + "\n\n";
  }
  if (buf.trim()) biter.push(buf.trim());
  return biter.filter((b) => b.length > 30);
}

function hashOf(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

async function embedBatch(
  texts: string[],
  apiKey: string,
  model: string,
  baseUrl: string,
): Promise<number[][] | null> {
  if (texts.length === 0) return [];
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      input: texts,
      model,
      input_type: "document",
      output_dimension: EMBEDDING_DIM,
    }),
  });
  if (!res.ok) {
    console.error("[index] Voyage-feil", res.status, await res.text());
    return null;
  }
  const json = (await res.json()) as { data?: { embedding: number[]; index: number }[] };
  if (!json.data) return null;
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

async function main() {
  const url = process.env.MEG_SUPABASE_URL;
  const key = process.env.MEG_SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.MEG_EMBEDDINGS_API_KEY;
  const model = process.env.MEG_EMBEDDINGS_MODEL ?? "voyage-3-lite";
  const baseUrl = process.env.MEG_EMBEDDINGS_BASE_URL ?? "https://api.voyageai.com/v1/embeddings";

  if (!url || !key || !apiKey) {
    console.error("Mangler MEG_SUPABASE_URL / MEG_SUPABASE_SERVICE_ROLE_KEY / MEG_EMBEDDINGS_API_KEY");
    process.exit(1);
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  let nyeBiter = 0;
  let hoppet = 0;

  for (const vault of VAULTS) {
    const filer = await samleFiler(vault.dir, vault.dir);
    console.log(`[${vault.name}] ${filer.length} filer`);

    for (const fil of filer) {
      const relPath = relative(vault.dir, fil);
      let raw: string;
      try {
        const st = await stat(fil);
        if (st.size > 500_000) continue; // hopp over svært store filer
        raw = await readFile(fil, "utf8");
      } catch {
        continue;
      }

      const biter = delIBiter(raw);
      const tilEmbed: { chunkIndex: number; content: string; hash: string }[] = [];

      for (let i = 0; i < biter.length; i++) {
        const content = biter[i];
        const hash = hashOf(content);
        const { data: eksisterende } = await db
          .from("me_knowledge")
          .select("content_hash")
          .eq("vault", vault.name)
          .eq("rel_path", relPath)
          .eq("chunk_index", i)
          .maybeSingle();
        if (eksisterende && (eksisterende as { content_hash: string }).content_hash === hash) {
          hoppet++;
          continue;
        }
        tilEmbed.push({ chunkIndex: i, content, hash });
      }

      if (tilEmbed.length === 0) continue;

      const vektorer = await embedBatch(
        tilEmbed.map((t) => t.content),
        apiKey,
        model,
        baseUrl,
      );
      if (!vektorer) continue;

      const rader = tilEmbed.map((t, idx) => ({
        vault: vault.name,
        rel_path: relPath,
        chunk_index: t.chunkIndex,
        content: t.content,
        content_hash: t.hash,
        embedding: vektorer[idx],
        updated_at: new Date().toISOString(),
      }));

      const { error } = await db
        .from("me_knowledge")
        .upsert(rader, { onConflict: "vault,rel_path,chunk_index" });
      if (error) {
        console.error(`[${vault.name}] upsert-feil ${relPath}:`, error.message);
        continue;
      }
      nyeBiter += rader.length;
    }
  }

  console.log(`Ferdig. ${nyeBiter} biter indeksert/oppdatert, ${hoppet} uendret hoppet over.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
