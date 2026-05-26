// ak-taxonomy v4 — utvidet taksonomi for treningsplanlegger v4.
//
// Bygger oppå den eksisterende pyramide-taksonomien i `src/lib/taxonomy.ts`
// (FYS/TEK/SLAG/SPILL/TURN) og legger til:
//   - TEMPLATE_FOCUS-typer (ALLSIDIG, SPESIFIKK, INTEGRERT, REGENERATION)
//   - PERIODE_FARGER (kart fra PeriodeType → semantiske farge-tokens)
//   - L-faser + CS-nivåer (re-eksport)
//   - Praksistyper (B/R/K/S) tilkoblet PracticeType-enum
//   - Treningsområder (re-eksport)
//   - Zod-skjemaer for validering
//
// Alt UI-relevant skal hente fra denne fila. Enums kommer fra Prisma —
// vi mapper UI-tekst og farger her.

import { z } from "zod";
import type {
  PeriodeType,
  PracticeType,
  LFase,
  CSNivaa,
} from "@/generated/prisma/client";
import {
  PYRAMIDE,
  L_FASER,
  CS_NIVAER,
  TRENINGSOMRADER,
  M_MILJO,
  PR_PRESS,
  type Treningsomrade,
} from "@/lib/taxonomy";

// ---------------------------------------------------------------------------
// Re-eksport (bekvemmelighet — alle treningsplan-konsumenter bør importere herfra)
// ---------------------------------------------------------------------------

export {
  PYRAMIDE,
  L_FASER,
  CS_NIVAER,
  TRENINGSOMRADER,
  M_MILJO,
  PR_PRESS,
};
export type { Treningsomrade };

// ---------------------------------------------------------------------------
// TEMPLATE_FOCUS — fokus-typer for økt-maler
// ---------------------------------------------------------------------------

export type TemplateFocusKode =
  | "ALLSIDIG"
  | "SPESIFIKK"
  | "INTEGRERT"
  | "REGENERATION";

export const TEMPLATE_FOCUS_TYPER = {
  ALLSIDIG: {
    kode: "ALLSIDIG" as const,
    label: "Allsidig",
    beskrivelse: "Bredt tema, flere pyramide-områder dekket",
  },
  SPESIFIKK: {
    kode: "SPESIFIKK" as const,
    label: "Spesifikk",
    beskrivelse: "Snevert tema, ett område i dybden",
  },
  INTEGRERT: {
    kode: "INTEGRERT" as const,
    label: "Integrert",
    beskrivelse: "Kombinerer flere pyramide-områder i samme drill",
  },
  REGENERATION: {
    kode: "REGENERATION" as const,
    label: "Regenerasjon",
    beskrivelse: "Restitusjon, mobilitet, lett trening",
  },
} as const;

// ---------------------------------------------------------------------------
// PERIODE_FARGER — UI-farger for PeriodeType
//
// Lyse + mørke verdier brukes direkte (ikke semantiske tokens) fordi periode-
// fargene er en del av designet og skal være konsistente på tvers av temaer.
// ---------------------------------------------------------------------------

export type PeriodeFarge = {
  bg: string;
  text: string;
  pattern?: "solid" | "diagonal-stripe";
};

export const PERIODE_FARGER: Record<PeriodeType, PeriodeFarge> = {
  GRUNN: { bg: "#003B2A", text: "#FFFFFF", pattern: "solid" },
  SPESIALISERING: { bg: "hsl(var(--primary))", text: "#FFFFFF", pattern: "solid" },
  TURNERING: { bg: "hsl(var(--accent))", text: "hsl(var(--foreground))", pattern: "solid" },
  EVALUERING: { bg: "hsl(var(--muted-foreground))", text: "#FFFFFF", pattern: "solid" },
  FERIE: { bg: "hsl(var(--secondary))", text: "hsl(var(--muted-foreground))", pattern: "diagonal-stripe" },
};

export const PERIODE_LABELS: Record<PeriodeType, string> = {
  GRUNN: "Grunnperiode",
  SPESIALISERING: "Spesialisering",
  TURNERING: "Turnering",
  EVALUERING: "Evaluering",
  FERIE: "Ferie",
};

// ---------------------------------------------------------------------------
// Praksistyper (kobler mot Prisma-enum PracticeType)
// B = Block, R = Random, K = Komparativ, S = Simulator/Test
// ---------------------------------------------------------------------------

export const PRAKSISTYPER: Record<
  PracticeType,
  { kort: string; label: string; beskrivelse: string }
> = {
  BLOKK: { kort: "B", label: "Blokk", beskrivelse: "Repetisjon av samme oppgave" },
  RANDOM: { kort: "R", label: "Random", beskrivelse: "Tilfeldig variasjon mellom oppgaver" },
  KONKURRANSE: { kort: "K", label: "Komparativ", beskrivelse: "Sammenlikning / konkurranse" },
  SPILL_TEST: { kort: "S", label: "Simulator/Test", beskrivelse: "Test eller simulert spill" },
};

export type PraksistypeKort = "B" | "R" | "K" | "S";

export function getPraksistypeKort(type: PracticeType): PraksistypeKort {
  return PRAKSISTYPER[type].kort as PraksistypeKort;
}

// ---------------------------------------------------------------------------
// L-fase / CS-nivå-mapping (anbefalt CS per L-fase)
// ---------------------------------------------------------------------------

export const LFASE_ANBEFALT_CS: Record<LFase, CSNivaa[]> = {
  L_KROPP: ["CS50", "CS60"],
  L_ARM: ["CS60", "CS70"],
  L_KOLLE: ["CS70", "CS80"],
  L_BALL: ["CS80", "CS90"],
  L_AUTO: ["CS90", "CS100"],
};

// ---------------------------------------------------------------------------
// Zod-skjemaer for validering
// ---------------------------------------------------------------------------

export const PyramidAreaSchema = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
export const PeriodeTypeSchema = z.enum([
  "GRUNN",
  "SPESIALISERING",
  "TURNERING",
  "EVALUERING",
  "FERIE",
]);
export const PracticeTypeSchema = z.enum(["BLOKK", "RANDOM", "KONKURRANSE", "SPILL_TEST"]);
export const LFaseSchema = z.enum(["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"]);
export const CSNivaaSchema = z.enum(["CS50", "CS60", "CS70", "CS80", "CS90", "CS100"]);
export const MMiljoSchema = z.enum(["M0", "M1", "M2", "M3", "M4", "M5"]);
export const PRPressSchema = z.enum(["PR1", "PR2", "PR3", "PR4", "PR5"]);
export const TemplateFocusSchema = z.enum([
  "ALLSIDIG",
  "SPESIFIKK",
  "INTEGRERT",
  "REGENERATION",
]);
