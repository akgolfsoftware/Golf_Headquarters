import { z } from "zod";
import { IsoDateSchema } from "@/lib/domain/workbench/schemas";
import { addDays, mondayOf } from "@/lib/domain/workbench/operations";
import { WeekPlanFieldsSchema } from "./ukeplan-schema";
import type { WeekPlanData } from "@/lib/domain/workbench/types";

export const SyklusMandagSchema = IsoDateSchema.refine(value => mondayOf(value) === value, "Velg en mandag.");
const SnapshotSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const LesSyklusSchema = z.object({ playerId: z.string().min(1).max(200), anchorWeek: SyklusMandagSchema, targetWeek: SyklusMandagSchema.optional() }).strict();
export const LagreSyklusSchema = LesSyklusSchema.omit({ targetWeek: true }).extend({
  requestId: z.string().uuid(), weeks: z.tuple([z.object({ expected: SnapshotSchema, fields: WeekPlanFieldsSchema }).strict(), z.object({ expected: SnapshotSchema, fields: WeekPlanFieldsSchema }).strict(), z.object({ expected: SnapshotSchema, fields: WeekPlanFieldsSchema }).strict()]),
}).strict();
export const KopierSyklusSchema = LesSyklusSchema.required({ targetWeek: true }).extend({
  requestId: z.string().uuid(), sourceExpected: z.tuple([SnapshotSchema, SnapshotSchema, SnapshotSchema]),
  targetExpected: z.tuple([SnapshotSchema, SnapshotSchema, SnapshotSchema]), confirmedFilledTargets: z.boolean(),
}).strict().refine(value => !syklusUker(value.anchorWeek).some(week => syklusUker(value.targetWeek).includes(week)), "Kilde og mål kan ikke overlappe.");
export const OpplosSyklusSchema = LesSyklusSchema.omit({ targetWeek: true }).extend({ expected: z.tuple([SnapshotSchema, SnapshotSchema, SnapshotSchema]) }).strict();
export type LagreSyklusInput = z.infer<typeof LagreSyklusSchema>;
export type KopierSyklusInput = z.infer<typeof KopierSyklusSchema>;
export function syklusUker(mandag: string): [string, string, string] { return [mandag, addDays(mandag, 7), addDays(mandag, 14)]; }
export type SyklusUke = { weekStart: string; expected: string; plan: WeekPlanData | null; sessions: { id: string; title: string; date: string; status: string }[]; excludedSessions: number };
export type TreukerssyklusData = { weeks: [SyklusUke, SyklusUke, SyklusUke]; targets?: [SyklusUke, SyklusUke, SyklusUke] };
export function syklusPlanfelter(plan: WeekPlanData | null): z.infer<typeof WeekPlanFieldsSchema> {
  if (!plan) return {};
  // Bare planfelter. ISO-nøkler, sesong, frie legacy-repTargets og historikk kopieres ikke.
  return WeekPlanFieldsSchema.parse({ weekType: plan.weekType, notes: plan.notes,
    plannedHoursFys: plan.plannedHoursFys, plannedHoursTek: plan.plannedHoursTek, plannedHoursSlag: plan.plannedHoursSlag, plannedHoursSpill: plan.plannedHoursSpill, plannedHoursTurn: plan.plannedHoursTurn,
    repTargetDry: plan.repTargetDry, repTargetLowSpeed: plan.repTargetLowSpeed, repTargetFullSpeed: plan.repTargetFullSpeed, repTargetPutting: plan.repTargetPutting, repTargetShortGame: plan.repTargetShortGame,
    loadCeiling: plan.loadCeiling, customNotes: plan.customNotes, planningDetails: plan.planningDetails ? { ...plan.planningDetails, cycle: undefined } : plan.planningDetails,
  });
}
