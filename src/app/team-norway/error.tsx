"use client";

import { TnFeilkort, TnProvIgjen, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Feiltilstand for Team Norway. Feildetaljer vises ikke på den interne flaten. */
export default function TeamNorwayError({ reset }: { error: Error; reset: () => void }) {
  return (
    <TnSkallSkjelett>
      <TnFeilkort tittel="Siden kunne ikke hentes" tekst="Tilgangen kunne ikke kontrolleres akkurat nå. Ingen gruppeopplysninger vises, og ingenting er endret." handling={<TnProvIgjen onClick={reset} />} />
    </TnSkallSkjelett>
  );
}
