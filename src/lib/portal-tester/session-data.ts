/**
 * TestSession.scoringData — ren (de)serialisering for live test-gjennomføring.
 *
 * Modellen (prisma/schema.prisma → TestSession) har ligget ubrukt til T5.
 * Kanonisk JSON-form defineres her, validert med zod safeParse ved lesing
 * (aldri `as unknown as`, jf. CLAUDE.md invariant 6):
 *
 *   { forsok: { [nr: string]: { [feltKey]: number | boolean | null } } }
 *
 * Nøkkelen er forsøksnummeret (1-basert, samme `nr` som ScorekortSpec/
 * scoringmotoren bruker) — sparsom record, kun førte forsøk lagres.
 * currentStepIndex er 0-indeksert «neste steg»: antall sammenhengende førte
 * forsøk fra forsøk 1 (samme prefiks-regel som lagringen håndhever).
 *
 * Ren modul: ingen "use server", ingen Prisma, ingen I/O — testes med node:test.
 */

import { z } from "zod";

export type StegVerdi = number | boolean | null;
export type StegVerdier = Record<string, StegVerdi>;
export type SessionScoring = { forsok: Record<string, StegVerdier> };

const StegVerdiSchema = z.union([z.number().finite(), z.boolean(), z.null()]);

export const SessionScoringSchema = z.object({
  forsok: z.record(
    z.string().regex(/^[1-9]\d*$/),
    z.record(z.string(), StegVerdiSchema),
  ),
});

/** Tolerant lesing av lagret scoringData. Ukjent/ugyldig → tom (aldri kast). */
export function parseSessionScoring(json: unknown): SessionScoring {
  const parsed = SessionScoringSchema.safeParse(json);
  return parsed.success ? parsed.data : { forsok: {} };
}

/** Har forsøket minst én reell verdi (null teller ikke som ført)? */
function erFort(verdier: StegVerdier | undefined): boolean {
  return verdier !== undefined && Object.values(verdier).some((v) => v !== null);
}

/**
 * Fletter inn verdiene for ETT steg (0-indeksert mot spec.forsok) og
 * returnerer ny scoringData. Kun null-verdier → steget fjernes (avregistrert).
 */
export function mergeSteg(
  data: SessionScoring,
  stegIndex: number,
  verdier: StegVerdier,
): SessionScoring {
  const nr = String(stegIndex + 1);
  const forsok = { ...data.forsok };
  if (erFort(verdier)) forsok[nr] = verdier;
  else delete forsok[nr];
  return { forsok };
}

/**
 * 0-indeksert «neste steg»: antall sammenhengende førte forsøk fra forsøk 1.
 * Hull i rekka stopper tellingen (samme prefiks-regel som fullføringen).
 */
export function beregnCurrentStepIndex(data: SessionScoring): number {
  let i = 0;
  while (erFort(data.forsok[String(i + 1)])) i++;
  return i;
}

/**
 * Lagret scoringData → scorekort-klientens rå felt-state:
 * tall → norsk streng (komma som desimalskille), boolean → boolean,
 * null utelates (uregistrert felt).
 */
export function tilScorekortState(
  data: SessionScoring,
): Record<number, Record<string, string | boolean>> {
  const ut: Record<number, Record<string, string | boolean>> = {};
  for (const [nrStr, verdier] of Object.entries(data.forsok)) {
    const rad: Record<string, string | boolean> = {};
    for (const [key, v] of Object.entries(verdier)) {
      if (v === null) continue;
      rad[key] = typeof v === "number" ? String(v).replace(".", ",") : v;
    }
    if (Object.keys(rad).length > 0) ut[Number(nrStr)] = rad;
  }
  return ut;
}
