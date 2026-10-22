import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Turneringer › Rangliste laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function RanglisteLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="liste" tekst="Henter ranglisten …" />
    </TnSkallSkjelett>
  );
}
