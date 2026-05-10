// Pyramide-aggregat fra trenings-sesjoner.
// 5 områder (FYS/TEK/SLAG/SPILL/TURN) med sum minutter per område.

import type { PyramidArea } from "@/generated/prisma/client";

export type PyramideAggregat = Record<PyramidArea, number>;

const TOM: PyramideAggregat = {
  FYS: 0,
  TEK: 0,
  SLAG: 0,
  SPILL: 0,
  TURN: 0,
};

/**
 * Aggregerer minutter per pyramide-område fra et utvalg sesjoner.
 */
export function aggregateByArea(
  sessions: { pyramidArea: PyramidArea; durationMin: number }[]
): PyramideAggregat {
  const result: PyramideAggregat = { ...TOM };
  for (const s of sessions) {
    result[s.pyramidArea] += s.durationMin;
  }
  return result;
}

export function totalMinutter(agg: PyramideAggregat): number {
  return Object.values(agg).reduce((sum, v) => sum + v, 0);
}

export function prosentPerArea(agg: PyramideAggregat): PyramideAggregat {
  const total = totalMinutter(agg);
  if (total === 0) return { ...TOM };
  const result: PyramideAggregat = { ...TOM };
  for (const key of Object.keys(agg) as PyramidArea[]) {
    result[key] = Math.round((agg[key] / total) * 100);
  }
  return result;
}

export const PYR_REKKEFOLGE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

export const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export const PYR_BG_KLASSE: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};
