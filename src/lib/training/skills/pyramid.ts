import { z } from "zod";
import type { PyramidArea } from "@/generated/prisma/client";
import { aggregateByArea, prosentPerArea } from "@/lib/pyramide";
import {
  DEFAULT_PYRAMID_PERCENT,
  pyramidAreaSchema,
  type PyramidDistribution,
} from "./types";

export const pyramidInputSchema = z.object({
  idealPercent: z.record(pyramidAreaSchema, z.number().min(0).max(100)).optional(),
  sessions: z.array(
    z.object({
      pyramidArea: pyramidAreaSchema,
      durationMin: z.number().int().positive(),
    }),
  ),
  thresholdPp: z.number().positive().default(8),
});

export type PyramidInput = z.input<typeof pyramidInputSchema>;

export type PyramidGap = {
  omrade: PyramidArea;
  faktiskProsent: number;
  malProsent: number;
  avvikPp: number;
};

export type PyramidSkillOutput = {
  ideal: PyramidDistribution;
  faktisk: PyramidDistribution;
  gaps: PyramidGap[];
  primaryGap: PyramidGap | null;
};

export function runPyramidSkill(input: PyramidInput): PyramidSkillOutput {
  const parsed = pyramidInputSchema.parse(input);
  const ideal = { ...DEFAULT_PYRAMID_PERCENT, ...parsed.idealPercent };
  const agg = aggregateByArea(parsed.sessions);
  const faktisk = prosentPerArea(agg);

  const gaps: PyramidGap[] = [];
  for (const omrade of Object.keys(ideal) as PyramidArea[]) {
    const mal = ideal[omrade];
    const faktiskProsent = faktisk[omrade];
    const avvikPp = mal - faktiskProsent;
    if (avvikPp > parsed.thresholdPp) {
      gaps.push({ omrade, faktiskProsent, malProsent: mal, avvikPp });
    }
  }

  gaps.sort((a, b) => b.avvikPp - a.avvikPp);
  return {
    ideal,
    faktisk,
    gaps,
    primaryGap: gaps[0] ?? null,
  };
}