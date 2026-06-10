/**
 * Seed NGF 20-test-battery med strukturerte protokoller.
 *
 * Strategi (godkjent av Anders 2026-05-23):
 *  - Behold dagens 31 TestDefinition-rader
 *  - Update protocol-JSON på de som matcher 20-listen (15 stk)
 *  - Insert 5 nye tester som mangler (CHS, PEI Bane, Inspill 120/160/Variation)
 *
 * Protokoll-strukturen brukes av live-scoring-skjermen
 * /portal/(fullscreen)/test/[testId]/live.
 *
 * Kjør: npx tsx prisma/scripts/seed-ngf-test-protocols.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Protokoll-typer
// ---------------------------------------------------------------------------

type InputField = {
  key: string;
  label: string;
  type: "number" | "select" | "checkbox" | "distance";
  unit?: string;
  options?: string[];
  min?: number;
  max?: number;
  helper?: string;
};

type ProtocolStep = {
  id: string;
  label: string;
  instruction: string;
  shots: number;
  target?: string;
  inputFields: InputField[];
};

type TestProtocol = {
  equipment: string[];
  expectedDurationMin: number;
  scoringMode: "sum" | "average" | "hit-rate" | "distance" | "pei" | "max" | "lowest";
  primaryMetric: string;
  unit: string;
  steps: ProtocolStep[];
  baselineNormal?: { junior?: number; amateur?: number; pro?: number };
  pgaBenchmark?: string;
  notes?: string;
};

// ---------------------------------------------------------------------------
// Protokoll-katalog — 20 NGF/WANG-tester
// ---------------------------------------------------------------------------

const PROTOCOLS: Record<string, { name: string; pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"; scoringRule: string; description: string; protocol: TestProtocol }> = {
  // ---------- GOLF — Utslag/Driver ----------
  driver_basic: {
    name: "Driver Basic",
    pyramidArea: "SLAG",
    scoringRule: "PEI (lavere er bedre)",
    description: "5 driver-slag. Måler carry-lengde, sideavvik og beregner PEI.",
    protocol: {
      equipment: ["Driver", "TrackMan eller siktepunkt", "5 baller"],
      expectedDurationMin: 10,
      scoringMode: "pei",
      primaryMetric: "pei",
      unit: "PEI",
      steps: [
        {
          id: "drive-5",
          label: "5 driver-slag",
          instruction:
            "Sikt mot midten av fairway. Slå 5 driver-slag på rad uten korreksjon. Registrer carry, total og sideavvik per slag.",
          shots: 5,
          target: "PEI < 0.06",
          inputFields: [
            { key: "carry_m", label: "Carry", type: "number", unit: "m", min: 100, max: 350 },
            { key: "total_m", label: "Total", type: "number", unit: "m", min: 100, max: 350 },
            { key: "side_m", label: "Sideavvik", type: "number", unit: "m", min: -100, max: 100, helper: "+ høyre, − venstre" },
          ],
        },
      ],
      pgaBenchmark: "Carry: PGA topp 40 ≈ 273 m, PGA-snitt ≈ 268 m. PEI ≈ 6 % er PGA-snitt (topp 40 ≈ 5 %).",
      notes: "PEI = avstand til mål / total carry. Lavere er bedre.",
    },
  },

  driver_gate: {
    name: "Driver Gate",
    pyramidArea: "TEK",
    scoringRule: "Antall innenfor gate / 6",
    description: "6 driver-slag gjennom en 2m bred gate. Måler presisjon under press.",
    protocol: {
      equipment: ["Driver", "6 baller", "Gate-markering (kjegler 2m fra hverandre, 200m bort)"],
      expectedDurationMin: 8,
      scoringMode: "hit-rate",
      primaryMetric: "ok_count",
      unit: "/ 6",
      steps: [
        {
          id: "gate-6",
          label: "6 driver-slag",
          instruction:
            "Slå 6 driver-slag mot gate (2m bred, plassert på din normale driver-carry). Marker hver ball som inne / utenfor.",
          shots: 6,
          target: "≥ 4 av 6 innenfor",
          inputFields: [
            { key: "ok", label: "Innenfor gate", type: "checkbox", helper: "Hak av hvis ballen passerer mellom kjeglene" },
          ],
        },
      ],
      pgaBenchmark: "Spredning < 5% av carry-lengde",
    },
  },

  // ---------- GOLF — Innspill ----------
  inspill_basic: {
    name: "Inspill Basis",
    pyramidArea: "SLAG",
    scoringRule: "PEI snitt over 10 slag",
    description: "10 inspill fra ulike avstander (100-200m). Måler PEI per slag.",
    protocol: {
      equipment: ["Jern 5-9 + hybrid", "10 baller", "Avstandsmåler"],
      expectedDurationMin: 20,
      scoringMode: "pei",
      primaryMetric: "pei",
      unit: "PEI",
      steps: [
        {
          id: "inspill-10",
          label: "10 inspill — varierende avstand",
          instruction:
            "Slå 10 slag fra 100, 120, 140, 160, 180 og 200m (2 fra hver). Registrer avstand til hull etter hvert slag.",
          shots: 10,
          target: "PEI 100-150m < 0.06, 150-200m < 0.06",
          inputFields: [
            { key: "shot_distance_m", label: "Slagavstand", type: "number", unit: "m", min: 80, max: 220 },
            { key: "till_hull_m", label: "Avstand til hull etter slag", type: "number", unit: "m", min: 0, max: 80 },
          ],
        },
      ],
      pgaBenchmark: "PEI: PGA-snitt 5,7 % — topp 40 5,0 %",
    },
  },

  inspill_120: {
    name: "Inspill 120m",
    pyramidArea: "SLAG",
    scoringRule: "Snitt-avstand til hull",
    description: "5 slag fra 120m. Måler nøyaktighet.",
    protocol: {
      equipment: ["Pitching wedge / 9-jern", "5 baller", "Mål-flagg"],
      expectedDurationMin: 10,
      scoringMode: "average",
      primaryMetric: "till_hull_m",
      unit: "m",
      steps: [
        {
          id: "from-120",
          label: "5 slag fra 120m",
          instruction:
            "Slå 5 slag fra eksakt 120m. Registrer avstand til hull etter hvert slag (carry + utløp).",
          shots: 5,
          target: "Snitt < 8m fra hull",
          inputFields: [
            { key: "till_hull_m", label: "Avstand til hull", type: "number", unit: "m", min: 0, max: 50 },
          ],
        },
      ],
      pgaBenchmark: "PGA-snitt PEI ≈ 5,8 % — topp 40 ≈ 5,0 %",
    },
  },

  inspill_160: {
    name: "Inspill 160m",
    pyramidArea: "SLAG",
    scoringRule: "Snitt-avstand til hull",
    description: "5 slag fra 160m. Måler nøyaktighet på lengre inspill.",
    protocol: {
      equipment: ["7-9 jern", "5 baller", "Mål-flagg"],
      expectedDurationMin: 10,
      scoringMode: "average",
      primaryMetric: "till_hull_m",
      unit: "m",
      steps: [
        {
          id: "from-160",
          label: "5 slag fra 160m",
          instruction:
            "Slå 5 slag fra eksakt 160m. Registrer avstand til hull etter hvert slag.",
          shots: 5,
          target: "Snitt < 10m fra hull",
          inputFields: [
            { key: "till_hull_m", label: "Avstand til hull", type: "number", unit: "m", min: 0, max: 60 },
          ],
        },
      ],
      pgaBenchmark: "PGA-snitt PEI ≈ 5,5 % — topp 40 ≈ 4,8 %",
    },
  },

  inspill_variation: {
    name: "Inspill Variation",
    pyramidArea: "SLAG",
    scoringRule: "PEI med variasjonsfaktor",
    description: "Varierende avstander (100-130m). Tester tilpasningsevne.",
    protocol: {
      equipment: ["Hele jern-settet", "9 baller"],
      expectedDurationMin: 15,
      scoringMode: "pei",
      primaryMetric: "pei",
      unit: "PEI",
      steps: [
        {
          id: "var-9",
          label: "9 slag, randomiserte avstander",
          instruction:
            "Coach kaller ut ny avstand (100-130m) før hvert slag. Spiller har 30 sek for klubbvalg + slag. Registrer slagavstand og avstand til hull.",
          shots: 9,
          target: "Snitt PEI < 0.07",
          inputFields: [
            { key: "shot_distance_m", label: "Avstand kalt ut", type: "number", unit: "m", min: 100, max: 130 },
            { key: "till_hull_m", label: "Avstand til hull", type: "number", unit: "m", min: 0, max: 30 },
          ],
        },
      ],
      pgaBenchmark: "Variasjonsfaktor: Top 40 PEI øker < 15%",
    },
  },

  // ---------- GOLF — Wedge ----------
  wedge_variation: {
    name: "Wedge Variation",
    pyramidArea: "SLAG",
    scoringRule: "PEI snitt 9 slag",
    description: "9 wedge-slag fra varierte avstander (30-70m).",
    protocol: {
      equipment: ["Pitching + Sand + Lob wedge", "9 baller"],
      expectedDurationMin: 12,
      scoringMode: "pei",
      primaryMetric: "pei",
      unit: "PEI",
      steps: [
        {
          id: "wedge-9",
          label: "9 wedge-slag",
          instruction:
            "Slå 9 wedge-slag: 3 stk hver fra 30m, 50m og 70m. Registrer carry og avstand til hull.",
          shots: 9,
          target: "PEI < 0.10",
          inputFields: [
            { key: "carry_m", label: "Carry", type: "number", unit: "m", min: 20, max: 90 },
            { key: "till_hull_m", label: "Avstand til hull", type: "number", unit: "m", min: 0, max: 30 },
          ],
        },
      ],
      pgaBenchmark: "PEI 20-60m: PGA-snitt 7,0 % — topp 40 6,0 %",
    },
  },

  wedge_gate: {
    name: "Wedge Gate",
    pyramidArea: "TEK",
    scoringRule: "Poeng for treff i riktig launch + carry-sone",
    description: "9 wedge-slag med krav til launch-vinkel og carry-mål.",
    protocol: {
      equipment: ["Sand + Lob wedge", "9 baller", "TrackMan"],
      expectedDurationMin: 15,
      scoringMode: "sum",
      primaryMetric: "poeng",
      unit: "poeng",
      steps: [
        {
          id: "wedge-low",
          label: "3 lave wedger",
          instruction:
            "Slå 3 wedger med lav launch (< 30°). Carry-mål: 40m, 50m, 60m. 1 poeng per slag innenfor launch-vindu og 2m carry-toleranse.",
          shots: 3,
          target: "3 / 3 innenfor",
          inputFields: [
            { key: "launch_deg", label: "Launch-vinkel", type: "number", unit: "°", min: 10, max: 60 },
            { key: "carry_m", label: "Carry", type: "number", unit: "m", min: 20, max: 80 },
            { key: "ok", label: "Treff i sone", type: "checkbox" },
          ],
        },
        {
          id: "wedge-med",
          label: "3 medium wedger",
          instruction: "Launch 30-50°, samme carry-mål (40/50/60m).",
          shots: 3,
          target: "3 / 3 innenfor",
          inputFields: [
            { key: "launch_deg", label: "Launch-vinkel", type: "number", unit: "°", min: 10, max: 70 },
            { key: "carry_m", label: "Carry", type: "number", unit: "m", min: 20, max: 80 },
            { key: "ok", label: "Treff i sone", type: "checkbox" },
          ],
        },
        {
          id: "wedge-high",
          label: "3 høye wedger",
          instruction: "Launch > 50°, samme carry-mål. Krever maks kontroll.",
          shots: 3,
          target: "3 / 3 innenfor",
          inputFields: [
            { key: "launch_deg", label: "Launch-vinkel", type: "number", unit: "°", min: 10, max: 70 },
            { key: "carry_m", label: "Carry", type: "number", unit: "m", min: 20, max: 80 },
            { key: "ok", label: "Treff i sone", type: "checkbox" },
          ],
        },
      ],
      pgaBenchmark: "Launch-kontroll innenfor 2°",
    },
  },

  // ---------- GOLF — Nærspill ----------
  eight_ball_variation: {
    name: "8-ball Variation",
    pyramidArea: "SLAG",
    scoringRule: "Sum poeng 0-4 per slag (maks 96)",
    description: "24 nærspillslag i roterende rekkefølge: chip, wedge, lobb, bunker.",
    protocol: {
      equipment: ["Sand wedge", "Lob wedge", "Pitching wedge", "24 baller"],
      expectedDurationMin: 25,
      scoringMode: "sum",
      primaryMetric: "poeng",
      unit: "poeng",
      steps: [
        {
          id: "rotation",
          label: "24 slag i rotasjon",
          instruction:
            "Slå 24 slag i fast rotasjon: Chip 10m → Chip 30m → Wedge 20m → Wedge 40m → Lobb 15m → Lobb 25m → Bunker 10m → Bunker 20m. Gjenta 3 ganger. Score per slag: 4 (inn i hull) / 3 (< 1m) / 2 (< 2m) / 1 (< 4m) / 0 (over).",
          shots: 24,
          target: "≥ 50 av 96",
          inputFields: [
            { key: "shot_type", label: "Slagtype", type: "select", options: ["Chip 10m", "Chip 30m", "Wedge 20m", "Wedge 40m", "Lobb 15m", "Lobb 25m", "Bunker 10m", "Bunker 20m"] },
            { key: "poeng", label: "Poeng (0-4)", type: "number", min: 0, max: 4 },
          ],
        },
      ],
      pgaBenchmark: "PEI 0-20m: PGA-snitt 8,0 % — topp 40 7,4 %",
    },
  },

  naerspill_gate: {
    name: "TN Nærspill Gate",
    pyramidArea: "TEK",
    scoringRule: "Poeng for treff i carry-sone",
    description: "9 nærspillslag: 3 launch-høyder × 3 carry-soner (2m / 3m / 4m).",
    protocol: {
      equipment: ["Sand + Lob wedge", "9 baller", "TrackMan eller flagg-markering"],
      expectedDurationMin: 12,
      scoringMode: "sum",
      primaryMetric: "poeng",
      unit: "poeng",
      steps: [
        {
          id: "naerspill-9",
          label: "9 slag — 3×3 matrise",
          instruction:
            "Slå 3 slag mot hver carry-sone (2m, 3m, 4m). For hver sone: 1 lav, 1 medium, 1 høy launch. 1 poeng per treff i sone, 2 poeng for korrekt launch + sone.",
          shots: 9,
          target: "≥ 6 / 18 poeng",
          inputFields: [
            { key: "launch", label: "Launch", type: "select", options: ["Lav", "Medium", "Høy"] },
            { key: "carry_zone", label: "Carry-sone", type: "select", options: ["2m", "3m", "4m"] },
            { key: "poeng", label: "Poeng (0-2)", type: "number", min: 0, max: 2 },
          ],
        },
      ],
      pgaBenchmark: "Scrambling > 60%",
    },
  },

  // ---------- GOLF — Putting ----------
  putt_1_3m: {
    name: "Putt 1-3m",
    pyramidArea: "SPILL",
    scoringRule: "Sink-prosent",
    description: "25 putter fra 5 avstander (1m, 1.5m, 2m, 2.5m, 3m — 5 per avstand).",
    protocol: {
      equipment: ["Putter", "25 baller"],
      expectedDurationMin: 15,
      scoringMode: "hit-rate",
      primaryMetric: "sink_pct",
      unit: "%",
      steps: [
        {
          id: "putt-1m",
          label: "5 putter fra 1m",
          instruction: "Putt 5 baller fra eksakt 1m. Marker sunket / ikke.",
          shots: 5,
          target: "5 / 5",
          inputFields: [{ key: "sunket", label: "Sunket", type: "checkbox" }],
        },
        {
          id: "putt-1.5m",
          label: "5 putter fra 1.5m",
          instruction: "Putt 5 baller fra 1.5m.",
          shots: 5,
          target: "≥ 4 / 5",
          inputFields: [{ key: "sunket", label: "Sunket", type: "checkbox" }],
        },
        {
          id: "putt-2m",
          label: "5 putter fra 2m",
          instruction: "Putt 5 baller fra 2m.",
          shots: 5,
          target: "≥ 3 / 5",
          inputFields: [{ key: "sunket", label: "Sunket", type: "checkbox" }],
        },
        {
          id: "putt-2.5m",
          label: "5 putter fra 2.5m",
          instruction: "Putt 5 baller fra 2.5m.",
          shots: 5,
          target: "≥ 3 / 5",
          inputFields: [{ key: "sunket", label: "Sunket", type: "checkbox" }],
        },
        {
          id: "putt-3m",
          label: "5 putter fra 3m",
          instruction: "Putt 5 baller fra 3m.",
          shots: 5,
          target: "≥ 2 / 5",
          inputFields: [{ key: "sunket", label: "Sunket", type: "checkbox" }],
        },
      ],
      pgaBenchmark: "PGA-snitt 1-3m: ~60 % sink",
    },
  },

  putt_gate: {
    name: "TN Putt Gate",
    pyramidArea: "TEK",
    scoringRule: "Antall gjennom gate / 10",
    description: "10 putter gjennom 40cm bred gate (start-retning).",
    protocol: {
      equipment: ["Putter", "10 baller", "Gate-markering 40cm bred, plassert 50cm foran ball"],
      expectedDurationMin: 8,
      scoringMode: "hit-rate",
      primaryMetric: "ok_count",
      unit: "/ 10",
      steps: [
        {
          id: "gate-10",
          label: "10 putter",
          instruction: "Putt 10 baller gjennom gate. Marker hver: inn / ut + v/h hvis ut.",
          shots: 10,
          target: "≥ 8 / 10",
          inputFields: [
            { key: "ok", label: "Gjennom gate", type: "checkbox" },
            { key: "miss_side", label: "Miss-retning", type: "select", options: ["—", "Venstre", "Høyre"] },
          ],
        },
      ],
      pgaBenchmark: "Start line accuracy > 90%",
    },
  },

  putt_speed: {
    name: "Putt Speed Control",
    pyramidArea: "SPILL",
    scoringRule: "Snitt avstand fra hull etter putt",
    description: "1×5 (3m) + 3×3 (3m/5m/7m). Måler speed-kontroll.",
    protocol: {
      equipment: ["Putter", "9 baller"],
      expectedDurationMin: 12,
      scoringMode: "lowest",
      primaryMetric: "avstand_etter",
      unit: "m",
      steps: [
        {
          id: "speed-3m-block",
          label: "5 putter fra 3m",
          instruction:
            "Putt 5 baller fra 3m. Mål: stoppe så nær hull som mulig. Mål avstand fra hull etter hvert putt (lang OK også, ikke bare kort).",
          shots: 5,
          target: "Snitt leave < 0.5m",
          inputFields: [
            { key: "avstand_etter", label: "Avstand fra hull", type: "number", unit: "m", min: 0, max: 5 },
            { key: "lang_kort", label: "Lang/kort", type: "select", options: ["Lang", "På", "Kort"] },
          ],
        },
        {
          id: "speed-3m",
          label: "3 putter fra 3m",
          instruction: "3 putter fra 3m.",
          shots: 3,
          target: "Snitt < 0.5m",
          inputFields: [
            { key: "avstand_etter", label: "Avstand fra hull", type: "number", unit: "m", min: 0, max: 5 },
          ],
        },
        {
          id: "speed-5m",
          label: "3 putter fra 5m",
          instruction: "3 putter fra 5m.",
          shots: 3,
          target: "Snitt < 0.8m",
          inputFields: [
            { key: "avstand_etter", label: "Avstand fra hull", type: "number", unit: "m", min: 0, max: 5 },
          ],
        },
        {
          id: "speed-7m",
          label: "3 putter fra 7m",
          instruction: "3 putter fra 7m.",
          shots: 3,
          target: "Snitt < 1.2m",
          inputFields: [
            { key: "avstand_etter", label: "Avstand fra hull", type: "number", unit: "m", min: 0, max: 5 },
          ],
        },
      ],
      pgaBenchmark: "Leave < 0.5m fra hull",
    },
  },

  visa_express: {
    name: "TN VISA Express",
    pyramidArea: "TEK",
    scoringRule: "Sum poeng per speed-zone",
    description: "9 putter som tester speed-kontroll. Tre avstander × tre speed-zones.",
    protocol: {
      equipment: ["Putter", "9 baller", "Speed-soner: kort/på/lang for hver avstand"],
      expectedDurationMin: 10,
      scoringMode: "sum",
      primaryMetric: "poeng",
      unit: "poeng",
      steps: [
        {
          id: "visa-9",
          label: "9 putter — 3 avstander",
          instruction:
            "Putt 3 baller fra hver avstand (2m, 3m, 4m). Mål: stoppe i 'på'-sonen (innenfor 30cm forbi hull). 2p = på, 1p = i sone, 0p = utenfor.",
          shots: 9,
          target: "≥ 12 / 18 poeng",
          inputFields: [
            { key: "avstand", label: "Avstand", type: "select", options: ["2m", "3m", "4m"] },
            { key: "speed_zone", label: "Speed-zone", type: "select", options: ["Kort", "På", "Lang"] },
            { key: "poeng", label: "Poeng", type: "number", min: 0, max: 2 },
          ],
        },
      ],
      pgaBenchmark: "Speed control within 5%",
    },
  },

  // ---------- FYSISK ----------
  trapbar_deadlift: {
    name: "Trapbar Deadlift",
    pyramidArea: "FYS",
    scoringRule: "Maks vekt (kg)",
    description: "Maks 1RM trapbar markløft. Korrelerer med rotasjonskraft og CHS.",
    protocol: {
      equipment: ["Trapbar", "Vektskiver", "Treningssko (flate)"],
      expectedDurationMin: 25,
      scoringMode: "max",
      primaryMetric: "kg",
      unit: "kg",
      steps: [
        {
          id: "warmup",
          label: "Oppvarming",
          instruction:
            "10 min lett oppvarming + 3 sett markløft med stigende vekt (50/60/70% av antatt 1RM).",
          shots: 1,
          target: "Klart oppvarmet",
          inputFields: [{ key: "warmup_done", label: "Fullført", type: "checkbox" }],
        },
        {
          id: "test-sets",
          label: "Maks-forsøk",
          instruction:
            "Bygg opp til maks. 3-5 forsøk på 1RM. Registrer høyeste vekt med korrekt form (ryggen rett, full hofteekstensjon).",
          shots: 5,
          target: "Personlig rekord",
          inputFields: [
            { key: "kg", label: "Vekt", type: "number", unit: "kg", min: 0, max: 300 },
            { key: "approved", label: "Godkjent løft", type: "checkbox", helper: "Form OK?" },
          ],
        },
      ],
      pgaBenchmark: "Junior G19: 1.5× kroppsvekt, Pro: 2.0×",
      notes: "Bruk spotter ved tunge løft. Stopp ved smerte.",
    },
  },

  bench_press: {
    name: "Benkpress",
    pyramidArea: "FYS",
    scoringRule: "Maks vekt (kg)",
    description: "Maks 1RM benkpress. Overkroppsstyrke.",
    protocol: {
      equipment: ["Benk", "Stang", "Skiver", "Spotter"],
      expectedDurationMin: 20,
      scoringMode: "max",
      primaryMetric: "kg",
      unit: "kg",
      steps: [
        {
          id: "warmup",
          label: "Oppvarming",
          instruction: "5 min arm-rotasjoner + 3 oppvarmingssett (50/60/70% av 1RM).",
          shots: 1,
          target: "Klart oppvarmet",
          inputFields: [{ key: "warmup_done", label: "Fullført", type: "checkbox" }],
        },
        {
          id: "test-sets",
          label: "Maks-forsøk",
          instruction:
            "3-5 forsøk på 1RM. Registrer høyeste vekt med korrekt form (skuldre på benken, full ROM).",
          shots: 5,
          target: "Personlig rekord",
          inputFields: [
            { key: "kg", label: "Vekt", type: "number", unit: "kg", min: 0, max: 200 },
            { key: "approved", label: "Godkjent løft", type: "checkbox" },
          ],
        },
      ],
      pgaBenchmark: "Junior G19: 1.0× kroppsvekt, Pro: 1.3×",
    },
  },

  standing_long_jump: {
    name: "Standing Long Jump",
    pyramidArea: "FYS",
    scoringRule: "Beste hopp (cm)",
    description: "Bilateral eksplosivitet. Fra stående start med tærne mot strek.",
    protocol: {
      equipment: ["Målebånd", "Sklisikker matte/gulv"],
      expectedDurationMin: 10,
      scoringMode: "max",
      primaryMetric: "cm",
      unit: "cm",
      steps: [
        {
          id: "warmup",
          label: "Oppvarming",
          instruction: "5 min lett jogg + 3 testhopp på 70-80% intensitet.",
          shots: 3,
          target: "Klart oppvarmet",
          inputFields: [{ key: "warmup_done", label: "Fullført", type: "checkbox" }],
        },
        {
          id: "test-jumps",
          label: "3 maks-hopp",
          instruction:
            "3 hopp på 100%. Mål fra strek til nærmeste hælpunkt etter landing. Bruk armsving for hjelp.",
          shots: 3,
          target: "Personlig rekord",
          inputFields: [
            { key: "cm", label: "Lengde", type: "number", unit: "cm", min: 50, max: 350 },
          ],
        },
      ],
      pgaBenchmark: "Junior G19: 230 cm, Pro: 280 cm+",
    },
  },

  ball_throw_kneeling: {
    name: "Ball Throw",
    pyramidArea: "FYS",
    scoringRule: "Beste kast (cm)",
    description: "Rotasjonspower-test med medisinball, knestående (3kg G/J19, 2kg yngre).",
    protocol: {
      equipment: ["Medisinball (3kg eller 2kg)", "Målebånd", "Knebeskytter"],
      expectedDurationMin: 12,
      scoringMode: "max",
      primaryMetric: "cm",
      unit: "cm",
      steps: [
        {
          id: "warmup",
          label: "Oppvarming",
          instruction: "5 min rotasjons-oppvarming + 3 lettere kast (70% intensitet).",
          shots: 3,
          target: "Klart oppvarmet",
          inputFields: [{ key: "warmup_done", label: "Fullført", type: "checkbox" }],
        },
        {
          id: "test-throws",
          label: "3 maks-kast",
          instruction:
            "Knestående, ballen ved siden av hofta på venstre side. Roter og kast så langt som mulig fremover. 3 forsøk per side. Mål lengste.",
          shots: 3,
          target: "Personlig rekord",
          inputFields: [
            { key: "side", label: "Side", type: "select", options: ["Venstre", "Høyre"] },
            { key: "cm", label: "Lengde", type: "number", unit: "cm", min: 100, max: 2000 },
          ],
        },
      ],
      pgaBenchmark: "Junior G19: 1000 cm (3kg ball), Pro: 1400 cm",
    },
  },

  chs: {
    name: "Clubhead Speed (CHS)",
    pyramidArea: "FYS",
    scoringRule: "Maks klubbhodehastighet (mph)",
    description: "Klubbhodehastighet med driver innendørs (TrackMan). 1 mph CHS ≈ 2.5 yards carry.",
    protocol: {
      equipment: ["Driver", "TrackMan eller annen launch-monitor", "5 baller"],
      expectedDurationMin: 15,
      scoringMode: "max",
      primaryMetric: "mph",
      unit: "mph",
      steps: [
        {
          id: "warmup",
          label: "Oppvarming",
          instruction:
            "10 min sving-oppvarming + 5 slag med 70-80% intensitet for å varme opp.",
          shots: 5,
          target: "Klart oppvarmet",
          inputFields: [{ key: "warmup_done", label: "Fullført", type: "checkbox" }],
        },
        {
          id: "test-speed",
          label: "5 maks-slag",
          instruction:
            "Slå 5 driver-slag med maks intensitet. Registrer CHS per slag fra TrackMan.",
          shots: 5,
          target: "Personlig rekord",
          inputFields: [
            { key: "mph", label: "Clubhead Speed", type: "number", unit: "mph", min: 60, max: 140 },
            { key: "smash_factor", label: "Smash factor", type: "number", min: 1.0, max: 1.6, helper: "Valgfritt — ball speed / CHS" },
          ],
        },
      ],
      pgaBenchmark: "PGA avg: 114 mph",
      notes: "CHS måles INNENDØRS på TrackMan eller tilsvarende. Resultater utendørs avhenger av vær — IKKE bruk for sammenligning.",
    },
  },

  // ---------- TURN (PEI Test Bane) ----------
  pei_bane: {
    name: "PEI Test Bane",
    pyramidArea: "TURN",
    scoringRule: "Snitt PEI over 18 hull",
    description: "18-hulls PEI-test på bane. Måler innspillpresisjon under reelle forhold.",
    protocol: {
      equipment: ["Hele settet", "Avstandsmåler", "Scorekort med PEI-felter"],
      expectedDurationMin: 240,
      scoringMode: "average",
      primaryMetric: "pei",
      unit: "PEI",
      steps: [
        {
          id: "round-18",
          label: "Spill 18 hull — registrer PEI per inspill",
          instruction:
            "Spill normal runde. For HVERT innspill (slag mot green): noter slag-type (jern/wedge), lengde og avstand til hull etter slag. PEI beregnes automatisk.",
          shots: 18,
          target: "Snitt PEI < 0.07",
          inputFields: [
            { key: "hull", label: "Hull", type: "number", min: 1, max: 18 },
            { key: "slag_type", label: "Slag-type", type: "select", options: ["Driver", "Hybrid", "Jern 3-5", "Jern 6-8", "Wedge", "Bunker"] },
            { key: "lengde", label: "Slagavstand", type: "number", unit: "m", min: 20, max: 250 },
            { key: "till_hull_m", label: "Til hull etter slag", type: "number", unit: "m", min: 0, max: 80 },
          ],
        },
      ],
      pgaBenchmark: "PGA-snitt PEI 5,7 % — topp 40 5,0 %",
      notes: "Bruk eksisterende runde — ingen ekstra slag. Bare logg innspill-data.",
    },
  },
};

// ---------------------------------------------------------------------------
// Benchmarks (DataGolf-fasiter v1) — merges fra prisma/seed-data/ngf-test-battery.json
// inn i protocol-JSON før lagring. Matches på test-id (samme id-sett begge steder).
// ---------------------------------------------------------------------------

type BatteryEntry = {
  id: string;
  name: string;
  benchmarks?: {
    unit: string;
    direction: "lower" | "higher";
    source: string;
    levels: { id: string; label: string; value: number; confidence: string }[];
  } | null;
  benchmarks_note?: string;
  benchmarks_detail?: unknown;
};

const BATTERY_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "../seed-data/ngf-test-battery.json",
);
const BATTERY: BatteryEntry[] = JSON.parse(readFileSync(BATTERY_PATH, "utf8"));
const BATTERY_BY_ID = new Map(BATTERY.map((t) => [t.id, t]));

/** Validerer batteriet: kjente id-er + monotont ordnet nivåstige (beste → svakeste). */
function validateBattery(): void {
  for (const t of BATTERY) {
    if (!PROTOCOLS[t.id]) {
      throw new Error(`ngf-test-battery.json: ukjent test-id "${t.id}" (ingen protokoll)`);
    }
    const b = t.benchmarks;
    if (!b) continue;
    if (!["lower", "higher"].includes(b.direction) || b.levels.length === 0) {
      throw new Error(`ngf-test-battery.json: ${t.id} — ugyldig benchmarks-struktur`);
    }
    for (let i = 1; i < b.levels.length; i += 1) {
      const prev = b.levels[i - 1].value;
      const curr = b.levels[i].value;
      const ok = b.direction === "higher" ? curr <= prev : curr >= prev;
      if (!ok) {
        throw new Error(
          `ngf-test-battery.json: ${t.id} — nivåstigen er ikke monotont ordnet (${prev} → ${curr})`,
        );
      }
    }
  }
}

