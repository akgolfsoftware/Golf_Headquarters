/**
 * Genererer docs/ordbok.json (maskinlesbar ordbok) og VALIDERER underveis:
 *   1. Alle Prisma-enums (navn + verdier) hentes rett fra prisma/schema.prisma.
 *   2. Masteren (docs/ordbok-master-trening.md) må nevne hver verdi i de trenings-
 *      relevante enumene — ellers exit 1. Da kan ikke dokument og kode skli fra hverandre.
 *   3. Ingen utgåtte koder (L-faser, CS20–40, M0–M5, PR1–PR5, gamle områdekoder) får
 *      brukes i nye kodefiler utenfor migreringsbroene — ellers exit 1.
 *
 * Kjør: npx tsx scripts/ordbok-json.ts
 * Kilde for betydning og skjermnavn: docs/ordbok-master-trening.md. Denne fila gjentar
 * ikke betydningen — den speiler kodens lister og peker på masteren.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  BELASTNING_LABEL,
  DIMENSJON_LABEL,
  MOTORIKK_LABEL,
  OMRAADER,
  PRESS_LABEL,
  PYRAMIDE_LABEL,
} from "../src/lib/domain/ak-formel-v2";

const ROT = process.cwd();
const SCHEMA = join(ROT, "prisma/schema.prisma");
const MASTER = join(ROT, "docs/ordbok-master-trening.md");
const UT = join(ROT, "docs/ordbok.json");

// ── 1. Prisma-enums fra schema ─────────────────────────────────────
const schema = readFileSync(SCHEMA, "utf-8");
const enums: Record<string, string[]> = {};
for (const m of schema.matchAll(/^enum\s+(\w+)\s*\{([^}]*)\}/gm)) {
  const verdier = m[2]
    .split("\n")
    .map((l) => l.split("//")[0].trim())
    .filter((v) => /^[A-Z0-9_]+$/.test(v));
  enums[m[1]] = verdier;
}

// ── 2. Masteren må dekke de treningsrelevante enumene ──────────────
const MAA_DEKKES = [
  "PyramidArea", "Omraade", "Motorikk", "Belastning", "Press", "OmradeDimensjon", "SandTrinn",
  "InnslagType", "RepType", "PracticeType", "DrillPracticeType", "LPhase", "PlanStatus",
  "SessionStatusV2", "OktAvbruddAarsak", "KondisjonSegmentType", "TournamentEntryStatus",
  "NgfKategori", "PlayerProgram", "SgCategory", "InsightCategory", "TrackManEnvironment",
  "RepHastighet", "PeriodGoalStatus", "GoalCategory", "TaskKategori", "DrillFasilitet",
];
const master = readFileSync(MASTER, "utf-8");
const mangler: string[] = [];
for (const navn of MAA_DEKKES) {
  const verdier = enums[navn];
  if (!verdier) { mangler.push(`${navn}: finnes ikke i schema.prisma`); continue; }
  for (const v of verdier) {
    if (v.length > 1 && !master.includes(v)) mangler.push(`${navn}.${v}`);
  }
}
if (mangler.length > 0) {
  console.error("Enum-verdier i schema som IKKE er nevnt i docs/ordbok-master-trening.md:\n" +
    mangler.map((n) => ` - ${n}`).join("\n"));
  process.exit(1);
}

// ── 3. Vakt mot utgåtte koder i ny kode ────────────────────────────
// Broene som oversetter gammelt → nytt er unntatt. Alt annet i src/ skal bruke v2.
const UTGAATT = /\b(L_KROPP|L_ARM|L_KOLLE|CS20|CS30|CS40|INNSPILL_0_50|PUTT_10_15|PUTT_15_25|PUTT_10_40)\b/;
const UNNTAK = new Set([
  "src/lib/domain/ak-formel-v2.ts",
  "src/lib/ak-formel-visning.ts",
  "src/lib/taxonomy.ts",
  "src/lib/portal/translate-taxonomy.ts",
  "src/lib/portal/training/ak-taxonomy.ts",
  "src/lib/workbench/ak-formel.ts",
  "src/lib/workbench/session-update.ts",
  "src/lib/training/skills/progression.ts",
  "src/components/teknisk-plan/constants.ts",
  "src/components/workbench-hybrid/taxonomy.ts",
  "src/app/portal/utviklingsplan/page.tsx",
  "src/lib/transcribe.ts",
  "src/lib/transcribe.test.ts",
  "src/lib/__tests__/ai/live-coach-prompt.test.ts",
  // Kjente avvik som ryddes i OW-2 (docs/MASTERPLAN-GJENSTAAENDE.md) — ikke legg til flere her:
  "src/components/workbench-hybrid/demo-data.ts",
  "src/lib/datagolf/stasjon.ts",
  "src/lib/domain/fangst-chips.ts",
]);
function* filer(dir: string): Generator<string> {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (n === "node_modules" || n === "generated" || n === "masterbrain" || n === "ai-coach") continue;
    if (statSync(p).isDirectory()) yield* filer(p);
    else if (/\.(ts|tsx)$/.test(n)) yield p;
  }
}
const treff: string[] = [];
for (const p of filer(join(ROT, "src"))) {
  const rel = relative(ROT, p);
  if (UNNTAK.has(rel) || /\.test\.tsx?$/.test(rel)) continue;
  const linjer = readFileSync(p, "utf-8").split("\n");
  linjer.forEach((l, i) => { if (UTGAATT.test(l)) treff.push(`${rel}:${i + 1}`); });
}
if (treff.length > 0) {
  console.error("Utgåtte koder brukt utenfor migreringsbroene (se docs/ordbok-master-trening.md kap. 17):\n" +
    treff.map((t) => ` - ${t}`).join("\n"));
  process.exit(1);
}

// ── 4. Skriv json ──────────────────────────────────────────────────
const ut = {
  $schema: "ordbok-lag-3",
  versjon: new Date().toISOString().slice(0, 10),
  kilder: {
    master: "docs/ordbok-master-trening.md",
    schema: "prisma/schema.prisma",
    kode: "src/lib/domain/ak-formel-v2.ts",
  },
  pyramide: PYRAMIDE_LABEL,
  omraader: OMRAADER,
  motorikk: MOTORIKK_LABEL,
  belastning: BELASTNING_LABEL,
  press: PRESS_LABEL,
  dimensjon: DIMENSJON_LABEL,
  sg: { kategorier: { OTT: "Utslag", APP: "Innspill", ARG: "Nærspill", PUTT: "Putting" }, format: "+1,2 / −0,4" },
  format: { desimal: "komma", tusenskille: "mellomrom", tid: "24h (09:00)", putting: "fot", avstand: "meter", hastighet: "mph" },
  prismaEnums: enums,
};
writeFileSync(UT, JSON.stringify(ut, null, 2) + "\n", "utf-8");
console.log(`OK: docs/ordbok.json skrevet — ${Object.keys(enums).length} enums, master dekker ${MAA_DEKKES.length} treningsenums, ingen utgåtte koder utenfor broene.`);
