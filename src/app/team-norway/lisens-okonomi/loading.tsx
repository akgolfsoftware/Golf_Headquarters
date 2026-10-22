import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Fag og administrasjon › Lisens og status laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function LisensLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="liste" tekst="Henter lisens og status …" />
    </TnSkallSkjelett>
  );
}
