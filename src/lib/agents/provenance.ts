// Felles form for "hvorfor foreslo agenten dette" — skrives til Signal.provenance
// og PlanAction.provenance. Strukturert i stedet for fritekst, slik at
// AgencyOS kan vise coachen kilden bak et forslag før hen godkjenner det.

import { z } from "zod";

export const provenanceKildeSchema = z.enum([
  "RUNDER",
  "TRACKMAN",
  "TESTER",
  "PLAN",
  "PAMELDING",
  "INNLOGGING",
]);
export type ProvenanceKilde = z.infer<typeof provenanceKildeSchema>;

export const provenanceRadSchema = z.object({
  id: z.string(),
  dato: z.string(),
});
export type ProvenanceRad = z.infer<typeof provenanceRadSchema>;

export const provenanceSchema = z.object({
  kilde: provenanceKildeSchema,
  rader: z.array(provenanceRadSchema),
  regel: z.string(),
  terskel: z.number().optional(),
  maaltVerdi: z.number().optional(),
  tidsvindu: z
    .object({
      fra: z.string(),
      til: z.string(),
    })
    .optional(),
});
export type Provenance = z.infer<typeof provenanceSchema>;

/**
 * Bygg en provenance-struktur fra agentens rådata. Kaster ikke — ugyldig
 * input gir `undefined` slik at et Signal/PlanAction fortsatt skrives uten
 * provenance fremfor å feile hele agent-kjøringen.
 */
export function byggProvenance(input: {
  kilde: ProvenanceKilde;
  rader: ProvenanceRad[];
  regel: string;
  terskel?: number;
  maaltVerdi?: number;
  tidsvindu?: { fra: Date | string; til: Date | string };
}): Provenance | undefined {
  const parsed = provenanceSchema.safeParse({
    kilde: input.kilde,
    rader: input.rader,
    regel: input.regel,
    terskel: input.terskel,
    maaltVerdi: input.maaltVerdi,
    tidsvindu: input.tidsvindu
      ? {
          fra: new Date(input.tidsvindu.fra).toISOString(),
          til: new Date(input.tidsvindu.til).toISOString(),
        }
      : undefined,
  });
  return parsed.success ? parsed.data : undefined;
}
