import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Samlinger og testing › WANG-tester laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function WangTesterLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="tabell" tekst="Henter delte WANG-tester …" />
    </TnSkallSkjelett>
  );
}
