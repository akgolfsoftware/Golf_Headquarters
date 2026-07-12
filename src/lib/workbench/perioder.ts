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
