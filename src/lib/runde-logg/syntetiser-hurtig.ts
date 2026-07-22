/**
 * Hurtigmodus (F.02): bygg en gyldig slag-kjede fra hullscore.
 *
 * Brukes når spilleren bare taster slag (evt. putter) per hull —
 * samme lagre-motor som slag-for-slag (lagreLoggetRunde) krever
 * fullført kjede. SG fra denne kjeden er grovt estimat til kjeden
 * evt. fylles ut senere (Fullfør kjeden / UpGame).
 */

import type { LoggetHull, LoggetSlag } from "./types";

export type HurtigHullInput = {
  holeNumber: number;
  par: number;
  lengdeMeter: number;
  /** Brutto slag inkl. straffer (1–15). */
  strokes: number;
  /** Valgfritt antall putter (0–strokes). Default: 2 hvis plass, ellers færre. */
  putts?: number;
  /** Par 4/5: treffet fairway? Default true (ærlig «vet ikke» = antatt ja). */
  fairway?: boolean | null;
};

/**
 * Bygger LoggetHull med ferdig i-hull-kjede for gitt score.
 * Kaster ved ugyldig strokes.
 */
export function syntetiserHurtigHull(input: HurtigHullInput): LoggetHull {
  const { holeNumber, par, lengdeMeter } = input;
  const strokes = Math.trunc(input.strokes);
  if (!Number.isFinite(strokes) || strokes < 1 || strokes > 15) {
    throw new Error(`Ugyldig score på hull ${holeNumber}: ${input.strokes}`);
  }

  const maxPutts = Math.max(0, strokes - (par >= 4 ? 1 : 0));
  let putts =
    input.putts != null
      ? Math.trunc(input.putts)
      : Math.min(2, Math.max(0, strokes - 1));
  putts = Math.max(0, Math.min(putts, maxPutts, strokes));

  const nonPutts = strokes - putts;
  const slag: LoggetSlag[] = [];

  // Fairway-default: par 4/5 ja med mindre eksplisitt nei.
  const fairwayHit =
    par >= 4 ? (input.fairway === false ? false : true) : null;

  for (let i = 0; i < nonPutts; i++) {
    const erSiste = i === nonPutts - 1;
    if (erSiste && putts === 0) {
      slag.push({ resultat: { iHull: true } });
      continue;
    }
    if (erSiste) {
      // På green med typisk putt-avstand
      const m = putts === 1 ? 1.5 : putts === 2 ? 6 : 10;
      slag.push({
        resultat: { iHull: false, lie: "GREEN", avstandTilHull: m },
      });
      continue;
    }
    if (i === 0 && par >= 4) {
      const remain = Math.max(50, Math.round(lengdeMeter * 0.38));
      slag.push({
        resultat: {
          iHull: false,
          lie: fairwayHit ? "FAIRWAY" : "ROUGH",
          avstandTilHull: remain,
        },
      });
      continue;
    }
    // Mellomslag inn mot green
    const remain = Math.max(35, Math.round(lengdeMeter * (0.45 / (i + 1))));
    slag.push({
      resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: remain },
    });
  }

  for (let p = 0; p < putts; p++) {
    if (p === putts - 1) {
      slag.push({ resultat: { iHull: true } });
    } else {
      slag.push({
        resultat: {
          iHull: false,
          lie: "GREEN",
          avstandTilHull: Math.max(0.4, 2.5 - p * 0.8),
        },
      });
    }
  }

  return { holeNumber, par, lengdeMeter, slag };
}

/** Les score fra hurtig-syntetisert eller fullført hull. */
export function scoreFraHull(hull: LoggetHull): number | null {
  if (hull.slag.at(-1)?.resultat.iHull !== true) return null;
  return hull.slag.length + hull.slag.filter((s) => s.straffe).length;
}
