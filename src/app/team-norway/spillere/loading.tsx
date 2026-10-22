import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Spillere laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function SpillereLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="liste" tekst="Henter spillerne …" />
    </TnSkallSkjelett>
  );
}
