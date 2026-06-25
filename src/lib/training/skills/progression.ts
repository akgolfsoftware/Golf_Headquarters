import { z } from "zod";
import type { LFase } from "@/generated/prisma/client";

const akKategoriSchema = z.enum([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
]);

export const progressionInputSchema = z.object({
  ukeIPeriode: z.number().int().min(0),
  totaleUker: z.number().int().positive(),
  periodType: z.enum(["GRUNN", "SPES", "TURN", "HVILE", "OVERGANG"]).optional(),
  akKategori: akKategoriSchema.default("F"),
});

export type ProgressionInput = z.input<typeof progressionInputSchema>;

export type ProgressionOutput = {
  lFase: LFase;
  csTarget: number;
  mTarget: number;
  prTarget: number;
};

function lFaseForProgress(andel: number): LFase {
  if (andel < 0.25) return "L_KROPP";
  if (andel < 0.55) return "L_ARM";
  if (andel < 0.8) return "L_KOLLE";
  if (andel < 0.95) return "L_BALL";
  return "L_AUTO";
}

function csBaseForKategori(k: z.infer<typeof akKategoriSchema>): number {
  const idx = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].indexOf(k);
  return Math.min(90, 50 + Math.max(0, 10 - idx) * 4);
}

export function runProgressionSkill(input: ProgressionInput): ProgressionOutput {
  const parsed = progressionInputSchema.parse(input);
  const andel = parsed.ukeIPeriode / parsed.totaleUker;
  const baseCs = csBaseForKategori(parsed.akKategori);
  const csTarget = Math.round(
    Math.min(100, baseCs + andel * (100 - baseCs)),
  );

  const mTarget =
    parsed.periodType === "TURN" ? 4 : parsed.periodType === "SPES" ? 3 : 2;
  const prTarget =
    parsed.periodType === "TURN" ? 4 : parsed.periodType === "SPES" ? 3 : 2;

  return {
    lFase: lFaseForProgress(andel),
    csTarget,
    mTarget,
    prTarget,
  };
}