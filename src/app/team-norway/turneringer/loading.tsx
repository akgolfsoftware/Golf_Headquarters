import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Turneringer laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function TurneringerLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="tabell" tekst="Henter turneringene …" />
    </TnSkallSkjelett>
  );
}
