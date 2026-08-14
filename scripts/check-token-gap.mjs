#!/usr/bin/env node
// Designport steg 10 — lint-porten mot nye hardkodede farger.
// Steg 6 (PR #274) sentraliserte alle 419 daværende fargeliteraler i
// style={{}} til T.farge.* (src/lib/v2/tokens.ts). Denne gaten hindrer at
// nye rå fargeverdier siger inn igjen og overstyrer Paper-paletten.
// Metode fra docs/port/fase4-token-gap-analyse.md §6-8 (tmp-gap-3-match.mjs,
// aldri committet — dette er den permanente varianten).
// Kjør: node scripts/check-token-gap.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = "src";
const COLOR_RE =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(\s*[\d.]/g;

/** Filer/mønstre der rå farger er legitime (tokendefinisjonen selv, ikke bruk av den). */
const ALLOW_FILES = new Set([
  "src/lib/v2/tokens.ts",
  "src/styles/paper-tokens.css", // ikke .tsx, men listet for lesbarhet
  // global-error rendrer sin egen <html> UTEN root-layout — globals.css/
  // paper-tokens.css lastes ikke garantert der, så var(--p-*) kan være
  // udefinert. Fila MÅ bære Paper-paletten som rå verdier (samme hex som
  // tokenfila). Gaten skal ikke tvinge en feilside som mister fargene sine.
  "src/app/global-error.tsx",
]);

function* walk(dir, exts = [".tsx", ".ts"]) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p, exts);
    else if (exts.some((e) => p.endsWith(e))) yield p;
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * PORT 2 (steg 10) — de to avviklede Presis-fargene, i ALLE notasjoner.
 * Forest #005840 og lime #D1F843 er den gamle Presis-paletten. Paper er
 * eneste designfasit (CLAUDE.md invariant 2), så disse to skal ikke finnes
 * noe sted i src/ — heller ikke som fallback inne i var(), i en kommentar
 * eller i e-post-HTML. INGEN allowlist: dukker en av dem opp igjen, er det
 * enten en regresjon eller en bevisst omkamp som skal tas med Anders.
 *
 * TRE notasjoner, ikke én (lærdom 2026-08-14, docs/feillogg.md): en ren
 * hex-grep meldte «0 igjen» mens nettleseren fortsatt viste neon-lime på
 * /stats/*. Samme to farger levde også som rgb()-desimaler (189 stk) og som
 * shadcn hsl-tripletter (3 stk). Legger du til en ny farge her: ta med alle
 * skrivemåtene den kan ha.
 * ───────────────────────────────────────────────────────────────────────── */
const PRESIS_RE = new RegExp(
  [
    "#005840\\b",
    "#D1F843\\b",
    // rgb()/rgba()-desimal, med eller uten mellomrom
    "0,\\s*88,\\s*64",
    "209,\\s*248,\\s*67",
    // shadcn hsl-tripletter (konsumeres via hsl(var(--x)))
    "163\\.6 100% 17\\.3%",
    "72\\.9 92\\.8% 61\\.8%",
  ].join("|"),
  "gi"
);
const presisTreff = [];
for (const file of walk(ROOT, [".tsx", ".ts", ".css", ".mjs", ".js"])) {
  const rel = file.replace(/\\/g, "/");
  const hits = readFileSync(file, "utf8").match(PRESIS_RE);
  if (hits) presisTreff.push({ file: rel, hits: [...new Set(hits)] });
}

/* ─────────────────────────────────────────────────────────────────────────
 * PORT 3 (steg 10) — nye hex-literaler i className og SVG-attributter.
 * style={{}} var allerede dekket (port 1). De to andre kanalene en farge
 * kan snike seg inn gjennom er Tailwind sin arbitrary value
 * (className="bg-[#123456]") og SVG sine presentasjonsattributter
 * (fill/stroke/stopColor). Begge omgår tokens fullstendig.
 * ───────────────────────────────────────────────────────────────────────── */
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const CLASSNAME_RE =
  /className\s*=\s*(?:"([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})/gs;
const SVG_FARGE_RE =
  /\b(?:fill|stroke|stopColor|floodColor|lightingColor)\s*=\s*"([^"]*)"/g;

