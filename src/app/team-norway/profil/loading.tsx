import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Min profil laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function ProfilLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="kort" tekst="Henter profilen din …" />
    </TnSkallSkjelett>
  );
}
