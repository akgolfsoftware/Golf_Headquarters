// Same-Distance Strategy.
// For en gitt mål-distanse, finn alle køller som kan dekke distansen og
// rangér etter expected SG (Strokes Gained) fra `SgBaseline`.

import type { YardageRow } from "./yardage-calc";

export type StrategyOption = {
  club: string;
  family: YardageRow["family"];
  // Hvilken distanse-modus matcher mål-distansen?
  mode: "full" | "three-quarter" | "soft";
  // Forventet utfall:
  expectedDistance: number; // Forventet distanse for valgt modus (m)
  sigma: number; // ±1σ — presisjon
  apex: number; // Apex (m) — for stop-on-green
  deltaFromTarget: number; // expectedDistance − target (m)
  expectedStrokes: number | null; // fra SgBaseline (lavere = bedre)
  expectedSgVsBest: number | null; // sg-delta vs den beste i settet
  rank: number; // 1 = anbefalt
};

export type BaselineLookup = (params: {
  distanceM: number;
}) => number | null;

// Hjelpe: konverter m til "175-200y"-bucket (yard) for SgBaseline-oppslag.
function distanceBucketY(distanceM: number): string {
  const yards = distanceM * 1.0936;
  const start = Math.floor(yards / 25) * 25;
  return `${start}-${start + 25}y`;
}

export function bucketForDistance(distanceM: number): string {
  return distanceBucketY(distanceM);
}

// Build candidates innenfor ±toleranse av target.
// `targetM` er mål-distansen i meter.
// `lookupBaseline` slår opp expected-strokes for en gitt distanse (fra SgBaseline).
export function buildStrategy(
  rows: YardageRow[],
  targetM: number,
  toleranceM = 10,
  lookupBaseline?: BaselineLookup,
): StrategyOption[] {
  const candidates: StrategyOption[] = [];

  for (const r of rows) {
    if (r.family === "putter") continue;
    const fullDelta = Math.abs(r.totalAvg - targetM);
    const threeDelta = Math.abs(r.threeQuarter - targetM);
    const softDelta = Math.abs(r.soft - targetM);

    const best = Math.min(fullDelta, threeDelta, softDelta);
    if (best > toleranceM) continue;

    const mode: StrategyOption["mode"] =
      best === fullDelta
        ? "full"
        : best === threeDelta
          ? "three-quarter"
          : "soft";

    const expectedDistance =
      mode === "full"
        ? r.totalAvg
        : mode === "three-quarter"
          ? r.threeQuarter
          : r.soft;

    // σ skalere med modus — soft-slag er mer kontrollerte men gir lavere sigma proporsjonalt
    const modeSigma =
      mode === "full"
        ? r.totalSigma
        : mode === "three-quarter"
          ? r.totalSigma * 0.85
          : r.totalSigma * 0.78;

    const expectedStrokes = lookupBaseline
      ? lookupBaseline({ distanceM: targetM })
      : null;

    candidates.push({
      club: r.club,
      family: r.family,
      mode,
      expectedDistance,
      sigma: Math.round(modeSigma * 10) / 10,
      apex: r.apex,
      deltaFromTarget: Math.round((expectedDistance - targetM) * 10) / 10,
      expectedStrokes,
      expectedSgVsBest: null,
      rank: 0,
    });
  }

  // Rangér: lavere σ = bedre, mer apex = bedre stop-on-green (vekt for wedge/iron).
  // Hvis vi har SgBaseline-data, bruk den som primær sorter.
  const scored = candidates.map((c) => ({
    candidate: c,
    score: scoreOption(c, targetM),
  }));

  scored.sort((a, b) => a.score - b.score);

  // Beregn SG-delta vs beste alternativ
  const bestStrokes = scored[0]?.candidate.expectedStrokes ?? null;
  scored.forEach((s, i) => {
    s.candidate.rank = i + 1;
    if (s.candidate.expectedStrokes != null && bestStrokes != null) {
      s.candidate.expectedSgVsBest =
        Math.round((bestStrokes - s.candidate.expectedStrokes) * 100) / 100;
    }
  });

  return scored.slice(0, 4).map((s) => s.candidate);
}

// Lavere score = bedre kandidat.
function scoreOption(opt: StrategyOption, targetM: number): number {
  // 1) Avvik fra mål — lavere er bedre
  const distancePenalty = Math.abs(opt.deltaFromTarget);

  // 2) σ — lavere er bedre
  const sigmaPenalty = opt.sigma * 0.5;

  // 3) Apex — wedge/iron med høyere apex får liten bonus (stop-on-green)
  const apexBonus =
    opt.family === "wedge" || opt.family === "iron"
      ? -opt.apex * 0.05
      : 0;

  // 4) Foretrukket modus: full > 3/4 > soft (mer reproduserbart)
  const modePenalty =
    opt.mode === "full" ? 0 : opt.mode === "three-quarter" ? 1.5 : 3;

  // 5) Hvis vi har SG-baseline-data, vekt det høyt
  const sgPenalty =
    opt.expectedStrokes != null ? opt.expectedStrokes * 2 : 0;

  // 6) Justering for distanse fra target
  const _ = targetM;

  return distancePenalty + sigmaPenalty + apexBonus + modePenalty + sgPenalty;
}

// Slå opp expected-strokes fra et SgBaseline-array.
// Brukes som BaselineLookup fra side-koden.
export function makeBaselineLookup(
  baselines: { distanceBucket: string; expectedStrokes: number }[],
): BaselineLookup {
  const byBucket = new Map(
    baselines.map((b) => [b.distanceBucket, b.expectedStrokes]),
  );
  return ({ distanceM }) => {
    const bucket = bucketForDistance(distanceM);
    return byBucket.get(bucket) ?? null;
  };
}
