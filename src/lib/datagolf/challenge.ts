import { z } from "zod";
import { STASJON_SLAG } from "./stasjon";

export const utfordringInput = z.object({
  attemptId: z.string().uuid(), tak: z.number().int().positive(),
  slag: z.string().refine(v => STASJON_SLAG.some(s => s.id === v)),
  carry: z.number().finite().positive().max(400).nullable(),
  lie: z.enum(["fairway", "rough"]),
  baller: z.array(z.enum(["inne", "ute"])).length(10),
  startedAt: z.string().datetime(),
  // Referansen må ikke endres stille mellom visning og lagring.
  target: z.number().finite().nullable(),
});
export type UtfordringInput = z.infer<typeof utfordringInput>;
export const utfordringResultat = z.object({
  version: z.literal(1), tak: z.number().int(), name: z.string(), slag: z.string(),
  carry: z.number().nullable(), lie: z.enum(["fairway", "rough"]),
  target: z.number().nullable(), unit: z.string().nullable(), source: z.string(),
  sourceText: z.string(), inne: z.number().int().min(0).max(10), total: z.literal(10),
  completedAt: z.string().datetime(),
});
export type UtfordringResultat = z.infer<typeof utfordringResultat>;
export function lesUtfordring(raw: unknown): UtfordringResultat | null {
  if (!Array.isArray(raw)) return null;
  const parsed = utfordringResultat.safeParse(raw[0]?.datagolf);
  return parsed.success ? parsed.data : null;
}
export function gyldigStart(start: string, now: Date): boolean {
  const elapsed = now.getTime() - new Date(start).getTime();
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed <= 24 * 60 * 60 * 1000;
}
