import { z } from "zod";
import type { WeekPlanData } from "@/lib/domain/workbench/types";

// Valgt kilde 02.10.2026: workbench-samlet/x09.js. Legacy WeekType beholdes.
export const UKEPLAN_TYPER = [
  { id: "grunn", navn: "Grunnuke" },
  { id: "spesial", navn: "Spesialuke" },
  { id: "tmed", navn: "Turneringsuke med konkurranse" },
  { id: "tuten", navn: "Turneringsuke uten konkurranse" },
] as const;
export const UKEPLAN_OMRADER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export const UKEPLAN_PRIORITETER = ["UTVIKLE", "VEDLIKEHOLDE", "REDUSERE"] as const;

const AntallSchema = z.number().finite().int().min(0).max(2_147_483_647);
const TimerSchema = z.number().finite().min(0);
const OmradeSchema = z.object({
  priority: z.enum(UKEPLAN_PRIORITETER).nullable(),
  focus: z.string().trim().max(2000).nullable(),
  sessionBudget: AntallSchema.nullable(),
}).strict();

export const WeekPlanningDetailsSchema = z.object({
  version: z.literal(1),
  weekType: z.enum(["grunn", "spesial", "tmed", "tuten"]).nullable(),
  location: z.string().trim().max(300).nullable(),
  areas: z.object({
    FYS: OmradeSchema, TEK: OmradeSchema, SLAG: OmradeSchema,
    SPILL: OmradeSchema, TURN: OmradeSchema,
  }).strict(),
}).strict();

export type WeekPlanningDetails = z.infer<typeof WeekPlanningDetailsSchema>;

export function tommeUkeplandetaljer(): WeekPlanningDetails {
  const tomt = () => ({ priority: null, focus: null, sessionBudget: null });
  return {
    version: 1, weekType: null, location: null,
    areas: { FYS: tomt(), TEK: tomt(), SLAG: tomt(), SPILL: tomt(), TURN: tomt() },
  };
}

/** ISO-ukeåret bestemmes av torsdag, også når mandagen ligger i forrige år. */
export function isoUkeIdentitet(isoDate: string): { isoYear: number; weekNumber: number } {
  const torsdag = new Date(`${isoDate}T12:00:00Z`);
  torsdag.setUTCDate(torsdag.getUTCDate() + 4 - (torsdag.getUTCDay() || 7));
  torsdag.setUTCHours(0, 0, 0, 0);
  const isoYear = torsdag.getUTCFullYear();
  const weekNumber = Math.ceil(((torsdag.getTime() - Date.UTC(isoYear, 0, 1)) / 86_400_000 + 1) / 7);
  return { isoYear, weekNumber };
}

export function isoUkeMandag(isoYear: number, weekNumber: number): string {
  const dato = new Date(Date.UTC(isoYear, 0, 4, 12));
  dato.setUTCDate(dato.getUTCDate() - ((dato.getUTCDay() + 6) % 7) + (weekNumber - 1) * 7);
  return dato.toISOString().slice(0, 10);
}

const ukeIdentitet = {
  playerId: z.string().trim().min(1).max(200),
  isoYear: z.number().int().min(1900).max(9998),
  weekNumber: z.number().int().min(1).max(53),
};
const ukeFelter = {
  seasonPlanId: z.string().trim().min(1).max(200).nullable().optional(),
  weekType: z.enum(["UTVIKLING", "VEDLIKEHOLD", "TURNERING"]).optional(),
  notes: z.array(z.enum(["FERIE", "TEST", "SAMLING", "EVALUERING", "PRE_TURNERING", "TEKNIKK_UKE"])).max(6).optional(),
  plannedHoursFys: TimerSchema.nullable().optional(),
  plannedHoursTek: TimerSchema.nullable().optional(),
  plannedHoursSlag: TimerSchema.nullable().optional(),
  plannedHoursSpill: TimerSchema.nullable().optional(),
  plannedHoursTurn: TimerSchema.nullable().optional(),
  repTargetDry: AntallSchema.nullable().optional(),
  repTargetLowSpeed: AntallSchema.nullable().optional(),
  repTargetFullSpeed: AntallSchema.nullable().optional(),
  repTargetPutting: AntallSchema.nullable().optional(),
  repTargetShortGame: AntallSchema.nullable().optional(),
  loadCeiling: AntallSchema.nullable().optional(),
  customNotes: z.string().trim().max(10_000).nullable().optional(),
  planningDetails: WeekPlanningDetailsSchema.nullable().optional(),
};

function gyldigIsoUke(value: { isoYear: number; weekNumber: number }): boolean {
  const actual = isoUkeIdentitet(isoUkeMandag(value.isoYear, value.weekNumber));
  return actual.isoYear === value.isoYear && actual.weekNumber === value.weekNumber;
}

export const WeekPlanFieldsSchema = z.object(ukeFelter).strict();
export const SaveWeekPlanInputSchema = WeekPlanFieldsSchema.extend(ukeIdentitet).strict()
  .refine(gyldigIsoUke, { message: "Uken finnes ikke i dette ISO-ukeåret.", path: ["weekNumber"] });

export type ValidatedSaveWeekPlanInput = z.infer<typeof SaveWeekPlanInputSchema>;

const WeekPlanReadSchema = z.object({
  ...ukeIdentitet, ...ukeFelter,
  id: z.string().min(1),
  weekType: z.enum(["UTVIKLING", "VEDLIKEHOLD", "TURNERING"]),
  notes: z.array(z.enum(["FERIE", "TEST", "SAMLING", "EVALUERING", "PRE_TURNERING", "TEKNIKK_UKE"])),
  repetitionTargets: z.record(z.string(), z.unknown()).nullable().optional(),
}).refine(gyldigIsoUke);

/** Samme lesekontrakt for uke, lagringssvar og autorisert trenerprofil. */
export function parseWeekPlanData(row: unknown): WeekPlanData | null {
  const parsed = WeekPlanReadSchema.safeParse(row);
  return parsed.success ? parsed.data : null;
}
