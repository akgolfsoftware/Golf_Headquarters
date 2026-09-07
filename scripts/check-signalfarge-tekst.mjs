#!/usr/bin/env node
/**
 * Vakt: signalfarge som TEKSTFARGE skal aldri øke per fil.
 *
 * Vei A (Anders 03.09.2026, beslutninger.md §KONTRAST-REGEL I STEDET FOR NY FASIT):
 * danger / ok / warn / viz-target er signalfarger, ikke tekstfarger. Som ren tekst
 * på scene/elev i lys modus bryter de kontrastkravet (check-tl-kontrast.mjs måler
 * ok 2,2:1 og warn 1,4:1 mot krav 4,5:1 / 3,0:1). Forekomstene som finnes (06.09.2026:
 * 305 i 168 filer) ryddes i en egen sweep — vakten passer bare på at tallet aldri
 * VOKSER: en fil i HEAD får ikke ha flere `color: TL.<signal>` enn samme fil har på
 * origin/main. Nye filer sammenlignes mot 0, flyttede filer mot den gamle stien.
 *
 * Kjør fra repo-roten: node scripts/check-signalfarge-tekst.mjs
 * Krever at origin/main finnes lokalt (`git fetch origin`).
 * Exit 0 = OK · 1 = en fil har fått flere · 2 = origin/main mangler.
 */
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const BASE = "origin/main";

/**
 * `color: TL.danger` / `color:TL.ok` / `color: TL.viz.target` — property-navnet
 * `color` med små bokstaver, så `borderColor: TL.danger` og `backgroundColor: TL.ok`
 * (kant og flate — lov) telles ikke. `\b` holder `TL.warnHair` utenfor.
 */
export const SIGNAL_RE = /color:\s*TL\.(danger|ok|warn|viz\.target)\b/g;

/** Antall forekomster i én fils kildekode. Ren funksjon. */
export function tellSignalfarge(kilde) {
  return (kilde.match(SIGNAL_RE) ?? []).length;
}

/**
 * Leser `git diff --name-status -z` til rader. `R`/`C` har to stier (gammel, ny);
 * alt annet én. Ren funksjon.
 * @param {string} ut  rå stdout med NUL som skilletegn
 * @returns {{ status: string, gammel: string | null, ny: string }[]}
 */
export function parseNameStatus(ut) {
  const t = ut.split("\0");
  const rader = [];
  for (let i = 0; i < t.length && t[i] !== ""; ) {
    const status = t[i][0];
    if (status === "R" || status === "C") {
      rader.push({ status, gammel: t[i + 1], ny: t[i + 2] });
      i += 3;
    } else {
      rader.push({ status, gammel: null, ny: t[i + 1] });
      i += 2;
    }
  }
  return rader;
}

/**
 * Filene som har fått flere. `par` = [{ sti, head, base }] — antall i HEAD og på
 * origin/main (0 når fila ikke finnes der). Ren funksjon.
 * @param {{ sti: string, head: number, base: number }[]} par
 */
export function finnBrudd(par) {
  return par.filter((p) => p.head > p.base);
}

/**
 * Skiller "fila finnes faktisk ikke i denne referansen" (git sin vanlige
 * feilmelding for det) fra andre `git show`-feil (feil cwd, grunt klone,
 * korrupt objekt) — sistnevnte skal kaste, ikke stille telles som "ny fil".
 * Ren funksjon.
 * @param {string | undefined} stderr
 * @returns {boolean}
 */
export function erFilManglendeIRef(stderr) {
  return /does not exist in|invalid object name|exists on disk, but not in/.test(stderr ?? "");
}

function* tsxFiler(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* tsxFiler(p);
    else if (e.name.endsWith(".tsx")) yield p;
  }
}

function git(args, rot) {
  const r = spawnSync("git", args, { cwd: rot, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} feilet:\n${r.stderr}`);
  return r.stdout;
}

/** Innholdet av en fil på origin/main, eller null hvis den ikke finnes der. */
function baseInnhold(sti, rot) {
  const r = spawnSync("git", ["show", `${BASE}:${sti}`], { cwd: rot, encoding: "utf8" });
  if (r.status === 0) return r.stdout;
  if (erFilManglendeIRef(r.stderr)) return null;
  throw new Error(`git show ${BASE}:${sti} feilet av en annen grunn enn "fila finnes ikke der":\n${r.stderr}`);
}

function main() {
  if (spawnSync("git", ["rev-parse", "--verify", "--quiet", BASE], { cwd: process.cwd() }).status !== 0) {
    console.error(`check-signalfarge-tekst: fant ikke ${BASE} lokalt. Kjør \`git fetch origin\` først.`);
    process.exit(2);
  }
  try {
    const rot = process.cwd();

    // Summen i HEAD — kun til rapportlinjen.
    let sum = 0;
    let filer = 0;
    for (const f of tsxFiler(join(rot, "src"))) {
      const n = tellSignalfarge(readFileSync(f, "utf8"));
      if (n) {
        sum += n;
        filer++;
      }
    }

    // Bare filer som er endret mot origin/main kan ha fått flere — uendrede filer har
    // per definisjon samme tall. Untracked filer tas med (git diff ser dem ikke).
    const endret = parseNameStatus(git(["diff", "--name-status", "-z", "-M", BASE, "--", "src"], rot)).filter(
      (r) => r.status !== "D" && r.ny.endsWith(".tsx"),
    );
    const nye = git(["ls-files", "--others", "--exclude-standard", "-z", "--", "src"], rot)
      .split("\0")
      .filter((s) => s.endsWith(".tsx"))
      .map((s) => ({ status: "A", gammel: null, ny: s }));

    const par = [...endret, ...nye].map((r) => {
      const head = tellSignalfarge(readFileSync(join(rot, r.ny), "utf8"));
      const b = baseInnhold(r.gammel ?? r.ny, rot);
      return { sti: r.ny, head, base: b === null ? 0 : tellSignalfarge(b) };
    });
    const brudd = finnBrudd(par);

    if (brudd.length) {
      console.error(`check-signalfarge-tekst: signalfarge som tekstfarge har ØKT i ${brudd.length} fil(er) (Vei A, 03.09.2026):`);
      for (const b of brudd) console.error(`  ${b.sti}: ${b.base} → ${b.head} (${BASE} → HEAD)`);
      console.error(
        "\nBruk fargen som fylt flate med on-*-tekst, som ikon/grafikk, eller bytt tekstfargen til " +
          "TL.text / TL.mute. Målingene står i docs/design-audit/train-lock-kontrast.md.",
      );
      process.exit(1);
    }
    console.log(
      `check-signalfarge-tekst: OK — ${sum} forekomster i ${filer} filer i HEAD; ` +
        `${par.length} endret(e) fil(er) sammenlignet mot ${BASE}, ingen har fått flere.`,
    );
  } catch (err) {
    console.error(`check-signalfarge-tekst: uventet feil: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
