/**
 * Seed 12 fysiske treningsplan-maler (TrainingPlan + sessions + drills).
 *
 * 4 faser × 3 aldersgrupper:
 *   - GRUNN (Grunnfase okt-des, 12 uker)
 *   - SPESIAL (Spesialfase jan-feb, 8 uker)
 *   - TURNERING (Pre-sesong mars-apr, 8 uker)
 *   - SESONG (Vedlikehold mai-sep, 20 uker — lagres med lPhase=TURNERING)
 *
 * Hver mal har 2-3 ukentlige sessions med SessionDrill-er som peker på
 * ExerciseDefinition-er seedet i scripts/seed-physical-exercises.ts.
 *
 * Plan-eier: "template-placeholder" (system-User, opprettes ved første kjøring).
 * Coach kopierer planen ved tildeling til ekte spiller.
 *
 * Kjør: npx tsx scripts/seed-physical-templates.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL er ikke satt i .env.local");
  process.exit(1);
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const TEMPLATE_USER_ID = "template-placeholder";
const TEMPLATE_USER_AUTH_ID = "00000000-0000-0000-0000-000000000000";
const TEMPLATE_USER_EMAIL = "templates+placeholder@akgolf.no";

type AgeGroup = "U15" | "U19" | "ELITE";
type PhaseKey = "GRUNN" | "SPESIAL" | "TURNERING" | "SESONG";
type LPhaseValue = "GRUNN" | "SPESIAL" | "TURNERING";
type SessionEnvValue = "GYM" | "BANE" | "RANGE" | "STUDIO" | "HJEM" | "SIMULATOR";

type DrillSpec = {
  exerciseId: string;
  repsSets: string;
  sets?: number;
  reps?: number;
};

type SessionTemplate = {
  dayOffset: number; // dagnr i uka (0 = mandag/dag 1)
  title: string;
  rationale: string;
  durationMin: number;
  environment: SessionEnvValue;
  drills: DrillSpec[];
};

type PlanTemplate = {
  id: string;
  name: string;
  phase: PhaseKey;
  ageGroup: AgeGroup;
  startDate: Date;
  endDate: Date;
  lPhase: LPhaseValue;
  sessions: SessionTemplate[];
};

// ---------- Hjelpere ----------

/** Parse "3×8" eller "20 min Z2" eller "3×30m" til { sets, reps } der mulig. */
function parseRepsSets(repsSets: string): { sets?: number; reps?: number } {
  // Distance format (e.g. "3×30m") — sets only, ingen reps
  const distMatch = repsSets.match(/^(\d+)\s*[×x]\s*(\d+)m/);
  if (distMatch) {
    return { sets: Number(distMatch[1]) };
  }
  const match = repsSets.match(/^(\d+)\s*[×x]\s*(\d+)/);
  if (match) {
    return { sets: Number(match[1]), reps: Number(match[2]) };
  }
  return {};
}

// ---------- Sett/reps-matrise per (øvelse, fase, aldersgruppe) ----------

