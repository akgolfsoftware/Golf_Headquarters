/**
 * Skriver varige mønstre fra Meg-destillering til ak-second-brain.
 * Lager markdown-filer med YAML-frontmatter under meg-monstre/
 * og kjører git add + commit + push.
 */

import { writeFile, mkdir } from "fs/promises";
import { spawnSync } from "child_process";
import path from "path";

export type Monstre = { tema: string; innhold: string };

function slugify(tekst: string): string {
  return tekst
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function git(args: string[], cwd: string): { ok: boolean; output: string } {
  const res = spawnSync("git", args, { cwd, encoding: "utf-8", timeout: 30_000 });
  const output = (res.stdout ?? "") + (res.stderr ?? "");
  const timedOut = res.signal === "SIGTERM" || res.status === null;
  return { ok: res.status === 0 && !timedOut, output: timedOut ? "git tidsavbrudd etter 30s" : output };
}

export async function skrivSecondBrain(
  dato: string,
  monstre: Monstre[],
  secondBrainPath: string,
): Promise<void> {
  if (monstre.length === 0) return;

  const monstePath = path.join(secondBrainPath, "meg-monstre");
  await mkdir(monstePath, { recursive: true });

  const brukteSlugs = new Set<string>();
  for (let i = 0; i < monstre.length; i++) {
    const m = monstre[i];
    const baseSlug = slugify(m.tema) || `monstre-${i}`;
    let slug = baseSlug;
    if (brukteSlugs.has(slug)) slug = `${baseSlug}-${i}`;
    brukteSlugs.add(slug);
    const filnavn = `${dato}-${slug}.md`;
    const filsti = path.join(monstePath, filnavn);
    const temaYaml = m.tema.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const innhold =
      `---\ndato: ${dato}\nkilde: meg-logg\ntema: "${temaYaml}"\n---\n\n` +
      `${m.innhold.trim()}\n`;
    await writeFile(filsti, innhold, "utf-8");
    console.log(`[second-brain] ${filnavn}: skrevet`);
  }

  // git add
  const addRes = git(["add", "meg-monstre/"], secondBrainPath);
  if (!addRes.ok) {
    throw new Error(`git add feilet: ${addRes.output}`);
  }

  // git commit (exit 1 med "nothing to commit" er ikke en feil)
  const commitMsg = `feat: meg-destillering ${dato} (${monstre.length} mønstre)`;
  const commitRes = git(["commit", "-m", commitMsg], secondBrainPath);
  if (!commitRes.ok) {
    if (
      commitRes.output.includes("nothing to commit") ||
      commitRes.output.includes("nothing added")
    ) {
      console.log(`[second-brain] ${dato}: ingen nye git-endringer`);
      return;
    }
    throw new Error(`git commit feilet: ${commitRes.output}`);
  }

  // git push
  const pushRes = git(["push"], secondBrainPath);
  if (!pushRes.ok) {
    throw new Error(`git push feilet: ${pushRes.output}`);
  }

  console.log(`[second-brain] ${dato}: ${monstre.length} mønstre pushet`);
}
