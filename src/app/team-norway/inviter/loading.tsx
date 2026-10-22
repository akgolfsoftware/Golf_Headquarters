import { TnLasterSkjerm, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Fag og administrasjon › Inviter spiller laster, i skjermens form. Ingen import fra en "use client"-modul (gotchas §Bygg og drift). */
export default function InviterLaster() {
  return (
    <TnSkallSkjelett>
      <TnLasterSkjerm form="kort" tekst="Henter invitasjonene …" />
    </TnSkallSkjelett>
  );
}
