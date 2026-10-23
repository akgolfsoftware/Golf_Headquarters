import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Fag og administrasjon › Fagapparat laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function FagapparatLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="liste" tekst="Henter fagteamet …" />
    </TnSkallSkjelett>
  );
}
