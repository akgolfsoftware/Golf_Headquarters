import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Spillere › IUP laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function IupLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="iup" tekst="Henter IUP-en …" />
    </TnSkallSkjelett>
  );
}
