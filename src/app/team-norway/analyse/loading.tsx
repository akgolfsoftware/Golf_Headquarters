import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Samlinger og testing › Gruppeanalyse laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function GruppeanalyseLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="tabell" tekst="Henter gruppeanalysen …" />
    </TnSkallSkjelett>
  );
}
