import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Turneringer › Live Watch laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function LiveWatchLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="kort" tekst="Henter turneringene som pågår …" />
    </TnSkallSkjelett>
  );
}