/** Kataloger/filer der rå hex i className/SVG er bevisst. Én grunn per linje. */
const ALLOW_MARKUP = [
  // Interne demoer/labs, ikke produksjonsflater. Beslutning 2026-08-14: de
  // mappes ikke skjerm for skjerm, og skal ikke holde resten av appen som
  // gissel i gaten. Blir en demo forfremmet til prod-flate, fjern linja.
  "src/app/(internal)/demos/",
  // Notion sin egen merkelogo (svart flate, hvitt merke). Tredjeparts
  // merkevare skal IKKE temafarges — da er det ikke lenger deres logo.
  "src/app/admin/workspace/notion/page.tsx",
  // Delekortet eksporteres som bilde og fanges utenfor tema-konteksten;
  // gradienten må derfor være faste Paper-verdier (= T.wrapped.bgForest).
  "src/components/shared/del-runde-modal.tsx",
  // Feilsiden rendrer sin egen <html> uten root-layout — se ALLOW_FILES.
  "src/app/global-error.tsx",
];

const markupTreff = [];
for (const rot of ["src/components", "src/app"]) {
  for (const file of walk(rot, [".tsx"])) {
    const rel = file.replace(/\\/g, "/");
    if (ALLOW_MARKUP.some((a) => rel.startsWith(a))) continue;
    const src = readFileSync(file, "utf8");
    const hits = [];
    for (const m of src.matchAll(CLASSNAME_RE)) {
      hits.push(...(m[1] ?? m[2] ?? m[3] ?? "").match(HEX_RE) ?? []);
    }
    for (const m of src.matchAll(SVG_FARGE_RE)) {
      hits.push(...(m[1].match(HEX_RE) ?? []));
    }
    if (hits.length) markupTreff.push({ file: rel, hits: [...new Set(hits)] });
  }
}

/**
 * Henter ut innholdet i hvert style={{ ... }}-uttrykk med brace-matching
 * (hopper over strenger/escape), ikke linje-grep — en farge nevnt i en
 * vanlig streng ("velg farge") skal ikke telle.
 */
function extractStyleBlocks(src) {
  const blocks = [];
  const marker = "style={{";
  let i = 0;
  while ((i = src.indexOf(marker, i)) !== -1) {
    let depth = 0;
    let j = i + marker.length - 1; // start på første '{'
    let inStr = null;
    const start = j;
    for (; j < src.length; j++) {
      const c = src[j];
      if (inStr) {
        if (c === "\\") { j++; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) { blocks.push(src.slice(start, j + 1)); break; }
      }
    }
    i = j + 1;
  }
  return blocks;
}

const offenders = [];
for (const file of walk(ROOT)) {
  const rel = file.replace(/\\/g, "/");
  if (ALLOW_FILES.has(rel)) continue;
  const src = readFileSync(file, "utf8");
  if (!src.includes("style={{")) continue;
  for (const block of extractStyleBlocks(src)) {
    const hits = block.match(COLOR_RE);
    if (hits) offenders.push({ file: rel, hits });
  }
}

const skriv = (treff) => {
  for (const o of treff) console.error(`  ${o.file}: ${o.hits.join(", ")}`);
};

let rødt = false;

if (presisTreff.length) {
  rødt = true;
  console.error(
    "check-token-gap: avviklede Presis-farger funnet (hex, rgb() eller hsl-triplett).\n" +
      "Paper er eneste designfasit — bruk et semantisk --p-*-token valgt etter\n" +
      "FUNKSJON (opp/ned/info/kategori), ikke etter fargelikhet.\n"
  );
  skriv(presisTreff);
}

if (offenders.length) {
  rødt = true;
  console.error(
    "check-token-gap: nye hardkodede fargeliteraler i style={{}} funnet.\n" +
      "Bruk T.farge.* (src/lib/v2/tokens.ts) i stedet — legg til en navngitt\n" +
      "konstant der om verdien mangler. Se docs/port/steg6-farge-literaler.md.\n"
  );
  skriv(offenders);
}

if (markupTreff.length) {
  rødt = true;
  console.error(
    "check-token-gap: hex-literaler i className eller SVG-attributt funnet.\n" +
      'Bruk var(--p-*) — også i Tailwind arbitrary values (bg-[var(--p-soft)])\n' +
      "og i fill/stroke. Er verdien bevisst tema-uavhengig, legg fila i\n" +
      "ALLOW_MARKUP i dette scriptet med én linje begrunnelse.\n"
  );
  skriv(markupTreff);
}

if (rødt) {
  process.exit(1);
} else {
  console.log(
    "check-token-gap: ingen Presis-farger, ingen hex i style={{}}, className eller SVG."
  );
}