const SETS_REPS: Record<string, Record<PhaseKey, Record<AgeGroup, string>>> = {
  "trapbar-deadlift": {
    GRUNN: { U15: "3×8", U19: "4×6", ELITE: "4×5" },
    SPESIAL: { U15: "4×4", U19: "4×4", ELITE: "5×3" },
    TURNERING: { U15: "3×3", U19: "3×3", ELITE: "4×2" },
    SESONG: { U15: "3×3", U19: "3×3", ELITE: "3×3" },
  },
  benkpress: {
    GRUNN: { U15: "3×8", U19: "4×6", ELITE: "4×5" },
    SPESIAL: { U15: "4×4", U19: "4×4", ELITE: "5×3" },
    TURNERING: { U15: "3×3", U19: "3×3", ELITE: "4×2" },
    SESONG: { U15: "2×5", U19: "2×5", ELITE: "2×5" },
  },
  "bulgarian-split-squat": {
    GRUNN: { U15: "3×10", U19: "3×8", ELITE: "4×6" },
    SPESIAL: { U15: "3×6", U19: "3×6", ELITE: "4×5" },
    TURNERING: { U15: "2×6", U19: "2×6", ELITE: "3×5" },
    SESONG: { U15: "2×6", U19: "2×6", ELITE: "2×6" },
  },
  "nordic-hamstring-curl": {
    GRUNN: { U15: "3×5", U19: "3×6", ELITE: "3×8" },
    SPESIAL: { U15: "3×6", U19: "3×8", ELITE: "3×8" },
    TURNERING: { U15: "2×5", U19: "2×6", ELITE: "2×6" },
    SESONG: { U15: "2×5", U19: "2×5", ELITE: "2×5" },
  },
  "pallof-press": {
    GRUNN: { U15: "3×12", U19: "3×15", ELITE: "3×15" },
    SPESIAL: { U15: "3×12", U19: "3×12", ELITE: "3×15" },
    TURNERING: { U15: "2×10", U19: "2×12", ELITE: "2×12" },
    SESONG: { U15: "2×10", U19: "2×10", ELITE: "2×10" },
  },
  "hip-thrust": {
    GRUNN: { U15: "3×12", U19: "3×10", ELITE: "4×10" },
    SPESIAL: { U15: "3×8", U19: "3×8", ELITE: "4×8" },
    TURNERING: { U15: "2×8", U19: "2×8", ELITE: "3×6" },
    SESONG: { U15: "2×8", U19: "2×8", ELITE: "2×8" },
  },
  "dead-bug": {
    GRUNN: { U15: "3×8", U19: "3×10", ELITE: "3×12" },
    SPESIAL: { U15: "2×8", U19: "2×10", ELITE: "2×12" },
    TURNERING: { U15: "2×8", U19: "2×8", ELITE: "2×10" },
    SESONG: { U15: "2×8", U19: "2×8", ELITE: "2×8" },
  },
  "chin-up": {
    GRUNN: { U15: "3×6", U19: "3×8", ELITE: "4×8" },
    SPESIAL: { U15: "3×6", U19: "4×6", ELITE: "4×8" },
    TURNERING: { U15: "2×5", U19: "3×5", ELITE: "4×5" },
    SESONG: { U15: "2×5", U19: "2×5", ELITE: "2×5" },
  },
  "med-ball-rotasjonskast": {
    GRUNN: { U15: "3×8", U19: "3×10", ELITE: "4×10" },
    SPESIAL: { U15: "4×8", U19: "4×10", ELITE: "4×12" },
    TURNERING: { U15: "4×6", U19: "4×8", ELITE: "5×8" },
    SESONG: { U15: "3×8", U19: "3×8", ELITE: "3×8" },
  },
  "face-pull": {
    GRUNN: { U15: "3×15", U19: "3×15", ELITE: "3×15" },
    SPESIAL: { U15: "3×15", U19: "3×15", ELITE: "3×15" },
    TURNERING: { U15: "2×15", U19: "2×15", ELITE: "2×15" },
    SESONG: { U15: "2×15", U19: "2×15", ELITE: "2×15" },
  },
  "box-jump": {
    GRUNN: { U15: "3×5", U19: "4×5", ELITE: "4×5" },
    SPESIAL: { U15: "4×4", U19: "4×5", ELITE: "4×5" },
    TURNERING: { U15: "4×4", U19: "4×5", ELITE: "4×5" },
    SESONG: { U15: "3×4", U19: "3×4", ELITE: "3×4" },
  },
  "med-ball-overhead-kast": {
    GRUNN: { U15: "3×6", U19: "4×5", ELITE: "4×6" },
    SPESIAL: { U15: "4×5", U19: "4×6", ELITE: "4×6" },
    TURNERING: { U15: "3×5", U19: "3×6", ELITE: "4×6" },
    SESONG: { U15: "3×5", U19: "3×5", ELITE: "3×5" },
  },
  "jump-squat": {
    // Brukes i SPESIAL og TURNERING. GRUNN/SESONG ikke i tabell → bruk SPESIAL-tall som default.
    GRUNN: { U15: "3×5", U19: "4×5", ELITE: "4×5" },
    SPESIAL: { U15: "3×5", U19: "4×5", ELITE: "4×5" },
    TURNERING: { U15: "3×4", U19: "4×4", ELITE: "4×5" },
    SESONG: { U15: "3×4", U19: "3×4", ELITE: "3×4" },
  },
  "single-leg-rdl": {
    GRUNN: { U15: "3×8", U19: "3×8", ELITE: "3×8" },
    SPESIAL: { U15: "3×8", U19: "3×8", ELITE: "3×8" },
    TURNERING: { U15: "3×6", U19: "3×8", ELITE: "3×8" },
    SESONG: { U15: "2×6", U19: "2×6", ELITE: "2×6" },
  },
  "farmers-carry": {
    GRUNN: { U15: "3×30m", U19: "3×30m", ELITE: "3×40m" },
    SPESIAL: { U15: "3×30m", U19: "3×30m", ELITE: "3×40m" },
    TURNERING: { U15: "2×30m", U19: "2×30m", ELITE: "3×40m" },
    SESONG: { U15: "2×30m", U19: "2×30m", ELITE: "2×30m" },
  },
  "landmine-press": {
    GRUNN: { U15: "3×10", U19: "3×10", ELITE: "3×10" },
    SPESIAL: { U15: "3×8", U19: "3×8", ELITE: "3×8" },
    TURNERING: { U15: "2×8", U19: "2×8", ELITE: "3×8" },
    SESONG: { U15: "2×8", U19: "2×8", ELITE: "2×8" },
  },
  // Kondisjon — tekst-baserte (ingen sets/reps i tradisjonell forstand)
  "aerob-base-lop": {
    GRUNN: { U15: "20 min Z2", U19: "25 min Z2", ELITE: "30 min Z2" },
    SPESIAL: { U15: "20 min Z2", U19: "20 min Z2", ELITE: "20 min Z2" },
    TURNERING: { U15: "15 min lett", U19: "15 min lett", ELITE: "15 min lett" },
    SESONG: { U15: "20 min Z2", U19: "20 min Z2", ELITE: "20 min Z2" },
  },
  "intervall-600m": {
    GRUNN: { U15: "4×600m", U19: "5×600m", ELITE: "6×600m" },
    SPESIAL: { U15: "4×600m", U19: "5×600m", ELITE: "6×600m" },
    TURNERING: { U15: "3×600m", U19: "4×600m", ELITE: "5×600m" },
    SESONG: { U15: "3×600m", U19: "3×600m", ELITE: "3×600m" },
  },
  "intervall-400m": {
    GRUNN: { U15: "5×400m", U19: "6×400m", ELITE: "8×400m" },
    SPESIAL: { U15: "5×400m", U19: "6×400m", ELITE: "8×400m" },
    TURNERING: { U15: "5×400m", U19: "6×400m", ELITE: "8×400m" },
    SESONG: { U15: "4×400m", U19: "4×400m", ELITE: "8×400m" },
  },
  vedlikeholdslop: {
    GRUNN: { U15: "20 min Z2", U19: "22 min Z2", ELITE: "25 min Z2" },
    SPESIAL: { U15: "20 min Z2", U19: "22 min Z2", ELITE: "25 min Z2" },
    TURNERING: { U15: "20 min Z2", U19: "22 min Z2", ELITE: "25 min Z2" },
    SESONG: { U15: "22 min Z2", U19: "22 min Z2", ELITE: "22 min Z2" },
  },
};

