/**
 * Zod-schemas for Workbench-JSON. Brukes ved LESING fra databasen —
 * `as unknown as T` er forbudt for forretningskritiske data (CLAUDE.md
 * invariant 6). Rent domene: ingen I/O, ingen Prisma.
 */

import { z } from "zod";
import type { AKFormel } from "./types";

export const PyramidAreaSchema = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);

export const TrainingAreaSchema = z.enum([
  // Full sving
  "TEE",
  "INNSPILL_200",
  "INNSPILL_150",
  "INNSPILL_100",
  "INNSPILL_50",
  // Nærspill
  "CHIP",
  "PITCH",
  "LOB",
  "BUNKER",
  // Putt — seks bånd
  "PUTT_0_3",
  "PUTT_3_5",
  "PUTT_5_10",
  "PUTT_10_25",
  "PUTT_25_40",
  "PUTT_40_PLUSS",
  // Fysisk
  "STYRKE",
  "KONDISJON",
  "BEVEGELIGHET",
  // Bane
  "BANE",
]);

export const MotorikkSchema = z.enum(["UTEN_BALL", "LAV_HAST", "AUTO"]);

export const BelastningSchema = z.enum([
  "INNENDORS",
  "TRENINGSOMRADE",
  "BANE",
  "KONKURRANSE",
]);

export const PressSchema = z.enum([
  "ALENE",
  "OBSERVERT",
  "KONKURRANSE",
  "TURNERING",
]);

export const AkFormelSchema = z.object({
  pyramid: PyramidAreaSchema,
  area: TrainingAreaSchema,
  motorikk: MotorikkSchema.optional(),
  belastning: BelastningSchema.optional(),
  press: PressSchema.optional(),
  label: z.string(),
});

/**
 * Trygg lesing av et lagret AKFormel-felt. Ugyldig JSON gir en nøytral
 * fallback i stedet for å velte hele uke-lastingen — vokabular er
 * merkelapper, aldri regler (invariant 1).
 */
export function parseAkFormel(value: unknown, fallbackLabel: string): AKFormel {
  const parsed = AkFormelSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return { pyramid: "TEK", area: "TEE", label: fallbackLabel };
}

export const SessionStatusSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "SKIPPED",
]);

export const BlockTypeSchema = z.enum([
  "OEKT",
  "SKOLE",
  "BOOKING",
  "TURNERING",
  "REISE",
  "TEST",
  "SJEKKPUNKT",
  "HELSE",
  "GRUPPEOEKT",
]);

export const SessionOriginSchema = z.enum(["PLAYER", "COACH", "GROUP"]);
export const ApprovalStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED"]);
export const EnvironmentSchema = z.enum([
  "RANGE",
  "BANE",
  "STUDIO",
  "HJEM",
  "SIMULATOR",
  "GYM",
]);
export const PracticeTypeSchema = z.enum([
  "BLOKK",
  "VARIABEL",
  "KONKURRANSE",
  "SPILL_TEST",
]);

/** YYYY-MM-DD */
export const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig dato");

/** Input til `moveSession` — grensevalidering av tid/varighet (B3, agency-herding). */
export const MoveSessionInputSchema = z.object({
  sessionId: z.string().min(1, "Mangler økt-id"),
  newDate: IsoDateSchema,
  newStartMinute: z.number().int().min(0).max(1439, "Ugyldig starttidspunkt"),
  newDurationMinutes: z.number().int().min(15).max(720, "Ugyldig varighet").optional(),
});

/** Input til `reorderDrills` — id-listen må faktisk være strenger, ikke bare "et array" (B3). */
export const ReorderDrillsInputSchema = z.object({
  sessionId: z.string().min(1, "Mangler økt-id"),
  orderedDrillIds: z.array(z.string().min(1)),
});

// ─── Serie (B5) ─────────────────────────────────────────────────────────────

export const RecurrencePolicySchema = z.enum([
  "DENNE",
  "DENNE_OG_FREMOVER",
  "HELE_SERIEN",
]);

/** "Gjenta ukentlig" ved oppretting — 1 = ingen gjentagelse, maks ~et halvt år. */
export const RepeatWeeksSchema = z.number().int().min(1).max(26);

export const SeriesContentPatchSchema = z
  .object({
    title: z.string().min(1, "Økten må ha en tittel").optional(),
    pyramid: PyramidAreaSchema.optional(),
    blockType: BlockTypeSchema.optional(),
    environment: EnvironmentSchema.optional(),
    notes: z.string().optional(),
  })
  .refine((p) => Object.keys(p).length > 0, "Ingen endringer å lagre.");

export const UpdateSeriesSessionInputSchema = z.object({
  sessionId: z.string().min(1, "Mangler økt-id"),
  patch: SeriesContentPatchSchema,
  policy: RecurrencePolicySchema,
});

export const DeleteSeriesSessionInputSchema = z.object({
  sessionId: z.string().min(1, "Mangler økt-id"),
  policy: RecurrencePolicySchema,
});

// ─── Godkjenning (Loop 3T / B6) ─────────────────────────────────────────────

/** Spillerens svar på et forslag fra coach/gruppe — se `resolvePlayerApproval`. */
export const PlayerApprovalDecisionSchema = z.enum(["ACCEPTED", "REJECTED"]);

export const ResolvePlayerApprovalInputSchema = z.object({
  sessionId: z.string().min(1, "Mangler økt-id"),
  decision: PlayerApprovalDecisionSchema,
});
