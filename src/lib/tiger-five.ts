// Tiger Five — de fem vanligste score-dreperne for amatørspillere.
// Definert i AK Golf CANON v3.5 (presisjonsstrategi-metodikken).
// Kalkulatoren leses fra Shot-data for én eller flere runder.
//
// Tiger Five:
//   1. Bogey på par 5   — enkelt hull å score par på, men ender med bogey
//   2. Dobbelt bogey    — to slag over par på ett hull
//   3. Tre-putt         — 3+ putter på et green
//   4. Bogey fra 150m   — hadde slag fra ≤150m men endte med bogey
//   5. To chips         — trengte 2+ chip/pitch-slag på ett hull

import { ShotType } from "@/generated/prisma/client";

export type ShotForTigerFive = {
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  shotType: ShotType;
  distanceToPin: number | null;
  isPenalty: boolean;
};

type HullData = {
  hulNummer: number;
  par: number;
  score: number;
  putts: number;
  harApproachFra150: boolean;
  chips: number;
};

function grupperHull(shots: ShotForTigerFive[]): HullData[] {
  const hulMap = new Map<number, ShotForTigerFive[]>();
  for (const s of shots) {
    if (!hulMap.has(s.holeNumber)) hulMap.set(s.holeNumber, []);
    hulMap.get(s.holeNumber)!.push(s);
  }

  return Array.from(hulMap.entries()).map(([hulNummer, hullSlag]) => {
    const par = hullSlag[0].holePar;
    // Siste shotNumber per hull = antall slag spilt (inkl. drop/penalty-slag)
    const score = Math.max(...hullSlag.map((s) => s.shotNumber));

    const putts = hullSlag.filter((s) => s.shotType === "PUTT").length;

    // Approach fra ≤150m: APPROACH-slag (ikke putt) med distanceToPin ≤ 150
    const harApproachFra150 = hullSlag.some(
      (s) =>
        s.shotType === "APPROACH" &&
        s.distanceToPin != null &&
        s.distanceToPin <= 150,
    );

    const chips = hullSlag.filter(
      (s) => s.shotType === "CHIP" || s.shotType === "PITCH",
    ).length;

    return { hulNummer, par, score, putts, harApproachFra150, chips };
  });
}

export type TigerFiveResultat = {
  bogeyPar5: number;
  dobbeltBogey: number;
  trePutt: number;
  bogeyFra150: number;
  toChips: number;
  /** Sum av alle fem kategorier — jo lavere, jo mer stabil runden. */
  totalt: number;
  /** Antall hull analysert. */
  antallHull: number;
};

export function beregnTigerFive(shots: ShotForTigerFive[]): TigerFiveResultat {
  const hull = grupperHull(shots);

  let bogeyPar5 = 0;
  let dobbeltBogey = 0;
  let trePutt = 0;
  let bogeyFra150 = 0;
  let toChips = 0;

  for (const h of hull) {
    const avvik = h.score - h.par;
    if (h.par === 5 && avvik >= 1) bogeyPar5++;
    if (avvik >= 2) dobbeltBogey++;
    if (h.putts >= 3) trePutt++;
    if (h.harApproachFra150 && avvik >= 1) bogeyFra150++;
    if (h.chips >= 2) toChips++;
  }

  return {
    bogeyPar5,
    dobbeltBogey,
    trePutt,
    bogeyFra150,
    toChips,
    totalt: bogeyPar5 + dobbeltBogey + trePutt + bogeyFra150 + toChips,
    antallHull: hull.length,
  };
}

/** Aggregerer Tiger Five over flere runder og returnerer snitt per runde. */
export function beregnTigerFiveSnitt(
  runder: ShotForTigerFive[][],
): TigerFiveResultat & { antallRunder: number } {
  if (runder.length === 0) {
    return {
      bogeyPar5: 0,
      dobbeltBogey: 0,
      trePutt: 0,
      bogeyFra150: 0,
      toChips: 0,
      totalt: 0,
      antallHull: 0,
      antallRunder: 0,
    };
  }

  const resultater = runder.map(beregnTigerFive);
  const n = resultater.length;

  const snitt = (felt: keyof Omit<TigerFiveResultat, "antallHull">) =>
    resultater.reduce((sum, r) => sum + r[felt], 0) / n;

  return {
    bogeyPar5: snitt("bogeyPar5"),
    dobbeltBogey: snitt("dobbeltBogey"),
    trePutt: snitt("trePutt"),
    bogeyFra150: snitt("bogeyFra150"),
    toChips: snitt("toChips"),
    totalt: snitt("totalt"),
    antallHull: Math.round(resultater.reduce((sum, r) => sum + r.antallHull, 0) / n),
    antallRunder: n,
  };
}

/** Kategoriserer Tiger Five-nivå for visning i UI. */
export type TigerFiveNivaa = "eksellent" | "bra" | "ok" | "krise";

export function tigerFiveNivaa(totalt: number, antallHull: number): TigerFiveNivaa {
  if (antallHull === 0) return "ok";
  const perHull = totalt / antallHull;
  if (perHull < 0.5) return "eksellent";
  if (perHull < 1.0) return "bra";
  if (perHull < 1.5) return "ok";
  return "krise";
}