function ds(exerciseId: string, phase: PhaseKey, age: AgeGroup): DrillSpec {
  const repsSets = SETS_REPS[exerciseId]?.[phase]?.[age];
  if (!repsSets) {
    throw new Error(`Mangler sets/reps for ${exerciseId} / ${phase} / ${age}`);
  }
  const { sets, reps } = parseRepsSets(repsSets);
  return { exerciseId, repsSets, sets, reps };
}

// ---------- Varigheter ----------

const DUR = {
  styrkeA_grunn: { U15: 55, U19: 65, ELITE: 75 },
  styrkeB_grunn: { U15: 55, U19: 65, ELITE: 75 },
  kondisjon_grunn: { U15: 30, U19: 35, ELITE: 40 },
  styrkeA_spesial: { U15: 55, U19: 65, ELITE: 75 },
  styrkeB_spesial: { U15: 55, U19: 65, ELITE: 75 },
  kondisjon_spesial: { U15: 35, U19: 40, ELITE: 45 },
  eksplosivitet_turn: { U15: 45, U19: 55, ELITE: 65 },
  rotasjonspower_turn: { U15: 45, U19: 55, ELITE: 65 },
  kondisjon_turn: { U15: 35, U19: 40, ELITE: 45 },
  vedlikehold_styrke: { U15: 40, U19: 45, ELITE: 55 },
  vedlikehold_kondisjon: { U15: 30, U19: 30, ELITE: 35 },
} as const;

