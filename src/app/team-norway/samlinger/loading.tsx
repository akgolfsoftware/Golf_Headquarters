import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Samlinger og testing › Samlinger laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function SamlingerLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="kort" tekst="Henter samlingene …" />
    </TnSkallSkjelett>
  );
}
