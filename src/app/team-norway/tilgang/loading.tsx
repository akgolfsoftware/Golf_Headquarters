import { TnLaster, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Trenere og tilgang laster. Ingen import fra en "use client"-modul. */
export default function TilgangLaster() {
  return (
    <TnSkallSkjelett>
      <TnLaster tekst="Henter tilganger per gruppe …" />
    </TnSkallSkjelett>
  );
}
