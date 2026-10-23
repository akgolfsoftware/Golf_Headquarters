import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Referanse laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function ReferanseLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="tabell" tekst="Henter referansetallene …" />
    </TnSkallSkjelett>
  );
}
