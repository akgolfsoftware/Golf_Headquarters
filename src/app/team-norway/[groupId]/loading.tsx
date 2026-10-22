import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Hjem › Gruppeposter laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function GruppepostLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="liste" tekst="Henter gruppens poster …" />
    </TnSkallSkjelett>
  );
}
