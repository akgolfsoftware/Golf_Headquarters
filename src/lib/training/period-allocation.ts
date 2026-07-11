import type { PyramidArea } from "@/generated/prisma/client";
import { runPeriodizationSkill } from "@/lib/training/skills/periodization";
import type { Allocation } from "@/lib/training/target-allocation";
import { STANDARD_MAL } from "@/lib/training/target-allocation";

const PERIOD_TYPES = ["GRUNN", "SPES", "TURN", "HVILE", "OVERGANG"] as const;
export type PeriodType = (typeof PERIOD_TYPES)[number];

export function isPeriodType(v: string): v is PeriodType {
  return (PERIOD_TYPES as readonly string[]).includes(v);
}

/** Periodisering-skill → pyramide-% for TrainingPlan.targetAllocation. */
export function allocationForPeriod(periodType: PeriodType): Allocation {
  const out = runPeriodizationSkill({
    ukeStart: new Date(),
    periodType,
    skadeAktiv: false,
    dagerTilTurnering: periodType === "TURN" ? 3 : null,
  });

  if (!out.pyramidOverride) {
    return { ...STANDARD_MAL };
  }

  const base = { ...STANDARD_MAL };
  for (const [key, val] of Object.entries(out.pyramidOverride)) {
    if (typeof val === "number") {
      base[key as PyramidArea] = Math.round(val);
    }
  }
  return base;
}