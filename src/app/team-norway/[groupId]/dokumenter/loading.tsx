import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Hjem › Dokumenter laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function DokumenterLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="liste" tekst="Henter gruppens dokumenter …" />
    </TnSkallSkjelett>
  );
}
