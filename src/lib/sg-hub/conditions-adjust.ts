// Wind/Conditions-Adjusted Performance — beregningsfunksjoner.
// Justerer per-kølle distanse for temperatur, vind og høyde over havet.

import type { YardageRow } from "./yardage-calc";

export type Conditions = {
  // Lufttemperatur i Celsius. Baseline 15°C.
  tempC: number;
  // Vindstyrke i m/s. Positive verdier = motvind, negative = medvind.
  // Bruk `windDirectionDeg` for kompass-retning (0 = headwind, 180 = tailwind).
  windMs: number;
  windDirectionDeg: number;
  // Høyde over havet i meter. Baseline 0 m.
  elevationM: number;
};

export const DEFAULT_CONDITIONS: Conditions = {
  tempC: 15,
  windMs: 0,
  windDirectionDeg: 0,
  elevationM: 0,
};

// Konverter kompass-retning til effektiv "headwind"-komponent (-1..1).
// 0° = rett motvind (full headwind), 180° = rett medvind (full tailwind).
// 90° / 270° = crosswind (ingen langs-effekt).
export function headwindComponent(windDirectionDeg: number): number {
  const rad = (windDirectionDeg * Math.PI) / 180;
  return Math.cos(rad);
}

// Justert distanse for én kølle gitt forhold.
// Inputs:
//   baseDistance — full stock-distanse (m) ved baseline-forhold
//   apex — estimert apex (m). Brukes for å estimere tid-i-lufta for vind-effekten.
export function adjustDistance(
  baseDistance: number,
  apex: number,
  c: Conditions,
): number {
  if (baseDistance <= 0) return 0;

  // 1) Temp-faktor
  const tempFactor = 1 + 0.0008 * (c.tempC - 15);

  // 2) Elevation: +1 m carry per 100 m
  const elevAdd = c.elevationM / 100;

  // 3) Vind: forenklet aerodynamikkmodell.
  //    Tid i lufta ≈ 2 × sqrt(2 × apex / 9.81).
  //    Vind-effekt på distanse ≈ headwind-komponent × wind-speed × tid-i-lufta.
  //    Headwind > 0 = motvind = mister distanse.
  const timeOfFlight =
    apex > 0 ? 2 * Math.sqrt((2 * apex) / 9.81) : 0;
  const headwind = headwindComponent(c.windDirectionDeg) * c.windMs;
  const windDelta = -headwind * timeOfFlight;

  return baseDistance * tempFactor + elevAdd + windDelta;
}

export type AdjustedYardageRow = YardageRow & {
  adjCarry: number;
  adjTotal: number;
  adjThree: number;
  adjSoft: number;
  delta: number; // m vs base
};

export function adjustYardageRows(
  rows: YardageRow[],
  c: Conditions,
): AdjustedYardageRow[] {
  return rows.map((r) => {
    const adjCarry = adjustDistance(r.carryAvg, r.apex, c);
    const adjTotal = adjustDistance(r.totalAvg, r.apex, c);
    const adjThree = adjustDistance(r.threeQuarter, r.apex * 0.85, c);
    const adjSoft = adjustDistance(r.soft, r.apex * 0.78, c);
    return {
      ...r,
      adjCarry: Math.round(adjCarry * 10) / 10,
      adjTotal: Math.round(adjTotal * 10) / 10,
      adjThree: Math.round(adjThree * 10) / 10,
      adjSoft: Math.round(adjSoft * 10) / 10,
      delta: Math.round((adjTotal - r.totalAvg) * 10) / 10,
    };
  });
}
