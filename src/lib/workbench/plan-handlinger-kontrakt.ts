import { z } from "zod";
import { gyldigPlanDato } from "./plan-kontekst";
import { addDays } from "@/lib/domain/workbench/operations";
const dato = z.string().refine(v => Boolean(gyldigPlanDato(v)), "Ugyldig kalenderdato.");
const basis = { playerId: z.string().min(1).max(200), sessionId: z.string().min(1).max(200), expectedUpdatedAt: z.string().datetime() };
export const FlyttPlanOktSchema = z.object({ ...basis, date: dato, startMinute: z.number().int().min(0).max(1439), durationMinutes: z.number().int().min(1).max(600) }).strict()
  .refine(v => v.startMinute + v.durationMinutes <= 1440, "Økten må avsluttes innen samme kalenderdag.");
export const KopierPlanOktSchema = z.object({ ...basis, dates: z.array(dato).min(1).max(52), startMinute: z.number().int().min(0).max(1439) }).strict()
  .refine(v => new Set(v.dates).size === v.dates.length, "Samme dato kan bare velges én gang.");
export type FlyttPlanOktInput = z.infer<typeof FlyttPlanOktSchema>;
export type KopierPlanOktInput = z.infer<typeof KopierPlanOktSchema>;
export function gjentakelsesDatoer(fra: string, antall: number, hverUke = 1): string[] {
  if (!gyldigPlanDato(fra) || !Number.isInteger(antall) || antall < 1 || antall > 52 || !Number.isInteger(hverUke) || hverUke < 1 || hverUke > 12) throw new Error("Ugyldig gjentakelse.");
  return Array.from({ length: antall }, (_, i) => addDays(fra, i * 7 * hverUke));
}
