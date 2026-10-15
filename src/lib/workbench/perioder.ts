/**
 * 8c.1 — periodisering: øktbudsjett per pyramideområde per uke.
 * Lagres som JSON på PeriodBlock/GroupPeriodBlock.weeklySessionBudget
 * ({"FYS":4,"TEK":2,...}) og zod-valideres ALLTID ved lesing (JSON-regelen
 * i gotchas.md). Label-/farge-kanon for periodetypene bor i
 * src/lib/labels/taxonomy.ts (LPHASE_LABEL/LPHASE_FARGE).
 */

import { z } from "zod";

const antall = z.number().int().min(0).max(21);

export const SessionBudgetSchema = z
  .object({
    FYS: antall,
    TEK: antall,
    SLAG: antall,
    SPILL: antall,
    TURN: antall,
  })
  .partial();

export type SessionBudget = z.infer<typeof SessionBudgetSchema>;

/** Trygg lesing av weeklySessionBudget-JSON — null ved ugyldig/absent. */
export function parseSessionBudget(json: unknown): SessionBudget | null {
  if (json == null) return null;
  const res = SessionBudgetSchema.safeParse(json);
  if (!res.success) return null;
  // Tomt objekt regnes som «ikke satt».
  return Object.keys(res.data).length > 0 ? res.data : null;
}

/** Sum økter per uke i budsjettet (til tidslinje-etiketter). */
export function budsjettSum(b: SessionBudget | null): number {
  if (!b) return 0;
  return Object.values(b).reduce((a, v) => a + (v ?? 0), 0);
}

const minutter = z.number().int().min(0).max(3000).multipleOf(15);

/** Minutter per akse for én uke (vanlig eller lett). Hele 15-minutterssteg. */
export const AxisMinutesSchema = z
  .object({ FYS: minutter, TEK: minutter, SLAG: minutter, SPILL: minutter, TURN: minutter })
  .partial();

export type AxisMinutes = z.infer<typeof AxisMinutesSchema>;

/** Trygg lesing av axisMinutes-JSON — null ved ugyldig/absent/tom. */
export function parseAxisMinutes(json: unknown): AxisMinutes | null {
  if (json == null) return null;
  const res = AxisMinutesSchema.safeParse(json);
  if (!res.success) return null;
  return Object.keys(res.data).length > 0 ? res.data : null;
}

/** Sum minutter per uke over aksene. */
export function axisMinutesSum(m: AxisMinutes | null): number {
  if (!m) return 0;
  return Object.values(m).reduce((a, v) => a + (v ?? 0), 0);
}

/** 8c.2 — input-kontrakt for opprett/oppdater periode (delt server/klient). */
export const PeriodeInputSchema = z
  .object({
    lPhase: z.enum(["GRUNN", "SPESIAL", "TURNERING", "EVALUERING", "TESTUKE", "FERIE", "TRENINGSSAMLING", "HELDAGSSAMLING", "RESTITUSJON"]),
    /** YYYY-MM-DD (lokal dag). */
    startDato: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sluttDato: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    fokus: z.string().trim().max(200).optional(),
    ukevolumMin: z.number().int().min(0).max(3000).nullish(),
    ukevolumMax: z.number().int().min(0).max(3000).nullish(),
    budsjett: SessionBudgetSchema.nullish(),
    /** Minutter per akse, vanlig uke. undefined = ikke rør; null = nullstill. */
    axisMinutes: AxisMinutesSchema.nullish(),
    /** Minutter per akse, lett uke. undefined = ikke rør; null = nullstill. */
    axisMinutesLight: AxisMinutesSchema.nullish(),
    /** Fritekst for perioden. undefined = ikke rør; null/tomt = nullstill. */
    notat: z.string().trim().max(1000).nullish(),
  })
  .refine((v) => v.sluttDato >= v.startDato, { message: "Sluttdato må være etter startdato" });

export type PeriodeInput = z.infer<typeof PeriodeInputSchema>;
