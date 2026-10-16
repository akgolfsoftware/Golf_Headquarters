import { z } from "zod";

export const WorkbenchPlanStatusSchema = z.enum([
  "DRAFT",
  "PARTIAL",
  "PUBLISHED",
  "CHANGED_AFTER_PUBLISH",
  "WITHDRAWN",
  "ARCHIVED",
]);

export const PhysicalSessionTypeSchema = z.enum(["STYRKE", "KONDISJON", "MOBILITET", "TEST"]);
export const TournamentFocusSchema = z.enum(["TRENING", "UTVIKLING", "PRESTASJON"]);
export const ConflictTypeSchema = z.enum([
  "REISE",
  "SKOLE",
  "TURNERING",
  "TESTUKE",
  "BELASTNING",
  "DOBBELBOOKING",
]);
export const ConflictSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const ConflictResolutionStatusSchema = z.enum(["OPEN", "ACCEPTED", "MOVED", "DISMISSED"]);

export const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig dato");

export const PhysicalExerciseLogSchema = z.object({
  setNumber: z.number().int().min(1).max(20),
  reps: z.number().int().min(0).max(200).nullable().optional(),
  weightKg: z.number().min(0).max(500).nullable().optional(),
  rir: z.number().int().min(0).max(10).nullable().optional(),
});

export const PhysicalExerciseSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  setsTarget: z.number().int().min(1).max(20).nullable().optional(),
  repsMin: z.number().int().min(1).max(200).nullable().optional(),
  repsMax: z.number().int().min(1).max(200).nullable().optional(),
  weightKg: z.number().min(0).max(500).nullable().optional(),
  rirTarget: z.number().int().min(0).max(10).nullable().optional(),
  logs: z.array(PhysicalExerciseLogSchema).default([]),
});

export const PhysicalSessionSchema = z.object({
  id: z.string().min(1).optional(),
  date: IsoDateSchema,
  title: z.string().min(1),
  status: WorkbenchPlanStatusSchema.or(z.enum(["COMPLETED", "SKIPPED"])),
  type: PhysicalSessionTypeSchema,
  durationMinutes: z.number().int().min(1).max(720).nullable().optional(),
  perceivedEffort: z.number().int().min(1).max(10).nullable().optional(),
  readiness: z.number().int().min(1).max(10).nullable().optional(),
  exercises: z.array(PhysicalExerciseSchema),
});

export const TournamentRoundSchema = z.object({
  roundNumber: z.number().int().min(1).max(8),
  date: IsoDateSchema,
  teeTimeMinutes: z.number().int().min(0).max(1439).nullable().optional(),
  grossScore: z.number().int().min(40).max(140).nullable().optional(),
  strokesGained: z.number().min(-30).max(30).nullable().optional(),
  source: z.string().min(1).nullable().optional(),
  sourceDate: z.string().datetime().nullable().optional(),
});

export const TournamentPlanSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  status: WorkbenchPlanStatusSchema,
  focus: TournamentFocusSchema,
  startDate: IsoDateSchema,
  endDate: IsoDateSchema,
  travelStartDate: IsoDateSchema.nullable().optional(),
  travelEndDate: IsoDateSchema.nullable().optional(),
  rounds: z.array(TournamentRoundSchema).default([]),
});

export type WorkbenchPlanStatus = z.infer<typeof WorkbenchPlanStatusSchema>;
export type PhysicalExerciseLog = z.infer<typeof PhysicalExerciseLogSchema>;
export type PhysicalExercise = z.infer<typeof PhysicalExerciseSchema>;
export type PhysicalSession = z.infer<typeof PhysicalSessionSchema>;
export type TournamentPlan = z.infer<typeof TournamentPlanSchema>;

export function calculateExerciseTonnage(logs: PhysicalExerciseLog[]): number {
  return logs.reduce((sum, log) => {
    const reps = log.reps ?? 0;
    const weight = log.weightKg ?? 0;
    return sum + reps * weight;
  }, 0);
}

export function calculateSessionTonnage(session: Pick<PhysicalSession, "exercises">): number {
  return session.exercises.reduce((sum, exercise) => sum + calculateExerciseTonnage(exercise.logs), 0);
}

export function calculateSessionLoad(
  session: Pick<PhysicalSession, "durationMinutes" | "perceivedEffort">,
): number | null {
  if (!session.durationMinutes || !session.perceivedEffort) return null;
  return session.durationMinutes * session.perceivedEffort;
}

export function hasChangedAfterPublish(status: WorkbenchPlanStatus, publishedAt: Date | string | null | undefined): boolean {
  return Boolean(publishedAt && status === "CHANGED_AFTER_PUBLISH");
}

function dayNumber(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00.000Z`) / 86_400_000;
}

export function dateRangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return dayNumber(aStart) <= dayNumber(bEnd) && dayNumber(bStart) <= dayNumber(aEnd);
}

export function tournamentHasTravelOnDate(plan: Pick<TournamentPlan, "travelStartDate" | "travelEndDate">, isoDate: string): boolean {
  if (!plan.travelStartDate || !plan.travelEndDate) return false;
  return dateRangesOverlap(plan.travelStartDate, plan.travelEndDate, isoDate, isoDate);
}

export function tournamentHasRoundOnDate(plan: Pick<TournamentPlan, "rounds">, isoDate: string): boolean {
  return plan.rounds.some((round) => round.date === isoDate);
}

