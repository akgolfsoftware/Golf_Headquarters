"use server";

import { getCurrentUserRaw as getCurrentUser } from "@/lib/auth/getCurrentUser";
import { registrerEgenKontoAvtale } from "@/lib/gdpr/kontoavtale/register";

/** Ikke koblet til skjerm før godkjent dokumentpakke og fullført brukerreise. */
export async function bekreftEgenKontoAvtale(input: unknown) {
  const bruker = await getCurrentUser();
  if (!bruker) return { ok: false as const, feil: "Du må logge inn for å bekrefte." };
  return registrerEgenKontoAvtale(bruker.id, input);
}
