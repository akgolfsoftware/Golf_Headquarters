#!/usr/bin/env node
// Paper-port gate: alle <V2Shell>-åpninger MÅ ha eksplisitt bredde-prop
// (monsterdokument-paper.md §1: kolonne 720px/74ch vs full).
// Kjør: node scripts/check-v2shell-bredde.mjs
// Exit 0 = OK, 1 = filer uten bredde.
//
// Merk: kobles inn i `npm run verify` FØRST når antall feilende filer er lavt
// (~≤20). Ellers blir main rød. Se docs/port/GROK-NATTORDRE-2026-08-06.md §4b B.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = "src";

/** Åpningstag: <V2Shell etterfulgt av whitespace, > eller / — ikke V2ShellProps. */
const OPEN_TAG = /<V2Shell(?=[\s/>])/g;

/**
 * Godtatte former (eksplisitt prop, verdi spiller mindre rolle for gaten):
 *   bredde="kolonne" | bredde='full' | bredde={"kolonne"} | bredde={'full'}
 *   bredde={`kolonne`} | bredde={variabel}
 */
const HAS_BREDDE = /\bbredde\s*=/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (p.endsWith(".tsx")) yield p;
  }
}

/**
 * Finn slutten av en JSX-åpningstag med brace-/streng-matching.
 * Starter på '<' i "<V2Shell...". Returnerer indeks for '>' eller -1.
 */
function findOpeningTagEnd(src, start) {
  let i = start + 1; // hopp over '<'
  let braceDepth = 0;
  let inStr = null;
  while (i < src.length) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      i++;
      continue;
    }
    if (c === "{") {
      braceDepth++;
      i++;
      continue;
    }
    if (c === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      i++;
      continue;
    }
    // '>' avslutter bare når vi ikke er inni en JSX-uttrykk-brace.
    if (c === ">" && braceDepth === 0) return i;
    i++;
  }
  return -1;
}

function lineOf(src, index) {
  let line = 1;
  for (let i = 0; i < index && i < src.length; i++) {
    if (src[i] === "\n") line++;
  }
  return line;
}

/** @type {{ file: string, line: number, snippet: string }[]} */
const offenders = [];

for (const file of walk(ROOT)) {
  const rel = file.replace(/\\/g, "/");
  const src = readFileSync(file, "utf8");
  if (!src.includes("<V2Shell")) continue;

  OPEN_TAG.lastIndex = 0;
  let m;
  while ((m = OPEN_TAG.exec(src)) !== null) {
    const start = m.index;
    const end = findOpeningTagEnd(src, start);
    if (end === -1) {
      offenders.push({
        file: rel,
        line: lineOf(src, start),
        snippet: src.slice(start, Math.min(start + 80, src.length)).replace(/\s+/g, " "),
      });
      continue;
    }
    const tag = src.slice(start, end + 1);
    if (HAS_BREDDE.test(tag)) continue;

    const line = lineOf(src, start);
    const snippet = tag.replace(/\s+/g, " ").slice(0, 100);
    offenders.push({ file: rel, line, snippet });
  }
}

const failingFiles = [...new Set(offenders.map((o) => o.file))].sort();

if (offenders.length) {
  console.error(
    "check-v2shell-bredde: <V2Shell uten eksplisitt bredde-prop.\n" +
      "\n" +
      "Hva du må gjøre: legg til bredde=\"kolonne\" eller bredde=\"full\" på\n" +
      "hver <V2Shell>-åpning (monsterdokument-paper.md §1).\n" +
      "  • kolonne — enkeltside/leseflate (720px / 74ch, sentrert)\n" +
      "  • full    — cockpit, workbench, kalender, hjem m.m. som trenger bredde\n" +
      "\n" +
      `Funnet ${offenders.length} åpning(er) i ${failingFiles.length} fil(er):\n` +
      offenders
        .map((o) => `  ${o.file}:${o.line}\n    ${o.snippet}`)
        .join("\n") +
      "\n\n" +
      `Oppsummering: ${failingFiles.length} fil(er) mangler bredde-prop.\n` +
      "Kjør: node scripts/check-v2shell-bredde.mjs\n",
  );
  // Skriv fil-listen sist, én per linje — greit å greppe/lime i PR-body.
  console.error("--- filer ---");
  for (const f of failingFiles) console.error(f);
  process.exit(1);
}

console.log("check-v2shell-bredde: OK — alle <V2Shell> har eksplisitt bredde-prop.");
process.exit(0);
