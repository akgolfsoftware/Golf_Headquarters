import { z } from "zod";
import { OMRAADE_KODER, type OmraadeKode } from "./ak-formel-v2";

export const MONTH_AXES = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export const MONTH_PRIORITIES = ["UTVIKLE", "VEDLIKEHOLDE", "REDUSERE"] as const;
export const MonthOwnerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("player"), playerId: z.string().trim().min(1).max(200) }).strict(),
  z.object({ kind: z.literal("group"), groupId: z.string().trim().min(1).max(200) }).strict(),
]);
export type MonthOwner = z.infer<typeof MonthOwnerSchema>;
const hours = z.number().finite().min(0).max(744).nullable();
export const MonthDetailsSchema = z.object({
  version: z.literal(1), focus: z.string().trim().max(80),
  goals: z.array(z.string().trim().min(1).max(400)).max(20),
  purpose: z.string().trim().max(1000), location: z.string().trim().max(300), note: z.string().trim().max(1000),
  volumeHours: z.object({ FYS: hours, TEK: hours, SLAG: hours, SPILL: hours, TURN: hours }).strict(),
  priorities: z.record(z.enum(OMRAADE_KODER), z.enum(MONTH_PRIORITIES).nullable()),
}).strict();
export type MonthDetails = z.infer<typeof MonthDetailsSchema>;
export const MonthEvaluationSchema = z.object({
  score: z.number().int().min(1).max(5).nullable(), text: z.string().trim().max(600),
  authorId: z.string().min(1).max(200), savedAt: z.string().datetime(),
}).strict();
export type MonthEvaluation = z.infer<typeof MonthEvaluationSchema>;
export const MonthKeySchema = z.object({ owner: MonthOwnerSchema, year: z.number().int().min(1900).max(9998), month: z.number().int().min(1).max(12) }).strict();
export type MonthKey = z.infer<typeof MonthKeySchema>;
const changeKey = {
  owner: MonthOwnerSchema, year: z.number().int().min(1900).max(9998), month: z.number().int().min(1).max(12),
  expectedRevision: z.number().int().min(0), requestId: z.string().uuid(),
};
export const SaveMonthSchema = z.object({ ...changeKey, details: MonthDetailsSchema }).strict();
export const ReplyMonthSchema = z.object({ ...changeKey, accept: z.boolean() }).strict();
export const EvaluateMonthSchema = z.object({ ...changeKey, score: z.number().int().min(1).max(5).nullable(), text: z.string().trim().max(600) }).strict().refine(value => value.score !== null || value.text.length > 0);

export function emptyMonthDetails(): MonthDetails {
  return { version: 1, focus: "", goals: [], purpose: "", location: "", note: "",
    volumeHours: { FYS: null, TEK: null, SLAG: null, SPILL: null, TURN: null },
    priorities: Object.fromEntries(OMRAADE_KODER.map((area) => [area, null])) as Record<OmraadeKode, null>,
  };
}
export function monthEnded(year: number, month: number, today: string): boolean {
  return today >= new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
}
export type MonthPlanView = {
  owner: MonthOwner; year: number; month: number; id: string | null; revision: number; activeRevision: number;
  details: MonthDetails | null; proposedDetails: MonthDetails | null; proposalStale: boolean;
  playerEvaluation: MonthEvaluation | null; coachEvaluation: MonthEvaluation | null;
  canEdit: boolean; canPropose: boolean; canRespond: boolean; evaluationRole: "spiller" | "coach" | null; ended: boolean;
};
export type MonthResult = { ok: true; data: MonthPlanView } | { ok: false; error: string };
