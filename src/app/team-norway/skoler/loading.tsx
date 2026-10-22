import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Spillere › Skoler laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function SkolerLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="liste" tekst="Henter skolene …" />
    </TnSkallSkjelett>
  );
}
