/**
 * poeng-tabeller.ts — poengoppslag for scorekortene (8-ball og lengdeputt),
 * høstet fra ak-golf-talenthq (shared/protocols/sg-reference.js,
 * Referens!E2:G6 og E11:G15). Egen tredje familie, uavhengig av både PEI
 * (pei-tabeller.ts) og Broadie-SG (broadie-sg-tabeller.ts).
 */
import { slaOpp, type Oppslagstabell } from "./vlookup";

/**
 * 8-ball-poeng fra avstand til hullet i meter (Anders 14.10.2026): innenfor
 * 1 m 3 · innenfor 2 m 2 · innenfor 3 m 1 · lenger unna 0. I hull på ett
 * slag gir POENG_8BALL_I_HULL. Grensene er nedre grenser, som i arket.
 */
export const POENG_8BALL: Oppslagstabell = [
  [0, 3],
  [1, 2],
  [2, 1],
  [3, 0],
];

/** Poeng når ballen går i hull på ett slag (Anders 14.10.2026). */
export const POENG_8BALL_I_HULL = 5;

/**
 * Referens!E2:G6 — den gamle 8-ball-skalaen (under 0,1 m = 4). Brukes bare
 * til å regne om lagrede resultater med regelversjonen fra før 14.10.2026.
 */
export const POENG_8BALL_EXCEL_V3: Oppslagstabell = [
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

/** Poeng i 8-ball fra avstand til hullet i meter, eller 5 når ballen gikk i hull. */
export function poeng8Ball(resultatMeter: number | null, iHull = false): number | null {
  return iHull ? POENG_8BALL_I_HULL : slaOpp(POENG_8BALL, resultatMeter);
}

/** Poeng etter den gamle skalaen (Referens!E2:G6), for lagrede resultater fra før 14.10.2026. */
export function poeng8BallExcelV3(resultatMeter: number | null): number | null {
  return slaOpp(POENG_8BALL_EXCEL_V3, resultatMeter);
}

/** Poeng i «9 hull lengde» fra antall fot forbi/kort. */
export function poengLengdePutt(fot: number | null): number | null {
  return slaOpp(POENG_LENGDEPUTT, fot == null ? null : Math.abs(fot));
}
