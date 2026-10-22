import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Samlinger og testing › Månedsplan laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function ManedsplanLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="plan" tekst="Henter månedsplanen …" />
    </TnSkallSkjelett>
  );
}
