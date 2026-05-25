/**
 * SG estimator — konverter mellom HCP, norsk snittscore, og PGA Tour-ekvivalent.
 *
 * Bygger på Broadie (2014) "Every Shot Counts" HCP-stratifiserte tall.
 * Disse er publiserte estimater, ikke per-spiller-eksakt, men gir et
 * nyttig "ballpark"-estimat for sammenligning mot PGA Tour.
 *
 * BRUK:
 *   - hcpFromAvgScore(75) → ca 5.0
 *   - tourEquivalentScore(75) → ca 79 (norsk amatør med snitt 75 ≈ 79 på PGA-bane)
 *   - sammenlignMedRef(brukerSg, refSpillerSg) → SG-diff per kategori
 */

// ---------------------------------------------------------------------------
// Broadie HCP-tabell (forenklet, basert på "Every Shot Counts" Tabell 1.1 + 5.1)
//
// Forutsetninger:
//   - Standard PGA Tour-bane (par 72, lengde ~7 200 yds)
//   - Avg score for PGA Tour = ~70.5
//   - Negativ SG = dårligere enn Tour-snitt
// ---------------------------------------------------------------------------

export type BroadieRow = {
  hcp: number;
  avgScore: number;     // forventet brutto score på standard bane
  sgTotal: number;      // totalt SG vs Tour-snitt (per runde, negativt for amatører)
  sgOttPct: number;     // fordeling i % (0-100)
  sgAppPct: number;
  sgArgPct: number;
  sgPuttPct: number;
};

export const BROADIE_HCP_TABLE: BroadieRow[] = [
  // PGA Tour-baseline
  { hcp: -3, avgScore: 70.5, sgTotal: 0,    sgOttPct: 28, sgAppPct: 38, sgArgPct: 17, sgPuttPct: 17 },
  // Scratch
  { hcp: 0,  avgScore: 72.4, sgTotal: -2.0, sgOttPct: 25, sgAppPct: 35, sgArgPct: 20, sgPuttPct: 20 },
  // Lavt enkeltsiffer
  { hcp: 5,  avgScore: 80.4, sgTotal: -10,  sgOttPct: 22, sgAppPct: 35, sgArgPct: 22, sgPuttPct: 21 },
  { hcp: 10, avgScore: 86.5, sgTotal: -16,  sgOttPct: 20, sgAppPct: 36, sgArgPct: 23, sgPuttPct: 21 },
  { hcp: 15, avgScore: 92.7, sgTotal: -22,  sgOttPct: 19, sgAppPct: 37, sgArgPct: 23, sgPuttPct: 21 },
  { hcp: 20, avgScore: 98.8, sgTotal: -28,  sgOttPct: 18, sgAppPct: 38, sgArgPct: 24, sgPuttPct: 20 },
  { hcp: 25, avgScore: 105,  sgTotal: -34,  sgOttPct: 17, sgAppPct: 39, sgArgPct: 24, sgPuttPct: 20 },
];

// ---------------------------------------------------------------------------
// HCP <-> snittscore-konvertering
// ---------------------------------------------------------------------------

/**
 * Estimer HCP fra gjennomsnittlig brutto-score.
 * Bruker linear interpolasjon mellom Broadie-radene.
 */
export function hcpFromAvgScore(avgScore: number): number {
  if (avgScore <= 70.5) return -3;

  const sortert = [...BROADIE_HCP_TABLE].sort((a, b) => a.avgScore - b.avgScore);
  for (let i = 0; i < sortert.length - 1; i++) {
    const a = sortert[i];
    const b = sortert[i + 1];
    if (avgScore >= a.avgScore && avgScore <= b.avgScore) {
      const t = (avgScore - a.avgScore) / (b.avgScore - a.avgScore);
      return a.hcp + t * (b.hcp - a.hcp);
    }
  }

  const last = sortert[sortert.length - 1];
  return last.hcp + (avgScore - last.avgScore) * 0.85;
}

/**
 * Forventet brutto-score gitt HCP.
 */
