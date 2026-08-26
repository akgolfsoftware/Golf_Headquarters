/**
 * poeng-tabeller.ts — poengoppslag for scorekortene (8-ball og lengdeputt),
 * høstet fra ak-golf-talenthq (shared/protocols/sg-reference.js,
 * Referens!E2:G6 og E11:G15). Egen tredje familie, uavhengig av både PEI
 * (pei-tabeller.ts) og Broadie-SG (broadie-sg-tabeller.ts).
 */
import { slaOpp, type Oppslagstabell } from "./vlookup";

/** Referens!E2:G6 — poeng i 8-ball-testene fra resultat (meter fra hull). */
export const POENG_8BALL: Oppslagstabell = [
  [0, 4],
  [0.1, 3],
  [1, 2],
  [2, 1],
  [3, 0],
];

/** Referens!E11:G15 — poeng i «9 hull lengde» fra antall fot forbi/kort (sänk=6). */
export const POENG_LENGDEPUTT: Oppslagstabell = [
  [0, 6],
  [0.1, 3],
  [1.1, 1],
  [2.1, 0.5],
  [4.01, 0],
];

/** Poeng i 8-ball fra resultat i meter. */
export function poeng8Ball(resultatMeter: number | null): number | null {
  return slaOpp(POENG_8BALL, resultatMeter);
}

/** Poeng i «9 hull lengde» fra antall fot forbi/kort. */
export function poengLengdePutt(fot: number | null): number | null {
  return slaOpp(POENG_LENGDEPUTT, fot == null ? null : Math.abs(fot));
}