// ---------- Sessions per (fase, aldersgruppe) ----------

function grunnSessions(age: AgeGroup): SessionTemplate[] {
  const styrkeA_drills: Record<AgeGroup, DrillSpec[]> = {
    U15: [
      ds("trapbar-deadlift", "GRUNN", "U15"),
      ds("bulgarian-split-squat", "GRUNN", "U15"),
      ds("nordic-hamstring-curl", "GRUNN", "U15"),
      ds("hip-thrust", "GRUNN", "U15"),
      ds("pallof-press", "GRUNN", "U15"),
      ds("dead-bug", "GRUNN", "U15"),
    ],
    U19: [
      ds("trapbar-deadlift", "GRUNN", "U19"),
      ds("bulgarian-split-squat", "GRUNN", "U19"),
      ds("nordic-hamstring-curl", "GRUNN", "U19"),
      ds("hip-thrust", "GRUNN", "U19"),
      ds("box-jump", "GRUNN", "U19"),
      ds("pallof-press", "GRUNN", "U19"),
    ],
    ELITE: [
      ds("trapbar-deadlift", "GRUNN", "ELITE"),
      ds("bulgarian-split-squat", "GRUNN", "ELITE"),
      ds("nordic-hamstring-curl", "GRUNN", "ELITE"),
      ds("hip-thrust", "GRUNN", "ELITE"),
      ds("box-jump", "GRUNN", "ELITE"),
      ds("pallof-press", "GRUNN", "ELITE"),
      ds("dead-bug", "GRUNN", "ELITE"),
    ],
  };

  const styrkeB_drills: Record<AgeGroup, DrillSpec[]> = {
    U15: [
      ds("benkpress", "GRUNN", "U15"),
      ds("chin-up", "GRUNN", "U15"),
      ds("med-ball-rotasjonskast", "GRUNN", "U15"),
      ds("face-pull", "GRUNN", "U15"),
      ds("farmers-carry", "GRUNN", "U15"),
    ],
    U19: [
      ds("benkpress", "GRUNN", "U19"),
      ds("chin-up", "GRUNN", "U19"),
      ds("med-ball-rotasjonskast", "GRUNN", "U19"),
      ds("med-ball-overhead-kast", "GRUNN", "U19"),
      ds("face-pull", "GRUNN", "U19"),
    ],
    ELITE: [
      ds("benkpress", "GRUNN", "ELITE"),
      ds("chin-up", "GRUNN", "ELITE"),
      ds("med-ball-rotasjonskast", "GRUNN", "ELITE"),
      ds("med-ball-overhead-kast", "GRUNN", "ELITE"),
      ds("face-pull", "GRUNN", "ELITE"),
      ds("farmers-carry", "GRUNN", "ELITE"),
    ],
  };

  return [
    {
      dayOffset: 0,
      title: "Styrke A — Nedre kropp",
      rationale: "Hoftedominant + bilateral stabilitet. Bygger kraftgrunnlaget i grunnfasen.",
      durationMin: DUR.styrkeA_grunn[age],
      environment: "GYM",
      drills: styrkeA_drills[age],
    },
    {
      dayOffset: 2,
      title: "Kondisjon — Aerob base",
      rationale: "Sone 2-løp for aerob kapasitet. Grunnlag for å holde fokus hull 14-18.",
      durationMin: DUR.kondisjon_grunn[age],
      environment: "GYM",
      drills: [ds("aerob-base-lop", "GRUNN", age)],
    },
    {
      dayOffset: 4,
      title: "Styrke B — Øvre kropp + Rotasjon",
      rationale: "Push/pull + rotasjonskraft. Bygger gjennomslag og køllehodehastighet.",
      durationMin: DUR.styrkeB_grunn[age],
      environment: "GYM",
      drills: styrkeB_drills[age],
    },
  ];
}

