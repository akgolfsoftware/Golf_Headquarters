/**
 * Datamodell og hjelpefunksjoner for PH-08 (Runde live) og PH-09 (Registrer runde).
 * Følger Claude Design Precision Athletics-fasit (PH-08.jsx og PH-09.jsx).
 * KUN brutto score — aldri netto score.
 */

export type LieType = "Tee" | "Fairway" | "Rough" | "Sand" | "Putt";

export interface LiveSlag {
  lie: LieType;
  meter?: number;
  fot?: number;
}

export interface LiveHullData {
  hullNummer: number; // 1-18
  par: number;
  meter: number;
  slag: LiveSlag[];
}

export interface CourseHoleDef {
  nummer: number;
  par: number;
  meter: number;
}

export const STANDARD_18_HOLES: CourseHoleDef[] = [
  { nummer: 1, par: 4, meter: 342 },
  { nummer: 2, par: 4, meter: 380 },
  { nummer: 3, par: 3, meter: 165 },
  { nummer: 4, par: 5, meter: 485 },
  { nummer: 5, par: 4, meter: 360 },
  { nummer: 6, par: 4, meter: 395 },
  { nummer: 7, par: 3, meter: 175 },
  { nummer: 8, par: 5, meter: 510 },
  { nummer: 9, par: 4, meter: 370 },
  { nummer: 10, par: 4, meter: 355 },
  { nummer: 11, par: 4, meter: 390 },
  { nummer: 12, par: 3, meter: 180 },
  { nummer: 13, par: 5, meter: 495 },
  { nummer: 14, par: 4, meter: 365 },
  { nummer: 15, par: 4, meter: 385 },
  { nummer: 16, par: 5, meter: 520 },
  { nummer: 17, par: 3, meter: 160 },
  { nummer: 18, par: 4, meter: 410 },
];

/**
 * Formaterer differanse mot par (f.eks. +2, −1, E).
 * Kun brutto mot par.
 */
export function formatToPar(diff: number): string {
  if (diff > 0) return `+${diff}`;
  if (diff < 0) return `−${Math.abs(diff)}`;
  return "E";
}

/**
 * Summerer brutto score over en rekke hullscores. Null-verdier ignoreres.
 */
export function beregnBruttoScore(scores: (number | null)[], startIdx = 0, endIdx = scores.length): number {
  let sum = 0;
  for (let i = startIdx; i < endIdx && i < scores.length; i++) {
    const s = scores[i];
    if (s != null && s > 0) {
      sum += s;
    }
  }
  return sum;
}

/**
 * Summerer par kun for de hullene som faktisk har registrert score.
 */
export function beregnParForSpilteHull(
  parList: number[],
  scores: (number | null)[],
  startIdx = 0,
  endIdx = scores.length
): number {
  let sum = 0;
  for (let i = startIdx; i < endIdx && i < scores.length && i < parList.length; i++) {
    if (scores[i] != null && scores[i]! > 0) {
      sum += parList[i];
    }
  }
  return sum;
}

/**
 * Teller antall spilte hull i et intervall.
 */
export function tellSpilteHull(scores: (number | null)[], startIdx = 0, endIdx = scores.length): number {
  let count = 0;
  for (let i = startIdx; i < endIdx && i < scores.length; i++) {
    if (scores[i] != null && scores[i]! > 0) {
      count++;
    }
  }
  return count;
}

/**
 * Validerer om runden kan lagres (9 eller 18 hull ferdig).
 */
export function kanLagres(scores: (number | null)[]): {
  kanLagre: boolean;
  type: "18_hull" | "9_ut" | "9_inn" | "uferdig";
  spilteHull: number;
} {
  const frontSpilt = scores.slice(0, 9).every((s) => s != null && s > 0);
  const backSpilt = scores.slice(9, 18).every((s) => s != null && s > 0);
  const spilteHull = tellSpilteHull(scores);

  if (frontSpilt && backSpilt) {
    return { kanLagre: true, type: "18_hull", spilteHull };
  }
  if (frontSpilt && spilteHull === 9) {
    return { kanLagre: true, type: "9_ut", spilteHull };
  }
  if (backSpilt && spilteHull === 9) {
    return { kanLagre: true, type: "9_inn", spilteHull };
  }
  return { kanLagre: false, type: "uferdig", spilteHull };
}

/**
 * Formaterer en slag-beskrivelse for chip i slaglisten.
 */
export function formatSlagChip(slagNummer: number, slag: LiveSlag): string {
  if (slag.lie === "Putt") {
    return `${slagNummer} · PUTT ${slag.fot ?? 0} FT`;
  }
  return `${slagNummer} · ${slag.lie.toUpperCase()} ${slag.meter ?? 0} M`;
}

/**
 * Henter manglende hull for en valgt rekkevidde (f.eks. [0, 9], [9, 18] eller [0, 18]).
 */
export function finnManglendeHull(scores: (number | null)[], startIdx: number, endIdx: number): number[] {
  const mangler: number[] = [];
  for (let i = startIdx; i < endIdx; i++) {
    if (scores[i] == null || scores[i]! <= 0) {
      mangler.push(i + 1);
    }
  }
  return mangler;
}
