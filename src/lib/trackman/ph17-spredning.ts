/** PH-17 spredning: skala og 2 SD-ellipse regnet ut av punktene (ren funksjon, ingen DB). */
export type Ph17Spredning = { range: number; mx: number; my: number; sx: number; sy: number };

const RINGER = [6, 9, 12, 18, 24, 36, 60];

export function regnSpredning(pts: [number, number][]): Ph17Spredning {
  const n = pts.length;
  const mx = n ? pts.reduce((a, p) => a + p[0], 0) / n : 0;
  const my = n ? pts.reduce((a, p) => a + p[1], 0) / n : 0;
  const sx = n ? Math.sqrt(pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0) / n) : 0;
  const sy = n ? Math.sqrt(pts.reduce((a, p) => a + (p[1] - my) ** 2, 0) / n) : 0;
  // Skalaen dekker både punktene og ellipsen (2 SD), slik at ellipsen aldri kappes.
  const maks = pts.reduce((a, p) => Math.max(a, Math.abs(p[0]), Math.abs(p[1])), n > 2 ? Math.max(Math.abs(mx) + 2 * sx, Math.abs(my) + 2 * sy) : 0);
  return { range: RINGER.find((r) => r >= maks) ?? 100, mx, my, sx, sy };
}
