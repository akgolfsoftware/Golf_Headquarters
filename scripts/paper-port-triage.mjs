#!/usr/bin/env node
// Designport steg 7-9 — kartlegging FØR bygging (docs/port/plan-designport-alle-skjermer.md
// steg 7-arbeidsmåte, revidert 2026-08-04). Mekanisk sortering, ikke agent-gjetting
// (samme lærdom som steg 6): sjekker om hver skjerm allerede importerer fra
// components/v2 eller components/portal/v2 (arver Paper-paletten/formen fra steg 4-6
// automatisk) versus fortsatt kun bruker eldre, lokale/athletic-komponenter.
//
// Output er et signal, ikke en fasit — "allerede OK" betyr "bruker allerede riktige
// byggeklosser", ikke "visuelt ferdig vurdert". Kjør: node scripts/paper-port-triage.mjs [rot]

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] ?? "src/app/portal";

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (name === "page.tsx") yield p;
  }
}

const V2_IMPORT = /from\s+["']@\/components\/(?:v2|portal\/v2)\//;
const LEGACY_SIGNAL = /from\s+["']@\/components\/athletic\//;

const rows = [];
for (const file of walk(ROOT)) {
  const rel = file.replace(/\\/g, "/");
  const src = readFileSync(file, "utf8");
  const brukerV2 = V2_IMPORT.test(src);
  const brukerLegacy = LEGACY_SIGNAL.test(src);
  rows.push({ rel, brukerV2, brukerLegacy });
}

rows.sort((a, b) => a.rel.localeCompare(b.rel));

const ok = rows.filter((r) => r.brukerV2 && !r.brukerLegacy);
const blandet = rows.filter((r) => r.brukerV2 && r.brukerLegacy);
const legacy = rows.filter((r) => !r.brukerV2);

console.log(`Skannet ${rows.length} page.tsx under ${ROOT}\n`);
console.log(`Allerede v2 (ingen athletic-import): ${ok.length}`);
console.log(`Blandet (v2 + athletic i samme side): ${blandet.length}`);
console.log(`Ingen v2-import ennå: ${legacy.length}\n`);

console.log("── Blandet — sjekk disse først ──");
for (const r of blandet) console.log(`  ${r.rel}`);

console.log("\n── Ingen v2-import ──");
for (const r of legacy) console.log(`  ${r.rel}`);
