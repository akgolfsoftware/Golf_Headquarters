import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Samlinger og testing › Fellestesting laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function FellestestingLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="tabell" tekst="Henter testdagene …" />
    </TnSkallSkjelett>
  );
}
