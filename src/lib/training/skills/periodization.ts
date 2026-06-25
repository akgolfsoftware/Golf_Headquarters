import { z } from "zod";

export const periodTypeSchema = z.enum([
  "GRUNN",
  "SPES",
  "TURN",
  "HVILE",
  "OVERGANG",
]);

export const periodizationInputSchema = z.object({
  ukeStart: z.coerce.date(),
  periodType: periodTypeSchema.optional(),
  dagerTilTurnering: z.number().int().nullable().optional(),
  skadeAktiv: z.boolean().default(false),
  ukePosisjon: z.number().int().min(0).default(0),
  totaleUker: z.number().int().positive().default(12),
});

export type PeriodizationInput = z.input<typeof periodizationInputSchema>;

export type WeekType =
  | "DEVELOPMENT"
  | "PRE_TOURNAMENT"
  | "TOURNAMENT"
  | "INJURY_MODIFIED"
  | "PERIOD_END";

export type PeriodizationOutput = {
  weekType: WeekType;
  tillatTekniskeEndringer: boolean;
  pyramidOverride: Partial<Record<"FYS" | "TEK" | "SLAG" | "SPILL" | "TURN", number>> | null;
  begrensninger: string[];
};

export function runPeriodizationSkill(
  input: PeriodizationInput,
): PeriodizationOutput {
  const parsed = periodizationInputSchema.parse(input);
  const begrensninger: string[] = [];

  if (parsed.skadeAktiv) {
    return {
      weekType: "INJURY_MODIFIED",
      tillatTekniskeEndringer: false,
      pyramidOverride: { FYS: 40, TEK: 10, SLAG: 20, SPILL: 20, TURN: 10 },
      begrensninger: ["Skade aktiv — reduser volum og intensitet."],
    };
  }

  const dager = parsed.dagerTilTurnering;
  if (dager != null && dager <= 7) {
    return {
      weekType: "PRE_TOURNAMENT",
      tillatTekniskeEndringer: false,
      pyramidOverride: { FYS: 10, TEK: 10, SLAG: 25, SPILL: 35, TURN: 20 },
      begrensninger: [
        `Turnering om ${dager} dager — vedlikehold og scoring.`,
      ],
    };
  }

  if (parsed.periodType === "TURN") {
    begrensninger.push("Konkurranseperiode — ingen tekniske sving-endringer uten coach.");
    return {
      weekType: "TOURNAMENT",
      tillatTekniskeEndringer: false,
      pyramidOverride: { FYS: 10, TEK: 10, SLAG: 30, SPILL: 30, TURN: 20 },
      begrensninger,
    };
  }

  if (parsed.periodType === "HVILE" || parsed.periodType === "OVERGANG") {
    return {
      weekType: "PERIOD_END",
      tillatTekniskeEndringer: false,
      pyramidOverride: { FYS: 50, TEK: 10, SLAG: 15, SPILL: 15, TURN: 10 },
      begrensninger: ["Overgang/hvile — lav intensitet."],
    };
  }

  const andel = parsed.ukePosisjon / Math.max(parsed.totaleUker, 1);
  const tillatTekniskeEndringer =
    parsed.periodType === "GRUNN" || (parsed.periodType === "SPES" && andel < 0.5);

  return {
    weekType: "DEVELOPMENT",
    tillatTekniskeEndringer,
    pyramidOverride: null,
    begrensninger,
  };
}