/* AK Golf HQ — PUTTE-KJERNE (shared)
   Break-at-speed reference (from Break-tabell) + en make-%-modell
   som de tre retningene deler. */

export const SLOPES = ["0,5 %", "1 %", "1,5 %", "2 %", "2,5 %", "3 %"];
export const SLOPE_PCT = [0.5, 1, 1.5, 2, 2.5, 3];
export const SPEEDS = [8, 10, 12];

export type LenEntry = {
  m: string;
  cm: number;
  grid: [number, number, number][];
};

export const LEN: LenEntry[] = [
  { m: "1 m",   cm: 100, grid: [[1,2,2],[3,3,4],[4,5,6],[5,7,9],[7,9,11],[9,11,14]] },
  { m: "1,5 m", cm: 150, grid: [[2,3,4],[4,5,6],[6,7,9],[7,10,13],[9,13,17],[12,16,20]] },
  { m: "2 m",   cm: 200, grid: [[3,4,5],[6,7,9],[9,11,14],[11,14,19],[14,19,25],[19,24,31]] },
  { m: "2,5 m", cm: 250, grid: [[4,5,6],[8,10,12],[11,14,18],[14,19,25],[20,25,32],[25,32,41]] },
  { m: "3 m",   cm: 300, grid: [[5,6,8],[10,13,16],[14,19,24],[19,24,32],[26,33,43],[32,41,55]] },
  { m: "4 m",   cm: 400, grid: [[7,9,12],[14,18,23],[21,27,34],[28,36,46],[36,46,60],[44,60,80]] },
  { m: "5 m",   cm: 500, grid: [[10,12,15],[19,23,30],[29,36,47],[38,50,60],[50,65,85],[60,80,100]] },
  { m: "6 m",   cm: 600, grid: [[11,14,18],[23,28,36],[34,44,57],[47,60,75],[60,80,100],[70,95,125]] },
];

export const HOLE_CM = 5.4;
export const BALL_CM = 4.0;

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const nb = (n: number) => String(n).replace(".", ",");
export const comma1 = (n: number) => n.toFixed(1).replace(".", ",");
export const pct = (n: number) => Math.round(n * 100);

export function breakAtStimp(lenIdx: number, slopeIdx: number, stimp: number): number {
  const [a, b, c] = LEN[lenIdx].grid[slopeIdx];
  let v: number;
  if (stimp <= 10) v = a + (b - a) / 2 * (stimp - 8);
  else             v = b + (c - b) / 2 * (stimp - 10);
  return Math.max(0, v);
}

const BASE_MAKE = [0.99, 0.96, 0.90, 0.82, 0.72, 0.52, 0.38, 0.28];

export function geomCeiling(lenIdx: number, slopeIdx: number, stimp: number): number {
  const p = BASE_MAKE[lenIdx];
  const slopePen = SLOPE_PCT[slopeIdx] * 0.035 * (1 + lenIdx * 0.12);
  const speedPen = (stimp - 10) * 0.012;
  return clamp(p - slopePen - speedPen, 0.06, 0.995);
}

export type StageKey = "read" | "aim" | "start" | "pace";

export const STAGE: Record<StageKey, { label: string; floor: number; blurb: string }> = {
  read:  { label: "Green-lesing", floor: 0.42, blurb: "Feil lest fall → feil mål." },
  aim:   { label: "Sikte",        floor: 0.38, blurb: "Putteren peker ikke på linjen." },
  start: { label: "Ballstart",    floor: 0.40, blurb: "Ballen starter utenfor linjen." },
  pace:  { label: "Lengde",       floor: 0.34, blurb: "For løs eller for hard." },
};

export const FLAX = 0.97;

export function stageMult(key: StageKey, q: number): number {
  const f = STAGE[key].floor;
  return lerp(f, 1, Math.pow(clamp(q, 0, 1), 0.85));
}

export type QVals = { read: number; aim: number; start: number; pace: number };

export function makeProb(geom: number, q: QVals): number {
  const m = stageMult("read", q.read) * stageMult("aim", q.aim) *
            stageMult("start", q.start) * stageMult("pace", q.pace);
  return clamp(geom * m * FLAX, 0, 0.995);
}

export function processScore(q: QVals): number {
  return Math.round((q.read + q.aim + q.start + q.pace) / 4 * 100);
}
