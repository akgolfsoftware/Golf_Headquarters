"use client";

import { TnFeilkort, TnProvIgjen, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/**
 * Trenere og tilgang: uventet unntak. «Siste trener»-sperren er en gyldig
 * serverrespons og håndteres inline i TnTilgangSkjema, ikke her.
 */
export default function TilgangFeil({ reset }: { error: Error; reset: () => void }) {
  return (
    <TnSkallSkjelett>
      <TnFeilkort tittel="Trenerlisten kunne ikke hentes" tekst="Noe gikk uventet feil. Ingen tilganger er endret." handling={<TnProvIgjen onClick={reset} />} />
    </TnSkallSkjelett>
  );
}
