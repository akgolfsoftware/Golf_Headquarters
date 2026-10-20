import { z } from "zod";
import { jsonObject } from "@/lib/workbench/wb-session-life";

export const LiveDrillProgressSchema = z.object({
  drillId: z.string().min(1).max(100),
  reps: z.number().int().min(0).max(5000),
  elapsedSec: z.number().int().min(0).max(43200).optional(),
  status: z.enum(["done", "active", "queued"]).optional(),
  kommentar: z.string().max(1000).optional(),
}).strict();
export const LiveProgressListSchema = z.array(LiveDrillProgressSchema).max(100);
export type LiveDrillProgress = z.infer<typeof LiveDrillProgressSchema>;
export const LiveReflectionSchema = z.object({ note: z.string().max(2000), shareWithCoach: z.boolean() }).strict();

/** Feltet følger den eksisterende øktraden; modellene slås ikke sammen. */
export function readPrecisionProgress(raw: unknown): LiveDrillProgress[] {
  const parsed = LiveProgressListSchema.safeParse(jsonObject(raw)?.precisionLive);
  return parsed.success ? parsed.data : [];
}

/** Bevarer gamle aggregater, men gjetter aldri reps/tid/treff. */
export function readPlanProgress(raw: unknown): LiveDrillProgress[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    const obj = jsonObject(entry);
    const parsed = LiveDrillProgressSchema.safeParse({
      drillId: obj?.drillId,
      reps: obj?.reps ?? obj?.repsTotal,
      ...(obj?.elapsedSec !== undefined ? { elapsedSec: obj.elapsedSec } : {}),
      ...(obj?.status !== undefined ? { status: obj.status } : {}),
      ...(typeof obj?.kommentar === "string" ? { kommentar: obj.kommentar } : typeof obj?.notes === "string" ? { kommentar: obj.notes } : {}),
    });
    return parsed.success ? [parsed.data] : [];
  });
}

export function readLiveReflection(raw: unknown, own: boolean) {
  const obj = jsonObject(raw);
  const saved = jsonObject(obj?.playerReflection);
  if (saved && (own || saved.shareWithCoach === true)) {
    return { note: typeof saved.note === "string" ? saved.note : "", shareWithCoach: saved.shareWithCoach === true };
  }
  const old = jsonObject(obj?.dineOrd);
  return { note: typeof old?.tekst === "string" ? old.tekst : "", shareWithCoach: typeof old?.tekst === "string" };
}