/** Slår benchmarks-feltene fra batteriet inn i protokollen. */
function withBenchmarks(ngfId: string, protocol: TestProtocol): object {
  const entry = BATTERY_BY_ID.get(ngfId);
  if (!entry) return protocol as unknown as object;
  return {
    ...protocol,
    // Stabil nøkkel for benchmark-autosync (DB-navn kan avvike fra batteri-navn).
    benchmarks_key: ngfId,
    benchmarks: entry.benchmarks ?? null,
    ...(entry.benchmarks_note ? { benchmarks_note: entry.benchmarks_note } : {}),
    ...(entry.benchmarks_detail ? { benchmarks_detail: entry.benchmarks_detail } : {}),
  };
}

// ---------------------------------------------------------------------------
// Existing-test mapping (name match → NGF-ID)
// ---------------------------------------------------------------------------

const EXISTING_MAP: Record<string, string> = {
  "Driver Basic": "driver_basic",
  "Inspill Basis": "inspill_basic",
  "Wedge Variation": "wedge_variation",
  "8-ball Variation": "eight_ball_variation",
  "Putt 1-3m": "putt_1_3m",
  "TN Driver Gate": "driver_gate",
  "TN Putt Gate": "putt_gate",
  "TN Nærspill Gate": "naerspill_gate",
  "TN VISA Express": "visa_express",
  "Putt Speed 1x5": "putt_speed",
  "Putt Speed 3x3": "putt_speed",
  "TN Wedge Gate": "wedge_gate",
  "Trapbar Deadlift": "trapbar_deadlift",
  Benkpress: "bench_press",
  "Standing Long Jump": "standing_long_jump",
  "Ball Throw": "ball_throw_kneeling",
};

