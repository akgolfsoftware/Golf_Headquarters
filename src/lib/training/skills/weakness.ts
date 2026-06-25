import { z } from "zod";
import type { PyramidArea, SgCategory } from "@/generated/prisma/client";
import { sgCategorySchema } from "./types";
import { runPyramidSkill } from "./pyramid";

export const weaknessInputSchema = z.object({
  sgSnitt: z.record(sgCategorySchema, z.number()),
  pyramidSessions: z
    .array(
      z.object({
        pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
        durationMin: z.number().int().positive(),
      }),
    )
    .default([]),
  currentFocus: z.enum(["OTT", "APP", "ARG", "PUTT"]).optional(),
});

export type WeaknessInput = z.input<typeof weaknessInputSchema>;

export type WeaknessOutput = {
  primarySgArea: SgCategory;
  sgValue: number;
  undertrent: boolean;
  pyramidGap: PyramidArea | null;
  anbefaling: string;
};

const SG_LABEL: Record<SgCategory, string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Kortspill",
  PUTT: "Putting",
};

export function runWeaknessSkill(input: WeaknessInput): WeaknessOutput {
  const parsed = weaknessInputSchema.parse(input);
  const omraader = Object.keys(parsed.sgSnitt) as SgCategory[];
  const primarySgArea = omraader.reduce((best, curr) =>
    parsed.sgSnitt[curr] < parsed.sgSnitt[best] ? curr : best,
  );

  const pyramid = runPyramidSkill({ sessions: parsed.pyramidSessions });
  const undertrent = pyramid.primaryGap !== null;

  const anbefaling = undertrent && pyramid.primaryGap
    ? `Øk ${pyramid.primaryGap.omrade}-volum — ${SG_LABEL[primarySgArea]} er svakeste SG-område.`
    : `Prioriter ${SG_LABEL[primarySgArea]} i neste uke.`;

  return {
    primarySgArea,
    sgValue: parsed.sgSnitt[primarySgArea],
    undertrent,
    pyramidGap: pyramid.primaryGap?.omrade ?? null,
    anbefaling,
  };
}