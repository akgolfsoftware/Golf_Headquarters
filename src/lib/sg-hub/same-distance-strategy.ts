// Same-Distance Strategy.
// For en gitt mål-distanse, finn alle køller som kan dekke distansen og
// rangér etter presisjon (σ), avvik fra mål, apex og modus.
//
// SEMANTIKK-RETTELSE (AP0.2, 2026-08-16): SgBaseline-verdien er DataGolf
// `sg_gained` — PGA-snittets SG per slag fra distansen (HØYERE = bedre),
// IKKE «forventet antall slag». Feltet het `expectedStrokes` her og ble
// dokumentert «lavere = bedre»; det ga feil fortegn i visning. Verdien er
// dessuten identisk for alle kandidater (oppslaget bruker mål-distansen,
// som er felles), så den kan aldri skille køller — den er KONTEKST
// («touren snitter +0,02 SG herfra»), ikke rangeringsgrunnlag. Det gamle
// `expectedSgVsBest`-feltet var derfor alltid 0/null og er fjernet.

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
  tourSgSnitt: number | null; // DataGolf approach-skill: PGA-snittets SG fra mål-distansen (høyere = bedre). Kontekst, felles for alle kandidatene.
  rank: number; // 1 = anbefalt
};

/** Slår opp PGA-snittets SG (sg_gained) for en distanse — se semantikk-notatet over. */
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

    const tourSgSnitt = lookupBaseline
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
      tourSgSnitt,
      rank: 0,
    });
  }

  // Rangér: lavere σ = bedre, mer apex = bedre stop-on-green (vekt for wedge/iron).
  const scored = candidates.map((c) => ({
    candidate: c,
    score: scoreOption(c),
  }));

  scored.sort((a, b) => a.score - b.score);
  scored.forEach((s, i) => {
    s.candidate.rank = i + 1;
  });

  return scored.slice(0, 4).map((s) => s.candidate);
}

// Lavere score = bedre kandidat.
// NB: baseline-verdien (tourSgSnitt) inngår BEVISST ikke — den er lik for
// alle kandidatene (samme mål-distanse) og kan aldri skille dem. Den gamle
// `expectedStrokes * 2`-straffen var derfor et konstant ledd uten effekt på
// rangeringen — fjernet 2026-08-16 (AP0.2), rangeringen er uendret.
function scoreOption(opt: StrategyOption): number {
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

  return distancePenalty + sigmaPenalty + apexBonus + modePenalty;
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
