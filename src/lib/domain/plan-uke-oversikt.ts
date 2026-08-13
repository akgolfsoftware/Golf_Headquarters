/**
 * «Uke for uke» — grupperer en plan-mals økter (PlanTemplateSession) i
 * sammenhengende ukeblokker med samme dominerende pyramide-område.
 *
 * Brukt av inspektørpanelet i planbiblioteket (agencyos-planbibliotek.html
 * §aside .blokk «Uke for uke»). Fasiten skriver narrative fasenavn
 * («kartlegging», «nærspillblokk») som ikke finnes i data — vi viser i
 * stedet det ekte dominerende pyramide-området per ukeblokk, aldri en
 * oppdiktet fasetekst.
 *
 * Uker uten økter utelates (ingen dominerende område å vise).
 */

import type { PyramidArea } from "@/generated/prisma/enums";

/** Rekkefølge brukt til å avgjøre uavgjort-vinner deterministisk. */
const AKSE_ORDEN: PyramidArea[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];

export type UkeOktRad = { ukeNr: number; pyramidArea: PyramidArea };

export type UkeblokkRad = {
  fraUke: number;
  tilUke: number;
  omrade: PyramidArea;
  oktAntall: number;
};

/** Dominerende område for én uke — flest økter vinner, uavgjort avgjøres av AKSE_ORDEN. */
function dominerendeOmrade(rader: UkeOktRad[]): PyramidArea | null {
  if (rader.length === 0) return null;
  const antall = new Map<PyramidArea, number>();
  for (const r of rader) antall.set(r.pyramidArea, (antall.get(r.pyramidArea) ?? 0) + 1);
  let best: PyramidArea | null = null;
  let flest = 0;
  for (const akse of AKSE_ORDEN) {
    const n = antall.get(akse) ?? 0;
    if (n > flest) {
      flest = n;
      best = akse;
    }
  }
  return best;
}

/**
 * Bygger sammenhengende ukeblokker (1..varighetUker) med samme dominerende
 * område. Uker uten økter hopper over (ingen blokk).
 */
export function bygUkeOversikt(
  sessions: ReadonlyArray<UkeOktRad>,
  varighetUker: number,
): UkeblokkRad[] {
  const blokker: UkeblokkRad[] = [];

  for (let uke = 1; uke <= varighetUker; uke++) {
    const okterDenneUka = sessions.filter((s) => s.ukeNr === uke);
    const omrade = dominerendeOmrade(okterDenneUka);
    if (omrade === null) continue;

    const forrige = blokker[blokker.length - 1];
    if (forrige && forrige.omrade === omrade && forrige.tilUke === uke - 1) {
      forrige.tilUke = uke;
      forrige.oktAntall += okterDenneUka.length;
    } else {
      blokker.push({ fraUke: uke, tilUke: uke, omrade, oktAntall: okterDenneUka.length });
    }
  }

  return blokker;
}
