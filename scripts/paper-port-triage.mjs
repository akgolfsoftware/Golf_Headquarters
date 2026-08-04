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
// 2026-08-04-lærdom: 51 av 54 "ingen v2-import"-treff i første kjøring var rene
// redirect-stubber til allerede porta ruter, ikke skjermer i det hele tatt — talt
// som gjenstående arbeid før noen faktisk åpnet filene. Ekskluder dem mekanisk nå.
// Linjegrense (20) er bevisst — en ekte skjerm med en auth-guard-redirect øverst
// (f.eks. `if (!user) redirect(...)`) skal IKKE regnes som stubbe; alle 51 bekreftede
// stubber var 4-15 linjer, en ekte porta side i denne kodebasen er typisk 30+.
const REDIRECT_CALL = /redirect\(\s*["'`]/;
const STUB_MAKS_LINJER = 20;

const rows = [];
for (const file of walk(ROOT)) {
  const rel = file.replace(/\\/g, "/");
  const src = readFileSync(file, "utf8");
  const brukerV2 = V2_IMPORT.test(src);
  const brukerLegacy = LEGACY_SIGNAL.test(src);
  const linjer = src.split("\n").length;
  const erRedirect = REDIRECT_CALL.test(src) && linjer <= STUB_MAKS_LINJER;
  rows.push({ rel, brukerV2, brukerLegacy, erRedirect });
}

rows.sort((a, b) => a.rel.localeCompare(b.rel));

const ok = rows.filter((r) => r.brukerV2 && !r.brukerLegacy);
const blandet = rows.filter((r) => r.brukerV2 && r.brukerLegacy);
const utenV2 = rows.filter((r) => !r.brukerV2);
const redirects = utenV2.filter((r) => r.erRedirect);
const reellGjenstaende = utenV2.filter((r) => !r.erRedirect);

console.log(`Skannet ${rows.length} page.tsx under ${ROOT}\n`);
console.log(`Allerede v2 (ingen athletic-import): ${ok.length}`);
console.log(`Blandet (v2 + athletic i samme side): ${blandet.length}`);
console.log(`Ingen v2-import: ${utenV2.length} (${redirects.length} redirect-stubber, ${reellGjenstaende.length} reelt uportede)\n`);

console.log("── Blandet — sjekk disse først ──");
for (const r of blandet) console.log(`  ${r.rel}`);

console.log("\n── Reelt uportede (ingen v2-import, ikke redirect) ──");
for (const r of reellGjenstaende) console.log(`  ${r.rel}`);

console.log("\n── Redirect-stubber (informativt — IKKE gjenstående arbeid) ──");
for (const r of redirects) console.log(`  ${r.rel}`);
