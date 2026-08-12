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

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) yield p;
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

if (offenders.length) {
  console.error(
    "check-token-gap: nye hardkodede fargeliteraler i style={{}} funnet.\n" +
      "Bruk T.farge.* (src/lib/v2/tokens.ts) i stedet — legg til en navngitt\n" +
      "konstant der om verdien mangler. Se docs/port/steg6-farge-literaler.md.\n"
  );
  for (const o of offenders) {
    console.error(`  ${o.file}: ${o.hits.join(", ")}`);
  }
  process.exit(1);
} else {
  console.log("check-token-gap: ingen hardkodede fargeliteraler i style={{}}.");
}
