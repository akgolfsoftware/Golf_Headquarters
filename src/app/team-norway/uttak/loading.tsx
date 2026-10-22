import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Turneringer › Uttak laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function UttakLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="kort" tekst="Henter uttakene …" />
    </TnSkallSkjelett>
  );
}
