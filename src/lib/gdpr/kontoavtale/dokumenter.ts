import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";

const Dokument = z.object({
  versjon: z.string().min(1).max(80),
  // Full, frosset dokumenttekst som også må vises i den kommende brukerreisen.
  tekst: z.string().min(1).max(100_000),
}).strict();
export const KontoAvtalePakkeSchema = z.object({
  versjon: z.string().min(1).max(80),
  vilkar: Dokument,
  personvern: Dokument,
  bekreftelse: z.object({ vilkar: z.string().min(1), personvern: z.string().min(1) }).strict(),
}).strict();
export type KontoAvtalePakke = z.infer<typeof KontoAvtalePakkeSchema>;

/**
 * Ingen godkjent pakke ennå. De offentlige sidene er utkast og importeres ikke.
 * Aktivering krever dokumentert godkjenning og en brukerreise som viser nøyaktig
 * denne pakken før bekreftelse. Nye tekster MÅ få ny versjon, også etter små rettinger.
 * Ingen miljøvariabel, klientparameter eller gammelt preferences-flagg kan aktivere dette.
 */
export function hentGjeldendeKontoAvtale(): KontoAvtalePakke | null {
  return null;
}

/** Fast feltrekkefølge gir samme kontrollsum uavhengig av innkommende nøkkelrekkefølge. */
export function frysKontoAvtale(input: KontoAvtalePakke) {
  const pakke = KontoAvtalePakkeSchema.parse(input);
  const dokumenter = {
    versjon: pakke.versjon,
    vilkar: { versjon: pakke.vilkar.versjon, tekst: pakke.vilkar.tekst },
    personvern: { versjon: pakke.personvern.versjon, tekst: pakke.personvern.tekst },
    bekreftelse: { vilkar: pakke.bekreftelse.vilkar, personvern: pakke.bekreftelse.personvern },
  };
  return { dokumenter, dokumentHash: createHash("sha256").update(JSON.stringify(dokumenter), "utf8").digest("hex") };
}
