// Periode-helpers — pure utility functions used by both server actions
// and server components. Separated from `actions/perioder.ts` because
// "use server"-filer kan kun eksportere async-funksjoner.

import { PeriodeTypeSchema } from "@/lib/portal/training/ak-taxonomy";
import type { PeriodBlock, PeriodeType, LPhase } from "@/generated/prisma/client";

// OW-2 (15.09.2026): LPhase og PeriodeType har nå samme åtte verdier
// (ordbok-masteren §4.1) — dette er en ren identitet, ikke en lossy mapping.
export const TIL_LPHASE: Record<PeriodeType, LPhase> = {
  GRUNN: "GRUNN",
  SPESIAL: "SPESIAL",
  TURNERING: "TURNERING",
  EVALUERING: "EVALUERING",
  TESTUKE: "TESTUKE",
  FERIE: "FERIE",
  TRENINGSSAMLING: "TRENINGSSAMLING",
  HELDAGSSAMLING: "HELDAGSSAMLING",
};

export const FRA_NOTES_PREFIKS = /^\[periode:([A-Z]+)\]\s*/;

export function leggTilPeriodeMarkor(
  periodeType: PeriodeType,
  notes: string | null | undefined,
): string {
  const ren = (notes ?? "").replace(FRA_NOTES_PREFIKS, "").trim();
  return `[periode:${periodeType}] ${ren}`.trim();
}

export function lesPeriodeType(
  block: Pick<PeriodBlock, "lPhase" | "notes">,
): PeriodeType {
  const match = (block.notes ?? "").match(FRA_NOTES_PREFIKS);
  if (match && match[1]) {
    const parsed = PeriodeTypeSchema.safeParse(match[1]);
    if (parsed.success) return parsed.data;
  }
  // LPhase og PeriodeType har samme verdisett (OW-2) — les direkte, ingen gjetting.
  const parsedLPhase = PeriodeTypeSchema.safeParse(block.lPhase);
  if (parsedLPhase.success) return parsedLPhase.data;
  return "TURNERING";
}