function spesialSessions(age: AgeGroup): SessionTemplate[] {
  const styrkeA_drills: Record<AgeGroup, DrillSpec[]> = {
    U15: [
      ds("trapbar-deadlift", "SPESIAL", "U15"),
      ds("jump-squat", "SPESIAL", "U15"),
      ds("bulgarian-split-squat", "SPESIAL", "U15"),
      ds("nordic-hamstring-curl", "SPESIAL", "U15"),
      ds("pallof-press", "SPESIAL", "U15"),
    ],
    U19: [
      ds("trapbar-deadlift", "SPESIAL", "U19"),
      ds("jump-squat", "SPESIAL", "U19"),
      ds("bulgarian-split-squat", "SPESIAL", "U19"),
      ds("nordic-hamstring-curl", "SPESIAL", "U19"),
      ds("hip-thrust", "SPESIAL", "U19"),
      ds("pallof-press", "SPESIAL", "U19"),
    ],
    ELITE: [
      ds("trapbar-deadlift", "SPESIAL", "ELITE"),
      ds("jump-squat", "SPESIAL", "ELITE"),
      ds("box-jump", "SPESIAL", "ELITE"),
      ds("bulgarian-split-squat", "SPESIAL", "ELITE"),
      ds("nordic-hamstring-curl", "SPESIAL", "ELITE"),
      ds("pallof-press", "SPESIAL", "ELITE"),
    ],
  };

  const styrkeB_drills: Record<AgeGroup, DrillSpec[]> = {
    U15: [
      ds("benkpress", "SPESIAL", "U15"),
      ds("med-ball-overhead-kast", "SPESIAL", "U15"),
      ds("med-ball-rotasjonskast", "SPESIAL", "U15"),
      ds("chin-up", "SPESIAL", "U15"),
      ds("face-pull", "SPESIAL", "U15"),
    ],
    U19: [
      ds("benkpress", "SPESIAL", "U19"),
      ds("med-ball-overhead-kast", "SPESIAL", "U19"),
      ds("med-ball-rotasjonskast", "SPESIAL", "U19"),
      ds("chin-up", "SPESIAL", "U19"),
      ds("face-pull", "SPESIAL", "U19"),
    ],
    ELITE: [
      ds("benkpress", "SPESIAL", "ELITE"),
      ds("med-ball-overhead-kast", "SPESIAL", "ELITE"),
      ds("med-ball-rotasjonskast", "SPESIAL", "ELITE"),
      ds("chin-up", "SPESIAL", "ELITE"),
      ds("face-pull", "SPESIAL", "ELITE"),
      ds("farmers-carry", "SPESIAL", "ELITE"),
    ],
  };

  return [
    {
      dayOffset: 0,
      title: "Styrke A — Power + Nedre",
      rationale: "Konvertering av kraft til power. Eksplosivitet introduseres med jump-squat.",
      durationMin: DUR.styrkeA_spesial[age],
      environment: "GYM",
      drills: styrkeA_drills[age],
    },
    {
      dayOffset: 2,
      title: "Kondisjon — Intervall 600m",
      rationale: "Speed-endurance. Konverterer aerob base til race-pace.",
      durationMin: DUR.kondisjon_spesial[age],
      environment: "GYM",
      drills: [ds("intervall-600m", "SPESIAL", age)],
    },
    {
      dayOffset: 4,
      title: "Styrke B — Power + Øvre/Rotasjon",
      rationale: "Med-ball-kast for rotasjonspower. Direkte overføring til køllehodehastighet.",
      durationMin: DUR.styrkeB_spesial[age],
      environment: "GYM",
      drills: styrkeB_drills[age],
    },
  ];
}

