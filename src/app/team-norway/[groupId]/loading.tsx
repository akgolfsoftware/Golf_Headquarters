import { TnLaster, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Gruppeposter laster. Ingen import fra "use client" (gotchas: loading.tsx uten klient-JS). */
export default function GruppepostLaster() {
  return (
    <TnSkallSkjelett>
      <TnLaster tekst="Henter gruppens poster …" />
    </TnSkallSkjelett>
  );
}
