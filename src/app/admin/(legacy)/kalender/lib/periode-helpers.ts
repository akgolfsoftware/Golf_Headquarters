// Periode-helpers — pure utility functions used by both server actions
// and server components. Separated from `actions/perioder.ts` because
// "use server"-filer kan kun eksportere async-funksjoner.

import { PeriodeTypeSchema } from "@/lib/portal/training/ak-taxonomy";
import type { PeriodBlock, PeriodeType, LPhase } from "@/generated/prisma/client";

export const TIL_LPHASE: Record<PeriodeType, LPhase> = {
  GRUNN: "GRUNN",
  SPESIALISERING: "SPESIAL",
  TURNERING: "TURNERING",
  // EVALUERING og FERIE lagres som TURNERING / GRUNN inntil schema utvides;
  // den ekte verdien serialiseres i notes-prefix.
  EVALUERING: "TURNERING",
  FERIE: "GRUNN",
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
  // Fallback: bruk LPhase
  if (block.lPhase === "GRUNN") return "GRUNN";
  if (block.lPhase === "SPESIAL") return "SPESIALISERING";
  return "TURNERING";
}