export function avgScoreFromHcp(hcp: number): number {
  const sortert = [...BROADIE_HCP_TABLE].sort((a, b) => a.hcp - b.hcp);
  for (let i = 0; i < sortert.length - 1; i++) {
    const a = sortert[i];
    const b = sortert[i + 1];
    if (hcp >= a.hcp && hcp <= b.hcp) {
      const t = (hcp - a.hcp) / (b.hcp - a.hcp);
      return a.avgScore + t * (b.avgScore - a.avgScore);
    }
  }
  if (hcp < sortert[0].hcp) return sortert[0].avgScore;
  const last = sortert[sortert.length - 1];
  return last.avgScore + (hcp - last.hcp) * 1.18;
}

// ---------------------------------------------------------------------------
// PGA Tour-ekvivalent score
// ---------------------------------------------------------------------------

/**
 * Norsk snittscore → estimert score på en PGA Tour-bane.
 *
 * Bruker WHS-stilen score differential + slope-justering:
 *   diff = (norskSnitt - norskCR) * 113 / norskSlope
 *   tourHcp = diff * pgaSlope / 113
 *   tourScore = pgaCR + tourHcp
 */
export function tourEquivalentScore(
  norskSnitt: number,
  options: { norskSlope?: number; norskCr?: number; pgaSlope?: number; pgaCr?: number } = {},
): { tourScore: number; hcp: number; tourHcp: number } {
  const norskSlope = options.norskSlope ?? 125;
  const norskCr = options.norskCr ?? 71;
  const pgaSlope = options.pgaSlope ?? 145;
  const pgaCr = options.pgaCr ?? 74.5;

  const hcp = hcpFromAvgScore(norskSnitt);
  const diff = (norskSnitt - norskCr) * (113 / norskSlope);
  const tourHcp = diff * (pgaSlope / 113);
  const tourScore = pgaCr + tourHcp;

  return {
    tourScore: Math.round(tourScore * 10) / 10,
    hcp: Math.round(hcp * 10) / 10,
    tourHcp: Math.round(tourHcp * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// SG-sammenligning mot referansespiller
// ---------------------------------------------------------------------------

export type SgFordeling = {
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
  sgTotal: number | null;
};

export type SgSammenligning = {
  diff: {
    ott: number | null;     // ref − bruker (positiv = ref er bedre)
    app: number | null;
    arg: number | null;
    putt: number | null;
    total: number | null;
  };
  storsteGap: { kategori: "ott" | "app" | "arg" | "putt"; diff: number } | null;
};

export function sammenlignMedReferanse(
  bruker: SgFordeling,
  ref: SgFordeling,
): SgSammenligning {
  const subDiff = (
    r: number | null | undefined,
    b: number | null | undefined,
  ): number | null => {
    if (r == null || b == null) return null;
    return r - b;
  };

  const diff = {
    ott: subDiff(ref.sgOtt, bruker.sgOtt),
    app: subDiff(ref.sgApp, bruker.sgApp),
    arg: subDiff(ref.sgArg, bruker.sgArg),
    putt: subDiff(ref.sgPutt, bruker.sgPutt),
    total: subDiff(ref.sgTotal, bruker.sgTotal),
  };

  const categoriesDiff = [
    { kategori: "ott" as const, diff: diff.ott },
    { kategori: "app" as const, diff: diff.app },
    { kategori: "arg" as const, diff: diff.arg },
    { kategori: "putt" as const, diff: diff.putt },
  ].filter((c): c is { kategori: "ott" | "app" | "arg" | "putt"; diff: number } => c.diff !== null);

  const storsteGap = categoriesDiff.length > 0
    ? categoriesDiff.reduce((max, c) => (Math.abs(c.diff) > Math.abs(max.diff) ? c : max))
    : null;

  return { diff, storsteGap };
}

// ---------------------------------------------------------------------------
// Estimer SG-fordeling fra snittscore (når bruker ikke har egen SG-data)
// ---------------------------------------------------------------------------

export function estimerSgFordelingFraSnitt(snittScore: number): SgFordeling {
  const hcp = hcpFromAvgScore(snittScore);

  const sortert = [...BROADIE_HCP_TABLE].sort(
    (a, b) => Math.abs(a.hcp - hcp) - Math.abs(b.hcp - hcp),
  );
  const row = sortert[0];

  return {
    sgTotal: row.sgTotal,
    sgOtt: (row.sgTotal * row.sgOttPct) / 100,
    sgApp: (row.sgTotal * row.sgAppPct) / 100,
    sgArg: (row.sgTotal * row.sgArgPct) / 100,
    sgPutt: (row.sgTotal * row.sgPuttPct) / 100,
  };
}
