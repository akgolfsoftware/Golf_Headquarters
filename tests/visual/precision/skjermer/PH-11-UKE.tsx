/** Prøvefil for PH-11 Plan, uka (spillerens Workbench, nivå Uke) i designløftet 20.10. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH11Uke } from "@/components/portal/precision/PH11Uke";
import { FYS, KILDER, MAL, SPILLER, uke } from "./_wb-data";

export const sti = "/portal/planlegge/workbench";

const uka = uke(false);
const idag = uka.days[1]?.date ?? uka.weekStart;
const vis = (tom: boolean) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
    <PH11Uke
      playerId="p1" spillerNavn={SPILLER} uke={tom ? uke(true) : uka} kilder={tom ? [] : KILDER} goals={tom ? [] : MAL} fys={FYS}
      referanse={{ kind: "ingen" } as never}
      periode={tom ? null : { navn: "Grunnperiode", ukeIPerioden: 3, antallUker: 8, slutt: "2026-11-15", fordelt: { FYS: 150, TEK: 180, SLAG: 180, SPILL: 150 } }}
      idag={idag} naMinutt={16 * 60}
    />
  </PlayerHQSkall>
);

export const tilstander = { uke: vis(false), "uke-tom": vis(true) };
