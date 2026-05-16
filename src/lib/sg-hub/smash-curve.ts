import type { ShotData } from "./extract-shots";

export type SmashPoint = {
  clubSpeed: number;
  smashFactor: number;
};

export type SmashCurveResult = {
  points: SmashPoint[];
  optimumSpeed: number;
  curvePoints: SmashPoint[];
  aboveOptimumPct: number;
};

// Minste kvadraters metode for ax² + bx + c
function polyFit2(xs: number[], ys: number[]): [number, number, number] {
  const n = xs.length;
  if (n < 3) return [0, 0, ys.reduce((s, y) => s + y, 0) / Math.max(1, n)];

  let sx = 0, sx2 = 0, sx3 = 0, sx4 = 0;
  let sy = 0, sxy = 0, sx2y = 0;

  for (let i = 0; i < n; i++) {
    const x = xs[i], y = ys[i];
    const x2 = x * x;
    sx += x; sx2 += x2; sx3 += x2 * x; sx4 += x2 * x2;
    sy += y; sxy += x * y; sx2y += x2 * y;
  }

  // Gauss-eliminasjon på 3×3 normalligninger
  const A = [
    [n, sx, sx2],
    [sx, sx2, sx3],
    [sx2, sx3, sx4],
  ];
  const b = [sy, sxy, sx2y];

  for (let col = 0; col < 3; col++) {
    let maxRow = col;
    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row;
    }
    [A[col], A[maxRow]] = [A[maxRow], A[col]];
    [b[col], b[maxRow]] = [b[maxRow], b[col]];

    for (let row = col + 1; row < 3; row++) {
      const factor = A[row][col] / A[col][col];
      for (let k = col; k < 3; k++) A[row][k] -= factor * A[col][k];
      b[row] -= factor * b[col];
    }
  }

  const c2 = b[2] / A[2][2];
  const c1 = (b[1] - A[1][2] * c2) / A[1][1];
  const c0 = (b[0] - A[0][1] * c1 - A[0][2] * c2) / A[0][0];

  return [c2, c1, c0]; // a, b, c
}

export function computeSmashCurve(shots: ShotData[]): SmashCurveResult {
  const valid = shots.filter((s) => s.clubSpeed > 0 && s.smashFactor > 0);

  if (valid.length < 3) {
    return {
      points: valid.map((s) => ({ clubSpeed: s.clubSpeed, smashFactor: s.smashFactor })),
      optimumSpeed: 0,
      curvePoints: [],
      aboveOptimumPct: 0,
    };
  }

  const xs = valid.map((s) => s.clubSpeed);
  const ys = valid.map((s) => s.smashFactor);

  const [a, b, c] = polyFit2(xs, ys);

  // Optimum ved -b/(2a). Klem til realistisk range.
  const rawOptimum = a !== 0 ? -b / (2 * a) : xs.reduce((s, x) => s + x, 0) / xs.length;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const optimumSpeed = Math.round(Math.max(minX, Math.min(maxX, rawOptimum)) * 10) / 10;

  // 20 jevnt fordelte kurve-punkter
  const range = maxX - minX;
  const curvePoints: SmashPoint[] = Array.from({ length: 20 }, (_, i) => {
    const x = minX + (range * i) / 19;
    return { clubSpeed: Math.round(x * 10) / 10, smashFactor: Math.round((a * x * x + b * x + c) * 1000) / 1000 };
  });

  const aboveCount = valid.filter((s) => s.clubSpeed > optimumSpeed).length;
  const aboveOptimumPct = Math.round((aboveCount / valid.length) * 100);

  return {
    points: valid.map((s) => ({ clubSpeed: s.clubSpeed, smashFactor: s.smashFactor })),
    optimumSpeed,
    curvePoints,
    aboveOptimumPct,
  };
}
