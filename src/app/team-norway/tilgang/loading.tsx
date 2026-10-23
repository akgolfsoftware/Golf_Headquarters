import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Fag og administrasjon › Trenere og tilgang laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function TilgangLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="tabell" tekst="Henter tilganger per gruppe …" />
    </TnSkallSkjelett>
  );
}
