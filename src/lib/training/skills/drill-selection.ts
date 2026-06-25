import { z } from "zod";
import { skillAreaSchema } from "./types";

export const drillCandidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  skillArea: skillAreaSchema.nullable().optional(),
  lPhases: z.array(z.string()).optional().default([]),
  csTargetByKategori: z
    .record(z.string(), z.union([z.number(), z.null()]))
    .nullable()
    .optional()
    .transform((rec) => {
      if (!rec) return null;
      const cleaned = Object.fromEntries(
        Object.entries(rec).filter(([, v]) => typeof v === "number"),
      ) as Record<string, number>;
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }),
  varighetMin: z.number().int().positive().nullable().optional(),
});

export const drillSelectionInputSchema = z.object({
  skillArea: skillAreaSchema,
  lPhase: z.string().optional(),
  csTarget: z.number().int().min(50).max(100).optional(),
  akKategori: z.string().optional(),
  sisteDrillIds: z.array(z.string()).default([]),
  kandidater: z.array(drillCandidateSchema),
  maxDrills: z.number().int().positive().default(3),
  varighetMin: z.number().int().positive().default(60),
});

export type DrillSelectionInput = z.input<typeof drillSelectionInputSchema>;

export type DrillSelectionOutput = {
  valgte: Array<{
    id: string;
    name: string;
    varighetMin: number;
  }>;
};

export function runDrillSelectionSkill(
  input: DrillSelectionInput,
): DrillSelectionOutput {
  const parsed = drillSelectionInputSchema.parse(input);
  const recent = new Set(parsed.sisteDrillIds.slice(0, 4));

  let filtered = parsed.kandidater.filter((d) => {
    if (d.skillArea && d.skillArea !== parsed.skillArea) return false;
    if (recent.has(d.id)) return false;
    if (parsed.lPhase && d.lPhases.length > 0 && !d.lPhases.includes(parsed.lPhase)) {
      return false;
    }
    if (parsed.akKategori && d.csTargetByKategori) {
      const cs = d.csTargetByKategori[parsed.akKategori];
      if (cs != null && parsed.csTarget != null && cs > parsed.csTarget + 15) {
        return false;
      }
    }
    return true;
  });

  if (filtered.length === 0) {
    filtered = parsed.kandidater.filter((d) => !recent.has(d.id));
  }

  const valgte = filtered.slice(0, parsed.maxDrills).map((d) => ({
    id: d.id,
    name: d.name,
    varighetMin: d.varighetMin ?? Math.round(parsed.varighetMin / parsed.maxDrills),
  }));

  return { valgte };
}