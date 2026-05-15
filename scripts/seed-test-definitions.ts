/**
 * Seed 20 Team Norway testdefinisjoner basert på NGF-protokollen
 * (team-norway-treningsprotokoll-og-tester-for-spillerv3.xlsx).
 *
 * Kjør: npx tsx scripts/seed-test-definitions.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

type ShotDef = {
  nr: number;
  label: string;
  target?: number;
  category?: string;
};

type InputField = {
  key: string;
  label: string;
  unit: string;
};

type Protocol = {
  totalShots: number;
  shots: ShotDef[];
  inputFields: InputField[];
  scoring: string;
  scoringDescription: string;
};

type TestSeed = {
  name: string;
  description: string;
  pyramidArea: PyramidArea;
  scoringRule: string;
  protocol: Protocol;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shotSequence(
  pattern: Array<{ label: string; target: number; category: string }>,
  repeats: number,
): ShotDef[] {
  const shots: ShotDef[] = [];
  for (let r = 0; r < repeats; r++) {
    for (const p of pattern) {
      shots.push({
        nr: shots.length + 1,
        label: p.label,
        target: p.target,
        category: p.category,
      });
    }
  }
  return shots;
}

function numberedShots(count: number, label: string, target?: number): ShotDef[] {
  return Array.from({ length: count }, (_, i) => ({
    nr: i + 1,
    label: `${label} #${i + 1}`,
    ...(target !== undefined ? { target } : {}),
  }));
}

// ---------------------------------------------------------------------------
// 8-ball pattern (shared by Variation and Blocked)
// ---------------------------------------------------------------------------

const EIGHT_BALL_CATEGORIES = [
  { label: "Chip 10m", target: 10, category: "Chip" },
  { label: "Chip 30m", target: 30, category: "Chip" },
  { label: "Wedge 20m", target: 20, category: "Wedge" },
  { label: "Wedge 40m", target: 40, category: "Wedge" },
  { label: "Lobb 15m", target: 15, category: "Lobb" },
  { label: "Lobb 25m", target: 25, category: "Lobb" },
  { label: "Bunker 10m", target: 10, category: "Bunker" },
  { label: "Bunker 20m", target: 20, category: "Bunker" },
];

const EIGHT_BALL_VARIATION_SHOTS = shotSequence(EIGHT_BALL_CATEGORIES, 3);

const EIGHT_BALL_BLOCKED_SHOTS: ShotDef[] = [];
for (const cat of EIGHT_BALL_CATEGORIES) {
  for (let i = 0; i < 3; i++) {
    EIGHT_BALL_BLOCKED_SHOTS.push({
      nr: EIGHT_BALL_BLOCKED_SHOTS.length + 1,
      label: cat.label,
      target: cat.target,
      category: cat.category,
    });
  }
}

// ---------------------------------------------------------------------------
// PEI input field (shared by many tests)
// ---------------------------------------------------------------------------

const PEI_INPUT: InputField[] = [
  { key: "resultatM", label: "Resultat fra hull", unit: "m" },
];

const CARRY_INPUT: InputField[] = [
  { key: "carry", label: "Carry", unit: "m" },
  { key: "carrySide", label: "Carry side (+/-)", unit: "m" },
];

const OK_INPUT: InputField[] = [
  { key: "ok", label: "OK", unit: "ja/nei" },
];

const POINTS_INPUT: InputField[] = [
  { key: "poeng", label: "Poeng", unit: "poeng" },
];

const DISTANCE_INPUT: InputField[] = [
  { key: "distanse", label: "Avstand forbi hull", unit: "m" },
];

// ---------------------------------------------------------------------------
// 20 Team Norway test definitions
// ---------------------------------------------------------------------------

const TESTS: TestSeed[] = [
  // ===== SLAG (6) =====
  {
    name: "8-ball Variation",
    description:
      "24 nærspillslag i roterende rekkefølge: chip (10m/30m), wedge (20m/40m), lobb (15m/25m) og bunker (10m/20m). Tre runder gjennom alle 8 slagtyper. Tester evnen til å variere mellom ulike slag under press.",
    pyramidArea: "SLAG",
    scoringRule:
      "Mål avstand fra hull i meter per slag. Endelig score = gjennomsnittlig PEI (Proximity to Expected Impact) over alle 24 slag. Lavere PEI = bedre presisjon.",
    protocol: {
      totalShots: 24,
      shots: EIGHT_BALL_VARIATION_SHOTS,
      inputFields: PEI_INPUT,
      scoring: "pei_average",
      scoringDescription: "Gjennomsnittlig avstand fra hull (m). Lavere er bedre.",
    },
  },
  {
    name: "8-ball Blocked",
    description:
      "24 nærspillslag i blokk-rekkefølge: 3x chip 10m, 3x chip 30m, 3x wedge 20m, 3x wedge 40m, 3x lobb 15m, 3x lobb 25m, 3x bunker 10m, 3x bunker 20m. Tester konsistens innenfor hver slagtype.",
    pyramidArea: "SLAG",
    scoringRule:
      "Mål avstand fra hull i meter per slag. Score = gjennomsnittlig PEI. Sammenlignes med 8-ball Variation for å se forskjellen mellom blokkert og variert trening.",
    protocol: {
      totalShots: 24,
      shots: EIGHT_BALL_BLOCKED_SHOTS,
      inputFields: PEI_INPUT,
      scoring: "pei_average",
      scoringDescription: "Gjennomsnittlig avstand fra hull (m). Lavere er bedre.",
    },
  },
  {
    name: "Golfslag Bane",
    description:
      "30 slag fra bane: inspill, wedge og bunker fra realistiske posisjoner. Hver slag måles med avstand til hull og beregner PEI og Strokes Gained. Gir et komplett bilde av nærspillnivået under bane-lignende forhold.",
    pyramidArea: "SLAG",
    scoringRule:
      "Mål avstand fra hull per slag. Score = total SG (Strokes Gained) over 30 slag. Positiv SG = bedre enn referanse.",
    protocol: {
      totalShots: 30,
      shots: [
        { nr: 1, label: "Inspill 129m", target: 129, category: "Inspill" },
        { nr: 2, label: "Inspill 150m", target: 150, category: "Inspill" },
        { nr: 3, label: "Inspill 237m", target: 237, category: "Inspill" },
        { nr: 4, label: "Inspill 195m", target: 195, category: "Inspill" },
        { nr: 5, label: "Inspill 172m", target: 172, category: "Inspill" },
        { nr: 6, label: "Inspill 185m", target: 185, category: "Inspill" },
        { nr: 7, label: "Inspill 211m", target: 211, category: "Inspill" },
        { nr: 8, label: "Wedge 87m", target: 87, category: "Wedge" },
        { nr: 9, label: "Inspill 184m", target: 184, category: "Inspill" },
        { nr: 10, label: "Inspill 190m", target: 190, category: "Inspill" },
        { nr: 11, label: "Inspill 143m", target: 143, category: "Inspill" },
        { nr: 12, label: "Inspill 238m", target: 238, category: "Inspill" },
        { nr: 13, label: "Inspill 160m", target: 160, category: "Inspill" },
        { nr: 14, label: "Wedge 69m", target: 69, category: "Wedge" },
        { nr: 15, label: "Inspill 160m", target: 160, category: "Inspill" },
        { nr: 16, label: "Inspill 200m", target: 200, category: "Inspill" },
        { nr: 17, label: "Wedge 75m", target: 75, category: "Wedge" },
        { nr: 18, label: "Inspill 150m", target: 150, category: "Inspill" },
        { nr: 19, label: "Wedge 35m", target: 35, category: "Wedge" },
        { nr: 20, label: "Wedge 47m", target: 47, category: "Wedge" },
        { nr: 21, label: "Wedge 59m", target: 59, category: "Wedge" },
        { nr: 22, label: "Wedge 72m", target: 72, category: "Wedge" },
        { nr: 23, label: "Inspill 120m", target: 120, category: "Inspill" },
        { nr: 24, label: "Inspill 150m", target: 150, category: "Inspill" },
        { nr: 25, label: "Inspill 170m", target: 170, category: "Inspill" },
        { nr: 26, label: "Inspill 145m", target: 145, category: "Inspill" },
        { nr: 27, label: "Bunker 120m", target: 120, category: "Bunker" },
        { nr: 28, label: "Bunker 12m", target: 12, category: "Bunker" },
        { nr: 29, label: "Bunker 17m", target: 17, category: "Bunker" },
        { nr: 30, label: "Bunker 10m", target: 10, category: "Bunker" },
      ],
      inputFields: PEI_INPUT,
      scoring: "pei_average",
      scoringDescription:
        "Gjennomsnittlig avstand fra hull (m) over 30 slag. Lavere er bedre.",
    },
  },
  {
    name: "Driver Basic",
    description:
      "5 driver-slag. Mål carry-lengde og sideavvik. Beregner PEI og Strokes Gained fra tee. Gutter: mål 270m. Jenter: mål 220m. Tester konsistens og presisjon med driver.",
    pyramidArea: "SLAG",
    scoringRule:
      "Registrer carry (m) og sideavvik (m, +/-) per slag. Score = gjennomsnittlig carry og total PEI. Høyere carry + lavere sideavvik = bedre.",
    protocol: {
      totalShots: 5,
      shots: numberedShots(5, "Driver", 270),
      inputFields: CARRY_INPUT,
      scoring: "carry_average",
      scoringDescription:
        "Gjennomsnittlig carry (m). Sideavvik rapporteres separat.",
    },
  },
  {
    name: "Inspill Basis",
    description:
      "5 inspill-slag mot fast mål. Gutter: mål 145m. Jenter: mål 125m/160m avhengig av nivå. Måler carry og sideavvik. Tester presisjon med lange jern / hybrid.",
    pyramidArea: "SLAG",
    scoringRule:
      "Registrer carry (m) og sideavvik (m) per slag. Score = gjennomsnittlig PEI og SG. Lavere avvik fra mål = bedre.",
    protocol: {
      totalShots: 5,
      shots: numberedShots(5, "Inspill", 145),
      inputFields: CARRY_INPUT,
      scoring: "carry_average",
      scoringDescription:
        "Gjennomsnittlig carry (m) og sideavvik. Lavere PEI = bedre.",
    },
  },
  {
    name: "Wedge Variation",
    description:
      "9 wedge-slag med variasjon i avstand og vinkel. Tester evnen til å kontrollere wedge-lengder under skiftende forhold. Carry og sideavvik registreres.",
    pyramidArea: "SLAG",
    scoringRule:
      "Registrer carry (m) og sideavvik (m) per slag. Score = gjennomsnittlig PEI over 9 slag. Lavere PEI = bedre presisjon.",
    protocol: {
      totalShots: 9,
      shots: [
        { nr: 1, label: "Wedge 58m", target: 58, category: "Wedge" },
        { nr: 2, label: "Wedge 37m", target: 37, category: "Wedge" },
        { nr: 3, label: "Wedge 87m", target: 87, category: "Wedge" },
        { nr: 4, label: "Wedge 63m", target: 63, category: "Wedge" },
        { nr: 5, label: "Wedge 48m", target: 48, category: "Wedge" },
        { nr: 6, label: "Wedge 57m", target: 57, category: "Wedge" },
        { nr: 7, label: "Wedge 33m", target: 33, category: "Wedge" },
        { nr: 8, label: "Wedge 66m", target: 66, category: "Wedge" },
        { nr: 9, label: "Wedge 54m", target: 54, category: "Wedge" },
      ],
      inputFields: CARRY_INPUT,
      scoring: "carry_average",
      scoringDescription:
        "Gjennomsnittlig avstand til mål (m). Lavere er bedre.",
    },
  },

  // ===== TEK (6) =====
  {
    name: "TN Nærspill Gate",
    description:
      "9 nærspillslag gjennom gate. Tre launch-høyder (lav, middels, høy) mot tre carry-soner (2m, 3m, 4m). Tester evnen til å kontrollere bue og landing presist. Krever TrackMan eller lignende for launch-data.",
    pyramidArea: "TEK",
    scoringRule:
      "Hvert slag scores 0-2: 2 = gjennom gate OG riktig carry-sone, 1 = en av to, 0 = ingen. Maks 18 poeng. Høyere = bedre.",
    protocol: {
      totalShots: 9,
      shots: [
        { nr: 1, label: "Lav → 2m carry", target: 2, category: "Lav" },
        { nr: 2, label: "Lav → 3m carry", target: 3, category: "Lav" },
        { nr: 3, label: "Lav → 4m carry", target: 4, category: "Lav" },
        { nr: 4, label: "Middels → 2m carry", target: 2, category: "Middels" },
        { nr: 5, label: "Middels → 3m carry", target: 3, category: "Middels" },
        { nr: 6, label: "Middels → 4m carry", target: 4, category: "Middels" },
        { nr: 7, label: "Høy → 2m carry", target: 2, category: "Høy" },
        { nr: 8, label: "Høy → 3m carry", target: 3, category: "Høy" },
        { nr: 9, label: "Høy → 4m carry", target: 4, category: "Høy" },
      ],
      inputFields: POINTS_INPUT,
      scoring: "points_total",
      scoringDescription: "Total poeng (maks 18). Høyere er bedre.",
    },
  },
  {
    name: "TN Wedge Gate",
    description:
      "9 wedge-slag med krav til launch-vinkel og carry-mål. Tre launch-vinkler: lav (<26 grader), medium (28-30 grader), høy (>32 grader). Tre carry-mål: 40m, 50m, 60m (alle +/-3m). Tester teknisk kontroll over wedge-bue.",
    pyramidArea: "TEK",
    scoringRule:
      "Hvert slag scores 0-2: 2 = riktig launch OG carry innenfor +/-3m, 1 = en av to, 0 = ingen. Maks 18 poeng.",
    protocol: {
      totalShots: 9,
      shots: [
        { nr: 1, label: "Lav → 40m (+/-3)", target: 40, category: "Lav <26" },
        { nr: 2, label: "Lav → 50m (+/-3)", target: 50, category: "Lav <26" },
        { nr: 3, label: "Lav → 60m (+/-3)", target: 60, category: "Lav <26" },
        { nr: 4, label: "Medium → 40m (+/-3)", target: 40, category: "Medium 28-30" },
        { nr: 5, label: "Medium → 50m (+/-3)", target: 50, category: "Medium 28-30" },
        { nr: 6, label: "Medium → 60m (+/-3)", target: 60, category: "Medium 28-30" },
        { nr: 7, label: "Høy → 40m (+/-3)", target: 40, category: "Høy >32" },
        { nr: 8, label: "Høy → 50m (+/-3)", target: 50, category: "Høy >32" },
        { nr: 9, label: "Høy → 60m (+/-3)", target: 60, category: "Høy >32" },
      ],
      inputFields: POINTS_INPUT,
      scoring: "points_total",
      scoringDescription: "Total poeng (maks 18). Høyere er bedre.",
    },
  },
  {
    name: "TN Driver Gate",
    description:
      "6 driver-slag gjennom en gate plassert 2 meter bred på fairway. Tester evnen til å holde driver-slagene innenfor en smal korridor. Ren presisjon under press.",
    pyramidArea: "TEK",
    scoringRule:
      "Registrer OK/ikke OK per slag. Score = antall OK av 6. Maks 6 poeng.",
    protocol: {
      totalShots: 6,
      shots: numberedShots(6, "Driver Gate"),
      inputFields: OK_INPUT,
      scoring: "count_ok",
      scoringDescription: "Antall slag gjennom gate (maks 6). Høyere er bedre.",
    },
  },
  {
    name: "TN Putt Gate",
    description:
      "10 putter gjennom en 40cm gate. Tester start-retning og evnen til å starte ballen på riktig linje konsistent. Fundamental putting-teknikk.",
    pyramidArea: "TEK",
    scoringRule:
      "Registrer OK/ikke OK per putt. Score = antall OK av 10. Maks 10 poeng.",
    protocol: {
      totalShots: 10,
      shots: numberedShots(10, "Putt Gate 40cm"),
      inputFields: OK_INPUT,
      scoring: "count_ok",
      scoringDescription:
        "Antall putter gjennom gate (maks 10). Høyere er bedre.",
    },
  },
  {
    name: "TN VISA Express",
    description:
      "9 putter som tester speed-kontroll. Tre avstander (2m, 3m, 4m), tre putter fra hver. Måler om ballen stopper i riktig speed-sone bak hullet. Tester distansekontroll i putting.",
    pyramidArea: "TEK",
    scoringRule:
      "Hvert putt scores 0 eller 1 basert på om ballen stopper i riktig speed-sone. Maks 9 poeng.",
    protocol: {
      totalShots: 9,
      shots: [
        { nr: 1, label: "2m putt #1", target: 2, category: "2m" },
        { nr: 2, label: "3m putt #1", target: 3, category: "3m" },
        { nr: 3, label: "4m putt #1", target: 4, category: "4m" },
        { nr: 4, label: "2m putt #2", target: 2, category: "2m" },
        { nr: 5, label: "3m putt #2", target: 3, category: "3m" },
        { nr: 6, label: "4m putt #2", target: 4, category: "4m" },
        { nr: 7, label: "2m putt #3", target: 2, category: "2m" },
        { nr: 8, label: "3m putt #3", target: 3, category: "3m" },
        { nr: 9, label: "4m putt #3", target: 4, category: "4m" },
      ],
      inputFields: POINTS_INPUT,
      scoring: "points_total",
      scoringDescription: "Total poeng (maks 9). Høyere er bedre.",
    },
  },
  {
    name: "Teknikktest Spredning",
    description:
      "10 slag med samme kølle for å kartlegge spredningsmønster. Del A: 5 slag med valgt kølle for å etablere medianlengde. Del B: 10 slag der carry, side, PEI og impact-tall (club path, face angle, attack angle, dynamic loft) registreres. Tester teknisk konsistens.",
    pyramidArea: "TEK",
    scoringRule:
      "Score = median-spredning (standardavvik av carry i meter). Lavere spredning = bedre teknisk konsistens.",
    protocol: {
      totalShots: 10,
      shots: numberedShots(10, "Spredningsslag"),
      inputFields: [
        { key: "carry", label: "Carry", unit: "m" },
        { key: "carrySide", label: "Side (+/-)", unit: "m" },
      ],
      scoring: "spread_stddev",
      scoringDescription:
        "Standardavvik av carry (m). Lavere spredning = bedre.",
    },
  },

  // ===== SPILL (4) =====
  {
    name: "Putt 1-3m",
    description:
      "25 putter fra 5 avstander: 1m, 1.5m, 2m, 2.5m og 3m (5 putter fra hver avstand). Tester evnen til å hole korte putter konsistent — den viktigste putting-ferdigheten for scoring.",
    pyramidArea: "SPILL",
    scoringRule:
      "Registrer hull/bom per putt. Score = totalt antall hull av 25. Gjennomsnitt per avstand rapporteres også.",
    protocol: {
      totalShots: 25,
      shots: [
        ...Array.from({ length: 5 }, (_, i) => ({
          nr: i + 1,
          label: `1m putt #${i + 1}`,
          target: 1,
          category: "1m",
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          nr: i + 6,
          label: `1,5m putt #${i + 1}`,
          target: 1.5,
          category: "1,5m",
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          nr: i + 11,
          label: `2m putt #${i + 1}`,
          target: 2,
          category: "2m",
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          nr: i + 16,
          label: `2,5m putt #${i + 1}`,
          target: 2.5,
          category: "2,5m",
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          nr: i + 21,
          label: `3m putt #${i + 1}`,
          target: 3,
          category: "3m",
        })),
      ],
      inputFields: OK_INPUT,
      scoring: "count_ok",
      scoringDescription: "Antall hull av 25. Høyere er bedre.",
    },
  },
  {
    name: "Putt Speed 1x5",
    description:
      "5 putter fra 3 meters avstand. Fokus på speed-kontroll — mål hvor langt forbi (eller kort) hullet ballen stopper. Tester grunnleggende distansefølelse i putting.",
    pyramidArea: "SPILL",
    scoringRule:
      "Registrer avstand forbi hull (m) per putt. Negativt = kort. Score = gjennomsnittlig absolutt avstand fra hull. Lavere = bedre speed-kontroll.",
    protocol: {
      totalShots: 5,
      shots: numberedShots(5, "Speed putt 3m", 3),
      inputFields: DISTANCE_INPUT,
      scoring: "distance_average",
      scoringDescription:
        "Gjennomsnittlig avstand forbi hull (m). Lavere er bedre.",
    },
  },
  {
    name: "Putt Speed 3x3",
    description:
      "9 putter fra tre avstander: 3m, 5m og 7m (3 putter fra hver). Tester speed-kontroll over varierende distanser. Måler gjennomsnittlig avstand forbi/kort hullet.",
    pyramidArea: "SPILL",
    scoringRule:
      "Registrer avstand forbi hull (m) per putt. Score = gjennomsnittlig absolutt avstand. Rapporteres også per distanse-gruppe.",
    protocol: {
      totalShots: 9,
      shots: [
        { nr: 1, label: "3m putt #1", target: 3, category: "3m" },
        { nr: 2, label: "5m putt #1", target: 5, category: "5m" },
        { nr: 3, label: "7m putt #1", target: 7, category: "7m" },
        { nr: 4, label: "3m putt #2", target: 3, category: "3m" },
        { nr: 5, label: "5m putt #2", target: 5, category: "5m" },
        { nr: 6, label: "7m putt #2", target: 7, category: "7m" },
        { nr: 7, label: "3m putt #3", target: 3, category: "3m" },
        { nr: 8, label: "5m putt #3", target: 5, category: "5m" },
        { nr: 9, label: "7m putt #3", target: 7, category: "7m" },
      ],
      inputFields: DISTANCE_INPUT,
      scoring: "distance_average",
      scoringDescription:
        "Gjennomsnittlig avstand forbi hull (m). Lavere er bedre.",
    },
  },
  {
    name: "9 hull lengde",
    description:
      "9 slag der hovedfokus er lengdekontroll. Varierende mål-lengder tilsvarende en 9-hulls runde. Hvert slag scores basert på presisjonen til carry-lengden.",
    pyramidArea: "SPILL",
    scoringRule:
      "Hvert slag scores 0-6 poeng basert på avvik fra mål-lengde. Score = total poeng. Maks 54 poeng.",
    protocol: {
      totalShots: 9,
      shots: [
        { nr: 1, label: "Hull 1 — mål 5m", target: 5 },
        { nr: 2, label: "Hull 2 — mål 7m", target: 7 },
        { nr: 3, label: "Hull 3 — mål 11m", target: 11 },
        { nr: 4, label: "Hull 4 — mål 9m", target: 9 },
        { nr: 5, label: "Hull 5 — mål 6m", target: 6 },
        { nr: 6, label: "Hull 6 — mål 10m", target: 10 },
        { nr: 7, label: "Hull 7 — mål 8m", target: 8 },
        { nr: 8, label: "Hull 8 — mål 7m", target: 7 },
        { nr: 9, label: "Hull 9 — mål 9m", target: 9 },
      ],
      inputFields: POINTS_INPUT,
      scoring: "points_total",
      scoringDescription: "Total poeng (maks 54). Høyere er bedre.",
    },
  },

  // ===== TURN (4) =====
  {
    name: "18-hull Inspill",
    description:
      "18 inspill-slag som simulerer en full runde. Varierende lengder fra 49m til 220m. Beregner PEI og SG per slag og totalt. Gir et turneringsrealistisk bilde av inspill-nivået.",
    pyramidArea: "TURN",
    scoringRule:
      "Mål avstand fra hull per slag. Score = gjennomsnittlig PEI over 18 slag. Lavere = bedre. Total SG rapporteres også.",
    protocol: {
      totalShots: 18,
      shots: [
        { nr: 1, label: "Inspill 129m", target: 129 },
        { nr: 2, label: "Inspill 150m", target: 150 },
        { nr: 3, label: "Inspill 237m", target: 237 },
        { nr: 4, label: "Inspill 195m", target: 195 },
        { nr: 5, label: "Inspill 172m", target: 172 },
        { nr: 6, label: "Inspill 185m", target: 185 },
        { nr: 7, label: "Inspill 211m", target: 211 },
        { nr: 8, label: "Inspill 87m", target: 87 },
        { nr: 9, label: "Inspill 184m", target: 184 },
        { nr: 10, label: "Inspill 190m", target: 190 },
        { nr: 11, label: "Inspill 143m", target: 143 },
        { nr: 12, label: "Inspill 238m", target: 238 },
        { nr: 13, label: "Inspill 160m", target: 160 },
        { nr: 14, label: "Inspill 69m", target: 69 },
        { nr: 15, label: "Inspill 160m", target: 160 },
        { nr: 16, label: "Inspill 200m", target: 200 },
        { nr: 17, label: "Inspill 75m", target: 75 },
        { nr: 18, label: "Inspill 150m", target: 150 },
      ],
      inputFields: PEI_INPUT,
      scoring: "pei_average",
      scoringDescription:
        "Gjennomsnittlig avstand fra hull (m) over 18 slag. Lavere er bedre.",
    },
  },
  {
    name: "TN Slagtest",
    description:
      "18 slag med jern 7 (eller tilsvarende medianlengde-kølle). Registrerer carry og retning. Beregner PEI per slag. Team Norway standard-test for å evaluere grunnleggende slagkonsistens under turneringslignende press.",
    pyramidArea: "TURN",
    scoringRule:
      "Registrer carry (m) og retning (+/- m) per slag. Score = total PEI over 18 slag. Lavere = bedre konsistens.",
    protocol: {
      totalShots: 18,
      shots: numberedShots(18, "J7 Slagtest"),
      inputFields: [
        { key: "carry", label: "Carry", unit: "m" },
        { key: "retning", label: "Retning (+/-)", unit: "m" },
      ],
      scoring: "pei_total",
      scoringDescription: "Total PEI over 18 slag. Lavere er bedre.",
    },
  },
  {
    name: "TN Wedgetest",
    description:
      "18 wedge-slag: 9 blokkert (3x30m, 3x50m, 3x70m) + 9 variert (blanding av 30m, 50m, 70m). Tester wedge-presisjon i både stabil og skiftende kontekst. Sammenligner blokkert vs. variert prestasjon.",
    pyramidArea: "TURN",
    scoringRule:
      "Registrer carry (m) og retning (+/- m) per slag. Score = total PEI. Rapporteres separat for blokkert og variert del.",
    protocol: {
      totalShots: 18,
      shots: [
        { nr: 1, label: "Blocked 30m #1", target: 30, category: "Blocked" },
        { nr: 2, label: "Blocked 30m #2", target: 30, category: "Blocked" },
        { nr: 3, label: "Blocked 30m #3", target: 30, category: "Blocked" },
        { nr: 4, label: "Blocked 50m #1", target: 50, category: "Blocked" },
        { nr: 5, label: "Blocked 50m #2", target: 50, category: "Blocked" },
        { nr: 6, label: "Blocked 50m #3", target: 50, category: "Blocked" },
        { nr: 7, label: "Blocked 70m #1", target: 70, category: "Blocked" },
        { nr: 8, label: "Blocked 70m #2", target: 70, category: "Blocked" },
        { nr: 9, label: "Blocked 70m #3", target: 70, category: "Blocked" },
        { nr: 10, label: "Variation 30m", target: 30, category: "Variation" },
        { nr: 11, label: "Variation 70m", target: 70, category: "Variation" },
        { nr: 12, label: "Variation 50m", target: 50, category: "Variation" },
        { nr: 13, label: "Variation 70m", target: 70, category: "Variation" },
        { nr: 14, label: "Variation 50m", target: 50, category: "Variation" },
        { nr: 15, label: "Variation 70m", target: 70, category: "Variation" },
        { nr: 16, label: "Variation 30m", target: 30, category: "Variation" },
        { nr: 17, label: "Variation 30m", target: 30, category: "Variation" },
        { nr: 18, label: "Variation 50m", target: 50, category: "Variation" },
      ],
      inputFields: [
        { key: "carry", label: "Carry", unit: "m" },
        { key: "retning", label: "Retning (+/-)", unit: "m" },
      ],
      scoring: "pei_total",
      scoringDescription:
        "Total PEI over 18 slag. Blokkert og variert rapporteres separat.",
    },
  },
  {
    name: "PGA Tour 27 Shots",
    description:
      "27 slag fra de 27 vanligste lengdene på PGA Tour. Dekker hele registeret fra wedge til driver. Den mest omfattende enkelttesten i Team Norway-protokollen. Gir et komplett bilde av slagkapasiteten.",
    pyramidArea: "TURN",
    scoringRule:
      "Registrer carry (m) og retning (+/- m) per slag. Score = total PEI over 27 slag. Lavere = bedre.",
    protocol: {
      totalShots: 27,
      shots: [
        { nr: 1, label: "145m", target: 145 },
        { nr: 2, label: "60m", target: 60 },
        { nr: 3, label: "45m", target: 45 },
        { nr: 4, label: "110m", target: 110 },
        { nr: 5, label: "150m", target: 150 },
        { nr: 6, label: "135m", target: 135 },
        { nr: 7, label: "140m", target: 140 },
        { nr: 8, label: "215m", target: 215 },
        { nr: 9, label: "75m", target: 75 },
        { nr: 10, label: "165m", target: 165 },
        { nr: 11, label: "115m", target: 115 },
        { nr: 12, label: "155m", target: 155 },
        { nr: 13, label: "180m", target: 180 },
        { nr: 14, label: "230m", target: 230 },
        { nr: 15, label: "200m", target: 200 },
        { nr: 16, label: "160m", target: 160 },
        { nr: 17, label: "185m", target: 185 },
        { nr: 18, label: "170m", target: 170 },
        { nr: 19, label: "130m", target: 130 },
        { nr: 20, label: "155m", target: 155 },
        { nr: 21, label: "125m", target: 125 },
        { nr: 22, label: "100m", target: 100 },
        { nr: 23, label: "190m", target: 190 },
        { nr: 24, label: "120m", target: 120 },
        { nr: 25, label: "105m", target: 105 },
        { nr: 26, label: "90m", target: 90 },
        { nr: 27, label: "175m", target: 175 },
      ],
      inputFields: [
        { key: "carry", label: "Carry", unit: "m" },
        { key: "retning", label: "Retning (+/-)", unit: "m" },
      ],
      scoring: "pei_total",
      scoringDescription: "Total PEI over 27 slag. Lavere er bedre.",
    },
  },
];

async function main() {
  console.log("Seeder 20 Team Norway testdefinisjoner...");

  for (const t of TESTS) {
    await prisma.testDefinition.upsert({
      where: { id: t.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") },
      update: {
        name: t.name,
        description: t.description,
        pyramidArea: t.pyramidArea,
        scoringRule: t.scoringRule,
        protocol: t.protocol as object,
      },
      create: {
        id: t.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        name: t.name,
        description: t.description,
        pyramidArea: t.pyramidArea,
        scoringRule: t.scoringRule,
        protocol: t.protocol as object,
      },
    });
    console.log(`  + ${t.name} (${t.pyramidArea})`);
  }

  console.log(`\nFerdig! ${TESTS.length} tester seedet.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
