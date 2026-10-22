import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Hjem › I dag laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function TeamNorwayLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="hjem" tekst="Henter dagen i Team Norway …" />
    </TnSkallSkjelett>
  );
}