// 5 nye som mangler i DB
const NEW_TESTS = ["chs", "pei_bane", "inspill_120", "inspill_160", "inspill_variation"];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  console.log("[0/3] Validerer benchmarks i ngf-test-battery.json…");
  validateBattery();
  console.log(`  ✓ ${BATTERY.length} tester validert.\n`);

  console.log("[1/3] Update existing test-protokoller…");
  let updated = 0;
  for (const [dbName, ngfId] of Object.entries(EXISTING_MAP)) {
    const proto = PROTOCOLS[ngfId];
    if (!proto) {
      console.warn(`  ⚠️  Ingen NGF-protokoll for ${dbName} (id ${ngfId})`);
      continue;
    }
    const r = await prisma.testDefinition.updateMany({
      where: { name: dbName },
      data: {
        protocol: withBenchmarks(ngfId, proto.protocol),
        description: proto.description,
        scoringRule: proto.scoringRule,
      },
    });
    if (r.count > 0) {
      console.log(`  ✓ ${dbName} (${r.count} rad)`);
      updated += r.count;
    } else {
      console.warn(`  ⚠️  Ikke funnet: ${dbName}`);
    }
  }
  console.log(`  → ${updated} rader oppdatert.\n`);

  console.log("[2/3] Insert nye tester (5 fra 20-listen som mangler)…");
  let inserted = 0;
  for (const ngfId of NEW_TESTS) {
    const proto = PROTOCOLS[ngfId];
    if (!proto) {
      console.warn(`  ⚠️  Ukjent ngfId ${ngfId}`);
      continue;
    }
    const existing = await prisma.testDefinition.findFirst({ where: { name: proto.name } });
    if (existing) {
      console.log(`  ◦ ${proto.name} finnes allerede — oppdaterer protocol`);
      await prisma.testDefinition.update({
        where: { id: existing.id },
        data: {
          protocol: withBenchmarks(ngfId, proto.protocol),
          description: proto.description,
          scoringRule: proto.scoringRule,
        },
      });
    } else {
      await prisma.testDefinition.create({
        data: {
          name: proto.name,
          description: proto.description,
          pyramidArea: proto.pyramidArea,
          scoringRule: proto.scoringRule,
          protocol: withBenchmarks(ngfId, proto.protocol),
        },
      });
      console.log(`  ✓ Opprettet: ${proto.name} (${proto.pyramidArea})`);
      inserted++;
    }
  }
  console.log(`  → ${inserted} nye rader.\n`);

  console.log("[3/3] Verifiserer total…");
  const total = await prisma.testDefinition.count();
  const withProtocol = await prisma.testDefinition.count({ where: { protocol: { not: { equals: null } } } });
  console.log(`  Totale TestDefinitions: ${total}`);
  console.log(`  Med strukturert protokoll: ${withProtocol}\n`);

  await prisma.$disconnect();
  console.log("Ferdig.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
