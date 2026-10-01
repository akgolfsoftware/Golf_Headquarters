import { z } from "zod";
const amount = z.number().nullable();
export const PhysicalResultNoteSchema = z.object({
  kind: z.literal("FYS_RESULT_V1"), note: z.string().nullable(),
  source: z.object({ id: z.string(), revision: z.string().datetime(), sessionId: z.string(), pyramid: z.literal("FYS"), title: z.string(), setsTarget: amount, repsMin: amount, repsMax: amount, weightKg: amount, rirTarget: amount, restSeconds: amount }).nullable(),
});
/** Historisk fritekst blir beholdt uten konstruert revisjon eller dose. */
export function readPhysicalResultNote(value: string | null) {
  try { const p = PhysicalResultNoteSchema.safeParse(JSON.parse(value ?? "null")); return p.success ? p.data : null; } catch { return null; }
}
