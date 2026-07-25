/**
 * meg-index-vaults.ts — indekserer kunnskaps-vaultene til Meg-DB (me_knowledge).
 *
 * Kjøres på Mac (IKKE Vercel) via LaunchAgent. Self-contained: leser env via
 * dotenv, snakker direkte med Meg-Supabase. Importerer IKKE @/lib/meg/*
 * (de har "server-only" og ville krevd react-server-condition).
 *
 * Embeddings: Supabase Edge Function «embed» (gte-small, 384 dim) — samme modell
 * som query-siden i src/lib/meg/embeddings.ts. Byttet fra Voyage 2026-07-25.
 *
 * Vault-stier: AK_BRAIN_PATH (default ~/ak-brain) og AK_SECOND_BRAIN_PATH
 * (default ~/Developer/ak-second-brain) — samme konvensjon som
 * scripts/meg-tilbakeskriving/run.ts.
 *
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

// Må matche vector(384)-kolonnene i supabase-meg/migrations/0007 og
// EMBEDDING_DIM i src/lib/meg/embeddings.ts.
const EMBEDDING_DIM = 384;

// Edge-funksjonen tar maks 64 tekster per kall (se supabase-meg/functions/embed).
const EMBED_BATCH = 32;

const VAULTS: { name: "ak-brain" | "ak-second-brain"; dir: string }[] = [
  { name: "ak-brain", dir: process.env.AK_BRAIN_PATH ?? join(homedir(), "ak-brain") },
  {
    name: "ak-second-brain",
    dir: process.env.AK_SECOND_BRAIN_PATH ?? join(homedir(), "Developer", "ak-second-brain"),
  },
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
  } catch (err) {
    // Utilgjengelig undermappe skal ikke velte kjøringen, men heller ikke
    // forsvinne stille — vault-roten sjekkes separat i main().
    console.warn(`[index] hopper over utilgjengelig mappe ${dir}:`, (err as Error).message);
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Embedder tekster via Edge Function «embed» i batcher på EMBED_BATCH.
 * Enkel retry på 429/5xx. Returnerer null ved varig feil.
 */
async function embedBatch(
  texts: string[],
  supabaseUrl: string,
  serviceKey: string,
): Promise<number[][] | null> {
  if (texts.length === 0) return [];
  const alle: number[][] = [];
  for (let start = 0; start < texts.length; start += EMBED_BATCH) {
    const slice = texts.slice(start, start + EMBED_BATCH);
    const maxForsok = 3;
    let vektorer: number[][] | null = null;
    for (let forsok = 1; forsok <= maxForsok; forsok++) {
      const res = await fetch(`${supabaseUrl}/functions/v1/embed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ input: slice }),
      });
      if ((res.status === 429 || res.status >= 500) && forsok < maxForsok) {
        const ventS = 5 * forsok;
        console.log(`[index] ${res.status} fra embed — venter ${ventS}s (forsøk ${forsok}/${maxForsok})`);
        await sleep(ventS * 1000);
        continue;
      }
      if (!res.ok) {
        console.error("[index] embed-funksjon feilet", res.status, await res.text());
        return null;
      }
      const json = (await res.json()) as { embeddings?: number[][] };
      if (!json.embeddings || json.embeddings.length !== slice.length) {
        console.error("[index] embed-funksjon ga uventet svar");
        return null;
      }
      if (json.embeddings[0]?.length !== EMBEDDING_DIM) {
        console.error(
          `[index] embed-dimensjon ${json.embeddings[0]?.length} != forventet ${EMBEDDING_DIM}`,
        );
        return null;
      }
      vektorer = json.embeddings;
      break;
    }
    if (!vektorer) return null;
    alle.push(...vektorer);
  }
  return alle;
}

async function main() {
  const url = process.env.MEG_SUPABASE_URL;
  const key = process.env.MEG_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Mangler MEG_SUPABASE_URL / MEG_SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  // Feil høyt hvis en vault-rot mangler — en stille tom kjøring ville sett ut
  // som suksess mens indeksen råtner.
  for (const vault of VAULTS) {
    try {
      const st = await stat(vault.dir);
      if (!st.isDirectory()) throw new Error("ikke en mappe");
    } catch {
      console.error(`[${vault.name}] vault-rot mangler eller er utilgjengelig: ${vault.dir}`);
      process.exit(1);
    }
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  let nyeBiter = 0;
  let hoppet = 0;

  for (const vault of VAULTS) {
    const filer = await samleFiler(vault.dir, vault.dir);
    console.log(`[${vault.name}] ${filer.length} filer (${vault.dir})`);

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
        url,
        key,
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