function turneringSessions(age: AgeGroup): SessionTemplate[] {
  const eksplosivitet_drills: Record<AgeGroup, DrillSpec[]> = {
    U15: [
      ds("trapbar-deadlift", "TURNERING", "U15"),
      ds("box-jump", "TURNERING", "U15"),
      ds("single-leg-rdl", "TURNERING", "U15"),
      ds("pallof-press", "TURNERING", "U15"),
    ],
    U19: [
      ds("trapbar-deadlift", "TURNERING", "U19"),
      ds("box-jump", "TURNERING", "U19"),
      ds("jump-squat", "TURNERING", "U19"),
      ds("single-leg-rdl", "TURNERING", "U19"),
      ds("pallof-press", "TURNERING", "U19"),
    ],
    ELITE: [
      ds("trapbar-deadlift", "TURNERING", "ELITE"),
      ds("box-jump", "TURNERING", "ELITE"),
      ds("jump-squat", "TURNERING", "ELITE"),
      ds("single-leg-rdl", "TURNERING", "ELITE"),
      ds("nordic-hamstring-curl", "TURNERING", "ELITE"),
      ds("pallof-press", "TURNERING", "ELITE"),
    ],
  };

  const rotasjonspower_drills: Record<AgeGroup, DrillSpec[]> = {
    U15: [
      ds("benkpress", "TURNERING", "U15"),
      ds("med-ball-rotasjonskast", "TURNERING", "U15"),
      ds("med-ball-overhead-kast", "TURNERING", "U15"),
      ds("chin-up", "TURNERING", "U15"),
      ds("face-pull", "TURNERING", "U15"),
    ],
    U19: [
      ds("benkpress", "TURNERING", "U19"),
      ds("med-ball-rotasjonskast", "TURNERING", "U19"),
      ds("med-ball-overhead-kast", "TURNERING", "U19"),
      ds("chin-up", "TURNERING", "U19"),
      ds("face-pull", "TURNERING", "U19"),
    ],
    ELITE: [
      ds("benkpress", "TURNERING", "ELITE"),
      ds("med-ball-rotasjonskast", "TURNERING", "ELITE"),
      ds("med-ball-overhead-kast", "TURNERING", "ELITE"),
      ds("chin-up", "TURNERING", "ELITE"),
      ds("farmers-carry", "TURNERING", "ELITE"),
      ds("face-pull", "TURNERING", "ELITE"),
    ],
  };

  return [
    {
      dayOffset: 0,
      title: "Eksplosivitet — Nedre",
      rationale: "Topping power for pre-sesong. Lave volum, høy intensitet.",
      durationMin: DUR.eksplosivitet_turn[age],
      environment: "GYM",
      drills: eksplosivitet_drills[age],
    },
    {
      dayOffset: 2,
      title: "Kondisjon — Intervall 400m",
      rationale: "Konvertering til speed-kapasitet. Pre-sesong peaking.",
      durationMin: DUR.kondisjon_turn[age],
      environment: "GYM",
      drills: [ds("intervall-400m", "TURNERING", age)],
    },
    {
      dayOffset: 4,
      title: "Rotasjonspower — Øvre",
      rationale: "Maks rotasjonshastighet. Peak køllehodehastighet inn mot sesong.",
      durationMin: DUR.rotasjonspower_turn[age],
      environment: "GYM",
      drills: rotasjonspower_drills[age],
    },
  ];
}

