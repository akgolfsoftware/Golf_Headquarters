import { z } from "zod";
import { gyldigPlanDato } from "./plan-kontekst";

const dato = z.string().refine(v => Boolean(gyldigPlanDato(v)), "Ugyldig kalenderdato.");
const tekst = (max: number) => z.string().trim().max(max).nullable();
export const TurneringsMetadataSchema = z.object({
  tour: tekst(120), country: tekst(120), location: tekst(160),
  holes: z.union([z.literal(9), z.literal(18)]).nullable(),
  priority: z.enum(["MAJOR", "NORMAL", "LOCAL"]).nullable(),
  wagrPower: z.number().finite().nonnegative().nullable(),
  wagrSourceYear: z.number().int().min(1900).max(9998).nullable(),
  wagrSource: tekst(500),
}).strict().refine(v => v.wagrPower === null || (v.wagrSourceYear !== null && Boolean(v.wagrSource)),
  "WAGR Power krever kildeår og kilde. Verdien er historisk og er ikke DG-feltstyrke.");
export const TurneringsplanInputSchema = z.object({
  playerId: z.string().min(1).max(200), id: z.string().min(1).max(200).optional(),
  expectedUpdatedAt: z.string().datetime().optional(),
  title: z.string().trim().min(1).max(120), focus: z.enum(["TRENING", "UTVIKLING", "PRESTASJON"]),
  startDate: dato, endDate: dato,
  travelStartDate: dato.nullable(), travelEndDate: dato.nullable(),
  metadata: TurneringsMetadataSchema,
  rounds: z.array(z.object({ id: z.string().min(1).max(200).optional(), date: dato,
    teeTimeMinutes: z.number().int().min(0).max(1439).nullable() }).strict()).min(1).max(8),
}).strict().superRefine((v, ctx) => {
  const feil = (message: string) => ctx.addIssue({ code: "custom", message });
  if (v.id && !v.expectedUpdatedAt) feil("Oppdatering krever sist kjente lagringstid.");
  if (v.endDate < v.startDate) feil("Sluttdato må være på eller etter startdato.");
  if (Boolean(v.travelStartDate) !== Boolean(v.travelEndDate)) feil("Reise krever både fra- og til-dato.");
  if (v.travelStartDate && v.travelEndDate && v.travelEndDate < v.travelStartDate) feil("Reiseslutt må være på eller etter reisestart.");
  if (v.rounds.some(r => r.date < v.startDate || r.date > v.endDate)) feil("Alle rundedatoer må ligge innen turneringsdatoene.");
  const ids = v.rounds.flatMap(r => r.id ? [r.id] : []);
  if (new Set(ids).size !== ids.length) feil("En runde kan bare forekomme én gang.");
});
export type TurneringsplanInput = z.infer<typeof TurneringsplanInputSchema>;
export const tomTurneringsmetadata = () => ({ tour: null, country: null, location: null, holes: null, priority: null,
  wagrPower: null, wagrSourceYear: null, wagrSource: null } as z.infer<typeof TurneringsMetadataSchema>);
