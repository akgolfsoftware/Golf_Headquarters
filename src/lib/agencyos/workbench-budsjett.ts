/**
 * Rene utregninger for «Lagt inn mot fordelt» i coachens Ukeverksted (designløftet 20.10.2026).
 * Fordelt kommer fra ukeplanens timer per akse (fylt fra perioden), aldri fra et fast tall.
 */
import type { PyramidArea, WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";

export const AKSER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

/** Timer med én desimal, norsk komma: 90 min → «1,5». */
export const timer = (min: number) => (min / 60).toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Gruppeøkt endret for spilleren = «egen»; uendret gruppeøkt = «gruppe». Samme regel som kildeMerke i AG11Ark. */
export function gruppeMerke(s: Pick<WorkbenchSession, "sourceGroupSessionId" | "localOverride" | "origin">): "egen" | "gruppe" | null {
  if (s.sourceGroupSessionId && s.localOverride) return "egen";
  if (s.sourceGroupSessionId || s.origin === "GROUP") return "gruppe";
  return null;
}

/** Ukeplanens fordelte minutter per akse, eller null når ingenting er fordelt. */
export function fordeltPerAkse(uke: WeekViewModel): Record<PyramidArea, number> | null {
  const wp = uke.weekPlan;
  if (!wp) return null;
  const m: Record<PyramidArea, number> = {
    FYS: (wp.plannedHoursFys ?? 0) * 60, TEK: (wp.plannedHoursTek ?? 0) * 60, SLAG: (wp.plannedHoursSlag ?? 0) * 60,
    SPILL: (wp.plannedHoursSpill ?? 0) * 60, TURN: (wp.plannedHoursTurn ?? 0) * 60,
  };
  return AKSER.some((a) => m[a] > 0) ? m : null;
}

/** Lagte minutter per akse. Avlyste økter teller ikke. */
export function lagtInnPerAkse(okter: readonly WorkbenchSession[]): Record<PyramidArea, number> {
  const m: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  for (const s of okter) if (s.status !== "CANCELLED") m[s.pyramid] += s.durationMinutes;
  return m;
}

/** Antall økter fra gruppa, og hvor mange av dem som er endret for spilleren («Egen»). */
export function gruppeTelling(okter: readonly WorkbenchSession[]): { fraGruppa: number; egen: number } {
  let fraGruppa = 0, egen = 0;
  for (const s of okter) {
    if (s.status === "CANCELLED") continue;
    const k = gruppeMerke(s);
    if (k === "gruppe") fraGruppa++;
    if (k === "egen") { fraGruppa++; egen++; }
  }
  return { fraGruppa, egen };
}

