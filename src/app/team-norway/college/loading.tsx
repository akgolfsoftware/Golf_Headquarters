import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Spillere › College og USA laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function CollegeLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="liste" tekst="Henter college-gruppen …" />
    </TnSkallSkjelett>
  );
}
