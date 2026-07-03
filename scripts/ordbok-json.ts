/**
 * Lag 3 av terminologi-systemet: genererer docs/ordbok.json (maskinlesbar ordbok)
 * og VALIDERER underveis:
 *   1. Alle Prisma-enums (navn + verdier) hentes rett fra prisma/schema.prisma (fasit).
 *   2. Hvis MasterBrain CANON finnes lokalt, kryssjekkes CS-nivåer og L-faser mot canon
 *      (avvik → exit 1). Mangler canon-fila (annen maskin), hoppes sjekken over med varsel.
 *   3. Ordboken (docs/ordbok-ak-golf-konsept.md) må nevne hvert enum-navn — ellers exit 1.
 *
 * Kjør: npx tsx scripts/ordbok-json.ts
 * Kjede ved endringer: canon → ordbok.md → design-guide → denne (regenerer json) → kode.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Kjøres fra repo-rot (som øvrige scripts/): npx tsx scripts/ordbok-json.ts
const ROT = process.cwd();
const SCHEMA = join(ROT, "prisma/schema.prisma");
const ORDBOK = join(ROT, "docs/ordbok-ak-golf-konsept.md");
const UT = join(ROT, "docs/ordbok.json");
const CANON = join(
  process.env.HOME ?? "",
  "Developer/Masterbrain/knowledge/concepts/canon-methodology.json",
);

// ── 1. Prisma-enums fra schema (fasit for kode-vokabular) ──────────
const schema = readFileSync(SCHEMA, "utf-8");
const enums: Record<string, string[]> = {};
for (const m of schema.matchAll(/^enum\s+(\w+)\s*\{([^}]*)\}/gm)) {
  const verdier = m[2]
    .split("\n")
    .map((l) => l.split("//")[0].trim())
    .filter((v) => /^[A-Z0-9_]+$/.test(v));
  enums[m[1]] = verdier;
}

// ── 2. Konsept-vokabular (fasit: canon v3.5 + ordbok 2026-07-03) ───
const konsept = {
  pyramide: {
    omraader: ["FYS", "TEK", "SLAG", "SPILL", "TURN"],
    labels: { FYS: "Fysisk", TEK: "Teknisk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering" },
    fargerLysFlate: { FYS: "#005840", TEK: "#B8852A", SLAG: "#2563EB", SPILL: "#D1F843", TURN: "#A32D2D" },
    fargerWorkbenchMork: { FYS: "#56C59A", TEK: "#E8A33D", SLAG: "#84A9FF", SPILL: "#D1F843", TURN: "#F2908C" },
  },
  lFaser: {
    rekkefolge: ["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"],
    // canon v3.5: cs-intervall, miljø-intervall, TEK-andel
    verdier: {
      L_KROPP: { cs: "CS20-40", miljo: "M0-M1", tekProsent: "60-80", ball: false },
      L_ARM: { cs: "CS20-50", miljo: "M1-M2", tekProsent: "50-70", ball: "minimal" },
      L_KOLLE: { cs: "CS50-70", miljo: "M2-M3", tekProsent: "40-60", ball: false },
      L_BALL: { cs: "CS60-80", miljo: "M3-M4", tekProsent: "30-50", ball: true },
      L_AUTO: { cs: "CS80-100", miljo: "M4-M5", tekProsent: "20-40", ball: true },
    },
    prioritetsregel: "L_KROPP og L_ARM overstyrer all SG-prioritering",
  },
  cs: {
    betyr: "Club Speed (% av spillerens maks)",
    nivaaer: ["CS20", "CS30", "CS40", "CS50", "CS60", "CS70", "CS80", "CS90", "CS100"],
    kodeStatus: "Prisma-enum CSNivaa har kun CS50-CS100 — CS20/30/40 venter migrering",
  },
  miljo: {
    nivaaer: ["M0", "M1", "M2", "M3", "M4", "M5"],
    beskrivelser: {
      M0: "Kontrollert range/rom, ingen mål, ingen ball",
      M1: "Kontrollert range, enkelt mål",
      M2: "Driving range med definerte mål og distanser",
      M3: "Baneøving uten konkurranse",
      M4: "Bane med scoringsfokus, simulert konkurranse",
      M5: "Faktiske turneringsforhold",
    },
  },
  press: {
    nivaaer: ["PR1", "PR2", "PR3", "PR4", "PR5"],
    beskrivelser: {
      PR1: "Minimalt press — ren teknikk-drill",
      PR2: "Lett press — mål definert, ingen konkurranse",
      PR3: "Moderat press — scoringssystem eller partner",
      PR4: "Høyt press — simulert turnering eller poeng på spill",
      PR5: "Maksimalt press — faktisk turneringssituasjon",
    },
  },
  treningsomraader: {
    enhetPutting: "ft",
    enhetInnspill: "m (kode i dag) / yards (intelligence-taksonomi)",
    alle: ["TEE", "INN200", "INN150", "INN100", "INN50", "CHIP", "PITCH", "LOB", "BUNKER",
      "PUTT0_3", "PUTT3_6", "PUTT6_10", "PUTT10_20", "PUTT20_40", "PUTT40P", "SPILL"],
  },
  sg: {
    kategorier: { OTT: "Tee-slag", APP: "Innspill", ARG: "Nærspill", PUTT: "Putting" },
    format: "komma-desimal med fortegn, f.eks. +1,2",
    positivFarge: "text-success",
    negativFarge: "text-destructive",
  },
  spillerkategorierCanon: {
    skala: "A-K",
    retning: "A = komplett nybegynner (HCP 54+) → K = tour-proff (+4 eller bedre)",
    kodeStatus: "NgfKategori (A-L, A=elite) og SPILLERKATEGORIER har MOTSATT retning — migrering utestår",
  },
  forbudteTermer: [
    { forbudt: "elev", bruk: "spiller" },
    { forbudt: "trener (alene)", bruk: "coach" },
    { forbudt: "goal", bruk: "mål" },
    { forbudt: "session", bruk: "økt" },
    { forbudt: "workout", bruk: "økt" },
    { forbudt: "stats", bruk: "statistikk" },
    { forbudt: "schedule", bruk: "plan / kalender" },
    { forbudt: "subscription", bruk: "abonnement" },
    { forbudt: "kort spill / kortspill", bruk: "nærspill" },
    { forbudt: "rundt green (som ARG-label)", bruk: "nærspill" },
    { forbudt: "Error", bruk: "Noe gikk galt" },
    { forbudt: "emoji i UI", bruk: "Lucide-ikoner" },
  ],
  formatRegler: {
    desimal: "komma",
    tusenskille: "mellomrom",
    tid: "24h (09:00)",
    periodeSkille: "tankestrek (—)",
    puttingAvstand: "alltid ft",
    hcpFortegn: "+3,5 / −3,5 (ekte minus-tegn)",
    kpiTall: "JetBrains Mono",
  },
};

// ── 3. Valider mot canon hvis tilgjengelig ─────────────────────────
let canonSjekket = false;
if (existsSync(CANON)) {
  type CanonFase = { cs_range?: string; env_range?: string };
  const canon = JSON.parse(readFileSync(CANON, "utf-8")) as {
    version?: string;
    scale_definitions?: { cs?: { levels?: { level: string }[] } };
    l_faser?: Record<string, CanonFase>;
  };
  const canonCs = (canon.scale_definitions?.cs?.levels ?? []).map((l) => l.level);
  const avvik: string[] = [];
  for (const n of konsept.cs.nivaaer) {
    if (!canonCs.includes(n)) avvik.push(`CS-nivå ${n} mangler i canon`);
  }
  for (const [fase, v] of Object.entries(konsept.lFaser.verdier)) {
    const canonFase = canon.l_faser?.[fase.replace("_", "-")];
    if (canonFase?.cs_range && canonFase.cs_range !== v.cs) {
      avvik.push(`${fase}: cs ${v.cs} ≠ canon ${canonFase.cs_range}`);
    }
  }
  if (avvik.length > 0) {
    console.error("CANON-AVVIK:\n" + avvik.map((a) => ` - ${a}`).join("\n"));
    process.exit(1);
  }
  canonSjekket = true;
} else {
  console.warn("Advarsel: canon-methodology.json ikke funnet — canon-sjekk hoppet over.");
}

// ── 4. Valider at ordboken dekker alle enums ───────────────────────
const ordbok = readFileSync(ORDBOK, "utf-8");
const udekket = Object.keys(enums).filter((navn) => !ordbok.includes(navn));
if (udekket.length > 0) {
  console.error("Enums i schema som IKKE er nevnt i ordboken:\n" + udekket.map((n) => ` - ${n}`).join("\n"));
  process.exit(1);
}

// ── 4b. Valider at Claude Design-kopien av design-guiden ikke har driftet ──
const GUIDE = join(ROT, "docs/design-guide-terminologi.md");
const GUIDE_KOPI = join(ROT, "docs/claude-design/ordbok-design-guide.md");
if (existsSync(GUIDE_KOPI)) {
  const kanonisk = readFileSync(GUIDE, "utf-8").trim();
  // Kopien har én KOPI-headerlinje + blank linje øverst — resten skal være identisk.
  const kopi = readFileSync(GUIDE_KOPI, "utf-8").split("\n").slice(2).join("\n").trim();
  if (kopi !== kanonisk) {
    console.error(
      "DRIFT: docs/claude-design/ordbok-design-guide.md avviker fra docs/design-guide-terminologi.md.\n" +
        "Synk med: { head -2 docs/claude-design/ordbok-design-guide.md; cat docs/design-guide-terminologi.md; } > tmp && mv tmp docs/claude-design/ordbok-design-guide.md",
    );
    process.exit(1);
  }
}

// ── 5. Skriv json ──────────────────────────────────────────────────
const ut = {
  $schema: "ordbok-lag-3",
  versjon: "2026-07-03",
  kilder: {
    canon: "MasterBrain CANON v3.5 (canon-methodology.json + l-faser.json)",
    ordbok: "docs/ordbok-ak-golf-konsept.md",
    designGuide: "docs/design-guide-terminologi.md",
    schema: "prisma/schema.prisma",
  },
  canonSjekket,
  konsept,
  prismaEnums: enums,
};
writeFileSync(UT, JSON.stringify(ut, null, 2) + "\n", "utf-8");
console.log(
  `OK: docs/ordbok.json skrevet — ${Object.keys(enums).length} enums, canon-sjekk: ${canonSjekket ? "bestått" : "hoppet over"}.`,
);
