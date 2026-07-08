// CI-gate: ingen NYE rå hex-farger i skjermer/komponenter (opprydding Fase 2,
// docs/opprydding/03-opprydding-plan.md). Eksisterende hex er fryst i
// scripts/check-no-hex-baseline.json — en fil kan gå NED i antall (oppdater
// baseline med --update), aldri OPP. Nye filer skal ha null rå hex.
//
// Kjør:  node scripts/check-no-hex.mjs            (gate — feiler på nye brudd)
//        node scripts/check-no-hex.mjs --update   (skriv ny baseline etter migrering)
//
// Omfang: src/app + src/components (.ts/.tsx/.css), ekskludert token-kildene:
// globals.css, golfdata.css og src/styles/ (utenfor omfanget uansett).
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOTS = ["src/app", "src/components"];
const EXTS = new Set([".ts", ".tsx", ".css"]);
const EXCLUDE = [
  path.normalize("src/app/globals.css"),
  path.normalize("src/components/athletic/golfdata/golfdata.css"),
];
const BASELINE_FILE = "scripts/check-no-hex-baseline.json";
const HEX = /#[0-9a-fA-F]{6}\b/g;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXTS.has(path.extname(p))) yield p;
  }
}

const counts = {};
for (const root of ROOTS) {
  for (const f of walk(root)) {
    const rel = path.normalize(f).split(path.sep).join("/");
    if (EXCLUDE.includes(path.normalize(f))) continue;
    const n = (readFileSync(f, "utf8").match(HEX) || []).length;
    if (n > 0) counts[rel] = n;
  }
}

if (process.argv.includes("--update")) {
  const sorted = Object.fromEntries(Object.entries(counts).sort());
  writeFileSync(BASELINE_FILE, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Baseline oppdatert: ${Object.keys(sorted).length} filer, ${Object.values(sorted).reduce((a, b) => a + b, 0)} hex totalt.`);
  process.exit(0);
}

let baseline;
try {
  baseline = JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
} catch {
  console.error(`FEIL: fant ikke ${BASELINE_FILE}. Kjør med --update for å opprette den.`);
  process.exit(1);
}

const brudd = [];
for (const [fil, n] of Object.entries(counts)) {
  const tillatt = baseline[fil] ?? 0;
  if (n > tillatt) brudd.push(`  ${fil}: ${n} rå hex (baseline tillater ${tillatt})`);
}

if (brudd.length) {
  console.error("check-no-hex: NYE rå hex-farger funnet — bruk tokens (bg-primary, var(--signal), --axis-*):");
  console.error(brudd.join("\n"));
  process.exit(1);
}

const migrert = Object.keys(baseline).filter((f) => (counts[f] ?? 0) < baseline[f]);
if (migrert.length) {
  console.log(`check-no-hex: OK. ${migrert.length} fil(er) har FÆRRE hex enn baseline — kjør --update for å låse fremgangen.`);
} else {
  console.log("check-no-hex: OK — ingen nye rå hex.");
}
