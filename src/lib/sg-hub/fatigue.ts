// Fatigue Curve — innen én økt: oppdager om Club Speed faller etter slag 25-30.
// Beregning:
//   - 5-slag rolling average over kronologisk ordnete slag
//   - Lineær regresjon over rullende snitt
//   - Fatigue-signal = drop > 1 mph per 10 slag (helning < -0.1 mph/slag)
//   - Inflection point = første slagnummer der rullende snitt er > 1 mph under
//     det høyeste rullende snittet tidligere i økten

import type { ShotData } from "./extract-shots";

export type FatiguePoint = {
  shotNumber: number;
  clubSpeed: number;
  rolling: number; // 5-slag rolling average
};

export type FatigueResult = {
  points: FatiguePoint[];
  slope: number; // mph per slag (negativ = avtagende)
  dropPer10: number; // mph per 10 slag (positiv = drop)
  targetSpeed: number; // toppen av rullende snitt
  inflectionShot: number | null; // første slag som faller > 1 mph under target
  fatigueDetected: boolean;
  shotCount: number;
};

const WINDOW = 5;
const FATIGUE_THRESHOLD_PER_10 = 1; // mph drop per 10 slag
const INFLECTION_DELTA = 1; // mph under target før vi flagger inflection

function rollingAverage(values: number[], window: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
    out.push(avg);
  }
  return out;
}

function linearRegressionSlope(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  let sx = 0;
  let sy = 0;
  let sxy = 0;
  let sx2 = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
    sxy += xs[i] * ys[i];
    sx2 += xs[i] * xs[i];
  }
  const denom = n * sx2 - sx * sx;
  if (denom === 0) return 0;
  return (n * sxy - sx * sy) / denom;
}

export function computeFatigueCurve(shots: ShotData[]): FatigueResult {
  const valid = shots
    .filter((s) => s.clubSpeed > 0)
    .sort((a, b) => a.shotNumber - b.shotNumber);

  if (valid.length < WINDOW) {
    return {
      points: valid.map((s) => ({
        shotNumber: s.shotNumber,
        clubSpeed: s.clubSpeed,
        rolling: s.clubSpeed,
      })),
      slope: 0,
      dropPer10: 0,
      targetSpeed: valid[0]?.clubSpeed ?? 0,
      inflectionShot: null,
      fatigueDetected: false,
      shotCount: valid.length,
    };
  }

  const speeds = valid.map((s) => s.clubSpeed);
  const rolling = rollingAverage(speeds, WINDOW);
  const shotNumbers = valid.map((s) => s.shotNumber);

  const slope = linearRegressionSlope(shotNumbers, rolling);
  const dropPer10 = -slope * 10;

  // Bruk maksimum rolling i første halvdel som target (etablert kapasitet)
  const halvveis = Math.max(WINDOW, Math.floor(rolling.length / 2));
  let target = -Infinity;
  for (let i = 0; i < halvveis; i++) {
    if (rolling[i] > target) target = rolling[i];
  }
  if (!isFinite(target)) target = rolling[0];

  let inflectionShot: number | null = null;
  for (let i = halvveis; i < rolling.length; i++) {
    if (target - rolling[i] >= INFLECTION_DELTA) {
      inflectionShot = shotNumbers[i];
      break;
    }
  }

  const fatigueDetected = dropPer10 > FATIGUE_THRESHOLD_PER_10;

  const points: FatiguePoint[] = valid.map((s, i) => ({
    shotNumber: s.shotNumber,
    clubSpeed: Math.round(s.clubSpeed * 10) / 10,
    rolling: Math.round(rolling[i] * 10) / 10,
  }));

  return {
    points,
    slope: Math.round(slope * 1000) / 1000,
    dropPer10: Math.round(dropPer10 * 10) / 10,
    targetSpeed: Math.round(target * 10) / 10,
    inflectionShot,
    fatigueDetected,
    shotCount: valid.length,
  };
}