function sesongSessions(age: AgeGroup): SessionTemplate[] {
  const styrke_drills: Record<AgeGroup, DrillSpec[]> = {
    U15: [
      ds("trapbar-deadlift", "SESONG", "U15"),
      ds("bulgarian-split-squat", "SESONG", "U15"),
      ds("med-ball-rotasjonskast", "SESONG", "U15"),
      ds("benkpress", "SESONG", "U15"),
      ds("face-pull", "SESONG", "U15"),
    ],
    U19: [
      ds("trapbar-deadlift", "SESONG", "U19"),
      ds("bulgarian-split-squat", "SESONG", "U19"),
      ds("med-ball-rotasjonskast", "SESONG", "U19"),
      ds("benkpress", "SESONG", "U19"),
      ds("chin-up", "SESONG", "U19"),
      ds("face-pull", "SESONG", "U19"),
    ],
    ELITE: [
      ds("trapbar-deadlift", "SESONG", "ELITE"),
      ds("single-leg-rdl", "SESONG", "ELITE"),
      ds("med-ball-rotasjonskast", "SESONG", "ELITE"),
      ds("benkpress", "SESONG", "ELITE"),
      ds("chin-up", "SESONG", "ELITE"),
      ds("face-pull", "SESONG", "ELITE"),
    ],
  };

  // U15/U19 bruker vedlikeholdslop, ELITE bruker intervall-400m
  const kondisjon_drill: Record<AgeGroup, DrillSpec> = {
    U15: ds("vedlikeholdslop", "SESONG", "U15"),
    U19: ds("vedlikeholdslop", "SESONG", "U19"),
    ELITE: ds("intervall-400m", "SESONG", "ELITE"),
  };

  return [
    {
      dayOffset: 1,
      title: "Vedlikehold — Styrke",
      rationale: "Bevare kraft og rotasjonspower under sesong. Lav volum, kort økt.",
      durationMin: DUR.vedlikehold_styrke[age],
      environment: "GYM",
      drills: styrke_drills[age],
    },
    {
      dayOffset: 4,
      title: "Vedlikehold — Kondisjon",
      rationale: "Z2-vedlikehold. Aldri dagen før/etter turnering.",
      durationMin: DUR.vedlikehold_kondisjon[age],
      environment: "GYM",
      drills: [kondisjon_drill[age]],
    },
  ];
}

// ---------- Plan-templates ----------

const START_DATES: Record<PhaseKey, Date> = {
  GRUNN: new Date(Date.UTC(2026, 9, 1)), // 1. oktober 2026
  SPESIAL: new Date(Date.UTC(2027, 0, 6)), // 6. januar 2027
  TURNERING: new Date(Date.UTC(2027, 2, 1)), // 1. mars 2027
  SESONG: new Date(Date.UTC(2027, 4, 1)), // 1. mai 2027
};

const DURATION_WEEKS: Record<PhaseKey, number> = {
  GRUNN: 12,
  SPESIAL: 8,
  TURNERING: 8,
  SESONG: 20,
};

const PHASE_LABEL: Record<PhaseKey, string> = {
  GRUNN: "Grunnfase",
  SPESIAL: "Spesialfase",
  TURNERING: "Pre-sesong",
  SESONG: "Sesong-vedlikehold",
};

function endDate(start: Date, weeks: number): Date {
  const ms = weeks * 7 * 24 * 60 * 60 * 1000;
  return new Date(start.getTime() + ms);
}

function buildTemplate(phase: PhaseKey, age: AgeGroup): PlanTemplate {
  const id = `fys-${phase.toLowerCase()}-${age.toLowerCase()}`;
  const start = START_DATES[phase];
  const end = endDate(start, DURATION_WEEKS[phase]);
  const lPhase: LPhaseValue = phase === "SESONG" ? "TURNERING" : phase;

  let sessions: SessionTemplate[];
  switch (phase) {
    case "GRUNN":
      sessions = grunnSessions(age);
      break;
    case "SPESIAL":
      sessions = spesialSessions(age);
      break;
    case "TURNERING":
      sessions = turneringSessions(age);
      break;
    case "SESONG":
      sessions = sesongSessions(age);
      break;
  }

  return {
    id,
    name: `FYS ${PHASE_LABEL[phase]} ${age}`,
    phase,
    ageGroup: age,
    startDate: start,
    endDate: end,
    lPhase,
    sessions,
  };
}

