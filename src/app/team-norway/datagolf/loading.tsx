import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Fag og administrasjon › Data Golf laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function DataGolfLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="tabell" tekst="Henter Data Golf …" />
    </TnSkallSkjelett>
  );
}
