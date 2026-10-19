import { TnHandlingLenke } from "@/components/team-norway/tn-handlinger";
import { TnFeilkort, TnSkallSkjelett } from "@/components/team-norway/tn-tilstand";

/** Ikke funnet i Team Norway, også når spilleren ikke har delt med Team Norway. Sier aldri hvilken av delene. */
export default function TeamNorwayIkkeFunnet() {
  return (
    <TnSkallSkjelett>
      <TnFeilkort
        tittel="Siden finnes ikke, eller spilleren har ikke delt"
        tekst="Du ser bare spillere som selv har delt med Team Norway fra PlayerHQ."
        handling={<TnHandlingLenke href="/team-norway/spillere" variant="sekundar">Til Spillerutvikling</TnHandlingLenke>}
      />
    </TnSkallSkjelett>
  );
}