function buildAllTemplates(): PlanTemplate[] {
  const phases: PhaseKey[] = ["GRUNN", "SPESIAL", "TURNERING", "SESONG"];
  const ages: AgeGroup[] = ["U15", "U19", "ELITE"];
  const out: PlanTemplate[] = [];
  for (const p of phases) {
    for (const a of ages) {
      out.push(buildTemplate(p, a));
    }
  }
  return out;
}

// ---------- Pre-flight sjekk ----------

/**
 * Verifiser at alle ExerciseDefinition-er som planene refererer til
 * finnes i databasen. Gir tydelig feilmelding hvis seed-physical-exercises.ts
 * ikke er kjørt først.
 */
async function preflight(): Promise<void> {
  const requiredIds = Object.keys(SETS_REPS);
  const found = await prisma.exerciseDefinition.findMany({
    where: { id: { in: requiredIds } },
    select: { id: true },
  });
  const foundSet = new Set(found.map((e) => e.id));
  const missing = requiredIds.filter((id) => !foundSet.has(id));
  if (missing.length > 0) {
    console.error(
      "Manglende ExerciseDefinition-er (kjør seed-physical-exercises.ts først):",
    );
    for (const id of missing) {
      console.error(`  - ${id}`);
    }
    process.exit(1);
  }
}

// ---------- Placeholder-bruker ----------

/**
 * Sørg for at template-placeholder User finnes. TrainingPlan.userId har FK med
 * onDelete: Cascade — så vi må ha en ekte User-rad. Denne brukeren er en
 * ren system-placeholder og skal aldri kunne logge inn (ikke koblet til
 * Supabase auth.users — authId er all-zero UUID).
 */
async function ensureTemplateUser(): Promise<void> {
  await prisma.user.upsert({
    where: { id: TEMPLATE_USER_ID },
    update: {},
    create: {
      id: TEMPLATE_USER_ID,
      authId: TEMPLATE_USER_AUTH_ID,
      email: TEMPLATE_USER_EMAIL,
      name: "Template Placeholder",
      role: "ADMIN",
    },
  });
}

// ---------- Main ----------

async function main() {
  await preflight();
  await ensureTemplateUser();

  const templates = buildAllTemplates();
  console.log(`Seeder ${templates.length} plan-maler...`);

  for (const tpl of templates) {
    // Bruk transaksjon — delete + create + nested writes — for å garantere
    // konsistent state per plan.
    await prisma.$transaction(async (tx) => {
      // Slett eventuell eksisterende mal med samme ID (cascade tar sessions + drills).
      await tx.trainingPlan.deleteMany({ where: { id: tpl.id } });

      // scheduledAt: relativ til startDate. For uke 1 = start + dayOffset dager.
      // Coach justerer ved tildeling — disse er placeholders for visning.
      const baseMs = tpl.startDate.getTime();

      await tx.trainingPlan.create({
        data: {
          id: tpl.id,
          userId: TEMPLATE_USER_ID,
          name: tpl.name,
          startDate: tpl.startDate,
          endDate: tpl.endDate,
          isActive: false,
          status: "DRAFT",
          createdById: null,
          sessions: {
            create: tpl.sessions.map((s) => ({
              scheduledAt: new Date(baseMs + s.dayOffset * 24 * 60 * 60 * 1000),
              durationMin: s.durationMin,
              title: s.title,
              rationale: s.rationale,
              pyramidArea: "FYS",
              environment: s.environment,
              lPhase: tpl.lPhase,
              status: "PLANNED",
              drills: {
                create: s.drills.map((d, idx) => ({
                  exerciseId: d.exerciseId,
                  repsSets: d.repsSets,
                  sets: d.sets ?? null,
                  reps: d.reps ?? null,
                  orderIndex: idx,
                })),
              },
            })),
          },
        },
      });
    });

    console.log(`  + ${tpl.name}`);
  }

  console.log(`\nFerdig! ${templates.length} plan-maler seedet.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
