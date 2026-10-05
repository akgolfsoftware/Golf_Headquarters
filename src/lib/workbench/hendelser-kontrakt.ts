import { z } from "zod";
import { gyldigPlanDato } from "./plan-kontekst";
const dato = z.string().refine(v => Boolean(gyldigPlanDato(v)), "Ugyldig kalenderdato.");
export const HendelseInputSchema = z.object({
  playerId: z.string().min(1).max(200), id: z.string().min(1).max(200).optional(), expectedUpdatedAt: z.string().datetime().optional(),
  title: z.string().trim().min(1).max(120), kind: z.enum(["SKOLE", "REISE", "SAMLING", "HELDAGSSAMLING", "TEST", "AVTALE", "ANNET"]),
  startDate: dato, startMinute: z.number().int().min(0).max(1439), endDate: dato, endMinute: z.number().int().min(0).max(1439),
  recurring: z.enum(["NONE", "WEEKLY"]), isPrivate: z.boolean(), note: z.string().trim().max(500).nullable(),
}).strict().refine(v => !v.id || Boolean(v.expectedUpdatedAt), "Oppdatering krever sist kjente lagringstid.");
export type HendelseInput = z.infer<typeof HendelseInputSchema>;
const oslo = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
/** Avvis manglende/tvetydige klokkeslett ved sommertid; aldri flytt tidspunktet i stillhet. */
export function osloHendelseTid(dato: string, minutt: number): Date {
  const wanted = `${dato} ${String(Math.floor(minutt / 60)).padStart(2, "0")}:${String(minutt % 60).padStart(2, "0")}`;
  const wall = Date.parse(`${dato}T00:00:00Z`) + minutt * 60000;
  const matches: Date[] = [];
  for (const offset of [60, 120]) { const d = new Date(wall - offset * 60000); if (oslo.format(d) === wanted) matches.push(d); }
  if (matches.length !== 1) throw new Error("Klokkeslettet er manglende eller tvetydig ved sommertid. Velg et annet klokkeslett.");
  return matches[0];
}
