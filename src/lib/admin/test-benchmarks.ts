/**
 * Benchmarks for NGF-testbatteriet (DataGolf-fasiter v1, 2026-06).
 *
 * `TestDefinition.protocol.benchmarks` (JSON, seedet fra
 * prisma/seed-data/ngf-test-battery.json) valideres her med zod før bruk —
 * forretningskritisk data skal aldri leses med blind type-cast.
 *
 * Nivåstigen er ordnet beste → svakeste (PGA topp 40 → Scratch). Beste
 * oppnådde nivå = første nivå i stigen som målingen tilfredsstiller,
 * retningsbevisst (higher: måling ≥ krav, lower: måling ≤ krav).
 */

import { z } from "zod";

export const benchmarkLevelSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  confidence: z.enum(["measured", "reference", "estimated"]),
});

export const benchmarksSchema = z.object({
  unit: z.enum(["pei_percent", "meters", "percent", "mph"]),
  direction: z.enum(["lower", "higher"]),
  source: z.string(),
  levels: z.array(benchmarkLevelSchema).min(1),
});

export type Benchmarks = z.infer<typeof benchmarksSchema>;

/** Trygg lesing av benchmarks fra protocol-JSON. `null` når feltet mangler/ugyldig. */
export function parseBenchmarks(protocol: unknown): Benchmarks | null {
  if (!protocol || typeof protocol !== "object") return null;
  const raw = (protocol as { benchmarks?: unknown }).benchmarks;
  if (raw == null) return null;
  const parsed = benchmarksSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/** Kompakt nivå-label til badge i matrise-cellene. */
const SHORT_LABEL: Record<string, string> = {
  pga_top40: "PGA",
  pga_avg: "PGA",
  dpw_kft: "DPW/KFT",
  challenge: "CHA",
  nordic: "NOR",
  elite_junior: "JR",
  scratch: "SCR",
};

/** Visningsenhet i kolonne-header (matriselayout). */
export const DISPLAY_UNIT: Record<Benchmarks["unit"], string> = {
  pei_percent: "PEI %",
  percent: "%",
  meters: "m",
  mph: "mph",
};

const VALUE_SUFFIX: Record<Benchmarks["unit"], string> = {
  pei_percent: " %",
  percent: " %",
  meters: " m",
  mph: " mph",
};

/** Norsk tallformat: heltall uten desimal, ellers én desimal med komma. */
function formatLevelValue(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(".", ",");
}

/**
 * PEI finnes historisk både som ratio (0,057) og prosent (5,7) i lagrede
 * scores. Benchmarks-verdiene er alltid prosent; ratio-verdier (≤ 1,5)
 * normaliseres før sammenligning.
 */
function normalizeMeasured(unit: Benchmarks["unit"], value: number): number {
  if (unit === "pei_percent" && value <= 1.5) return value * 100;
  return value;
}

export type AchievedLevel = {
  id: string;
  /** Kompakt badge-tekst, f.eks. "PGA", "DPW/KFT", "CHA". */
  short: string;
  label: string;
  /** Posisjon i stigen (0 = beste nivå). */
  index: number;
};

/** Beste oppnådde nivå for en måling, retningsbevisst. `null` = under Scratch. */
export function achievedLevel(benchmarks: Benchmarks, measured: number): AchievedLevel | null {
  const v = normalizeMeasured(benchmarks.unit, measured);
  for (let i = 0; i < benchmarks.levels.length; i += 1) {
    const level = benchmarks.levels[i];
    const hit = benchmarks.direction === "higher" ? v >= level.value : v <= level.value;
    if (hit) {
      return {
        id: level.id,
        short: SHORT_LABEL[level.id] ?? level.label.slice(0, 3).toUpperCase(),
        label: level.label,
        index: i,
      };
    }
  }
  return null;
}

/** Hele nivåstigen som flerlinjers tooltip-tekst (norsk tallformat). */
export function ladderText(benchmarks: Benchmarks): string {
  const cmp = benchmarks.direction === "higher" ? "≥" : "≤";
  return benchmarks.levels
    .map((l) => `${l.label}: ${cmp} ${formatLevelValue(l.value)}${VALUE_SUFFIX[benchmarks.unit]}`)
    .join("\n");
}
