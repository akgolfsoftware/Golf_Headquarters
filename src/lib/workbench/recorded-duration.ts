import { z } from "zod";
const seconds = z.number().int().min(0).max(604800);
/** Kun eksplisitt lagret tid. Kalenderintervallet og planvarigheten er aldri faktisk tid. */
export function recordedCompletionMinutes(value: unknown, model: "plan" | "v2"): number | null {
  const parsed = model === "v2"
    ? z.object({ liveSummary: z.object({ durationSec: seconds }) }).safeParse(value)
    : z.object({ totalSec: seconds }).safeParse(value);
  if (!parsed.success) return null;
  const data = parsed.data;
  return ("liveSummary" in data ? data.liveSummary.durationSec : data.totalSec) / 60;
}
/** Tidspunkt fra serverens ferdigkvittering, ikke planens klokkeslett. */
export function recordedCompletionAt(value: unknown, model: "plan" | "v2"): Date | null {
  const parsed = model === "v2"
    ? z.object({ liveSummary: z.object({ completedAt: z.iso.datetime() }) }).safeParse(value)
    : z.object({ updatedAtISO: z.iso.datetime(), execution: z.object({ phase: z.literal("COMPLETED") }) }).safeParse(value);
  if (!parsed.success) return null;
  return new Date("liveSummary" in parsed.data ? parsed.data.liveSummary.completedAt : parsed.data.updatedAtISO);
}
