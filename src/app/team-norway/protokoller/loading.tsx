import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Fag og administrasjon › Testprotokoller laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function ProtokollerLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="liste" tekst="Henter testprotokollene …" />
    </TnSkallSkjelett>
  );
}
