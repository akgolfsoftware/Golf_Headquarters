import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Fag og administrasjon › Årsplan laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function AarsplanLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="plan" tekst="Henter årsplanen …" />
    </TnSkallSkjelett>
  );
}
