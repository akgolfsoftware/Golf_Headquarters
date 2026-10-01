import { z } from "zod";
import { AkFormelSchema } from "@/lib/domain/workbench/schemas";
const count = z.number().int().min(0).max(100000);
export const FysResultSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("styrke"), sett: z.array(z.object({ vekt: z.number().min(0).max(1000), reps: count.min(1), rir: z.number().int().min(0).max(4).optional() })).min(1).max(20), notat: z.string().max(4000) }),
  z.object({ type: z.literal("kondisjon"), minutter: z.number().int().min(0).max(180), sone: z.enum(["S1", "S2", "S3", "S4", "S5"]), notat: z.string().max(4000) }),
  z.object({ type: z.literal("hold"), sekunder: count.max(300), notat: z.string().max(4000) }),
  z.object({ type: z.literal("reps"), repetisjoner: count.max(200), notat: z.string().max(4000) }),
]);
export const GolfResultSchema = z.object({ type: z.literal("golf"), repsWithoutBall: count, repsLowSpeed: count, repsAutomatic: count, repsHit: count, notat: z.string().max(4000) });
const physicalAmount = z.number().min(0).nullable();
export const V2PhysicalDoseSchema = z.object({
  fysTreningstype: z.string().nullable(), fysSett: physicalAmount, fysReps: physicalAmount,
  fysVektKg: physicalAmount, fysPauseSek: physicalAmount, fysVarighetMin: physicalAmount,
  fysIntensitetsSone: physicalAmount, fysDistanseM: physicalAmount,
  fysBevegelighetType: z.string().nullable(),
  fysHoldSek: physicalAmount, fysTempo: z.string().nullable(), fysAktivitet: z.string().nullable(),
});
export const DrillResultSchema = z.object({
  drillId: z.string().min(1), result: z.union([GolfResultSchema, FysResultSchema]),
  actualDurationSec: z.number().int().min(0).max(86400).nullable(), loggedAt: z.string().datetime(),
  source: z.object({ belastning: z.string().nullable().optional(), repetitions: count.nullable().optional(), physicalDose: V2PhysicalDoseSchema.optional(), pyramid: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]), planRevision: z.string(), sourceId: z.string().nullable(), sourceRevision: z.string().nullable(), positionTaskId: z.string().nullable(), exerciseId: z.string().nullable(), title: z.string(), akFormel: AkFormelSchema.nullable(), repType: z.string().nullable(), repAntall: count.nullable(), repMinutter: count.nullable(), repSett: count.nullable(), repReps: count.nullable(), durationMinutes: count }),
});
export const DrillResultsSchema = z.array(DrillResultSchema).max(100);
export type DrillResult = z.infer<typeof DrillResultSchema>;
/** Ukjent lagringsformat gir ingen oppdiktede målinger. */
export function readDrillResults(snapshot: unknown): DrillResult[] {
  if (!snapshot || typeof snapshot !== "object" || !("drillResults" in snapshot)) return [];
  const parsed = DrillResultsSchema.safeParse(snapshot.drillResults);
  return parsed.success ? parsed.data : [];
}
export function golfResultCount(r: DrillResult["result"]): number { return r.type === "golf" ? r.repsWithoutBall + r.repsLowSpeed + r.repsAutomatic + r.repsHit : 0; }
export function technicalCounts(r: z.infer<typeof GolfResultSchema>) { return { dry: r.repsWithoutBall, lav: r.repsLowSpeed, full: r.repsAutomatic + r.repsHit }; }

/** Ferdigmarkering er egen informasjon, uavhengig av registrert resultat. */
export function readCompletedDrillIds(snapshot: unknown): string[] {
  if (!snapshot || typeof snapshot !== "object" || !("completedDrillIds" in snapshot)) return [];
  const parsed = z.array(z.string().min(1)).max(100).safeParse(snapshot.completedDrillIds);
  return parsed.success ? [...new Set(parsed.data)] : [];
}
