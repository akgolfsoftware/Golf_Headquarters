/**
 * Avleder hullstatistikk (HoleScore-feltene) fra loggede slag.
 *
 * Regler:
 *  - strokes = antall slag + antall straffer.
 *  - putts   = antall slag spilt FRA green (startposisjon GREEN).
 *  - fairway = kun par 4/5: første slags resultat er FAIRWAY (drive på green
 *    eller i hull teller IKKE som fairway-treff — standard statistikk-konvensjon).
 *  - gir     = ballen ligger på green (eller er i hull) etter ≤ par − 2
 *    forbrukte slag (straffer teller som forbrukte slag).
 */

import type { HullScore, LoggetHull } from "./types";

export function deriverHullScore(hull: LoggetHull): HullScore {
  let strokes = 0;
  let putts = 0;
  let gir = false;
  let fairway: boolean | null = hull.par >= 4 ? false : null;

  let paGreen = false;

  hull.slag.forEach((slag, i) => {
    if (paGreen) putts += 1;

    strokes += 1;
    if (slag.straffe) strokes += 1;

    const iHull = slag.resultat.iHull;
    const paGreenNaa = !iHull && slag.resultat.lie === "GREEN";

    if (hull.par >= 4 && i === 0 && !iHull && slag.resultat.lie === "FAIRWAY") {
      fairway = true;
    }

    if ((paGreenNaa || iHull) && !gir && strokes <= hull.par - 2) {
      gir = true;
    }

    paGreen = paGreenNaa;
  });

  return {
    holeNumber: hull.holeNumber,
    par: hull.par,
    strokes,
    putts,
    fairway,
    gir,
  };
}

export function deriverRundeScore(hull: ReadonlyArray<LoggetHull>): {
  hullScores: HullScore[];
  totalScore: number;
} {
  const hullScores = hull.map((h) => deriverHullScore(h));
  const totalScore = hullScores.reduce((sum, h) => sum + h.strokes, 0);
  return { hullScores, totalScore };
}
