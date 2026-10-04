/**
 * Beregninger og typer for PH-20 Gameplan og banekart.
 * Fasit: Claude Design PH-20 (AK Golf Precision Athletics).
 * Inneholder:
 * - Kølleprofiler for utslag med carry, lateral spredning (hw) og lengdespredning (ry).
 * - Geometri-generator (bunkere og vannhindre).
 * - Slagvalg-alternativer basert på par og hulllengde.
 * - Risiko-analyse for spredningsellipse mot hindre.
 * - Optimalisering av køllevalg fra tee.
 */

export interface ClubSpec {
  carry: number;
  hw: number; // Halvbredde spredning i meter (lateral)
  ry: number; // Lengdespredning i meter
}

export const TEE_CLUBS: Record<string, ClubSpec> = {
  Driver: { carry: 228, hw: 14, ry: 12 },
  "3W": { carry: 201, hw: 11, ry: 10 },
  "4H": { carry: 178, hw: 9, ry: 9 },
  "5i": { carry: 168, hw: 8, ry: 8 },
  "6i": { carry: 160, hw: 7, ry: 7 },
  "7i": { carry: 150, hw: 6, ry: 6 },
  "8i": { carry: 139, hw: 6, ry: 6 },
  "9i": { carry: 128, hw: 5, ry: 5 },
  PW: { carry: 113, hw: 5, ry: 5 },
};

export interface BunkerDef {
  d: number; // Distanse fra tee i meter
  off: number; // Avvik fra senterlinje i meter (+ er høyre, - er venstre)
  r: number; // Radius i meter
}

export interface WaterDef {
  from: number;
  to: number;
  off: number;
}

export interface HoleGeometry {
  bunkers: BunkerDef[];
  water: WaterDef | null;
}

/** Genererer parametrisk geometri for et hull basert på indeks og lengde. */
export function getHoleGeo(i: number, len: number): HoleGeometry {
  const bunkers: BunkerDef[] = [
    { d: 225 + ((i * 7) % 30), off: 16, r: 8 },
    { d: 195 + ((i * 11) % 25), off: -18, r: 7 },
    { d: len - 8, off: 13, r: 6 },
    { d: len - 14, off: -12, r: 5 },
  ].filter((b) => b.d < len - 2 && b.d > 120);

  const water: WaterDef | null =
    i % 5 === 3 ? { from: len * 0.35, to: len * 0.6, off: -26 } : null;

  return { bunkers, water };
}

/** Finner tilgjengelige køllevalg fra tee for et hull. */
export function getClubOptions(par: number, len: number): string[] {
  if (par === 3) {
    return Object.entries(TEE_CLUBS)
      .filter(([c]) => c !== "Driver" && c !== "3W")
      .sort((a, b) => Math.abs(a[1].carry - len) - Math.abs(b[1].carry - len))
      .slice(0, 3)
      .map(([c]) => c);
  }
  return ["Driver", "3W", "4H"];
}

/** Beregner risiko i prosent for at slaget havner i bunker eller vann. */
export function computeRiskPercent(clubName: string, g: HoleGeometry): number {
  const spec = TEE_CLUBS[clubName];
  if (!spec) return 0;
  const { carry, hw, ry } = spec;

  let r = 0;
  for (const b of g.bunkers) {
    const dl = Math.abs(b.d - carry);
    const lat = Math.abs(b.off) - b.r;
    if (dl < ry + b.r && lat < hw) {
      r = Math.max(r, ((hw - lat) / (2 * hw)) * (1 - dl / (ry + b.r)));
    }
  }

  if (
    g.water &&
    carry > g.water.from - ry &&
    carry < g.water.to + ry &&
    Math.abs(g.water.off) - 6 < hw
  ) {
    r = Math.max(r, 0.25);
  }

  return Math.round(r * 100);
}

export interface ScoredClubOption {
  club: string;
  carry: number;
  riskPercent: number;
  remainingMeters: number;
  score: number;
}

/** Evaluerer køllevalg for et hull og rangerer etter optimal balanse mellom risiko og posisjon. */
export function evaluateClubOptions(
  par: number,
  len: number,
  options: string[],
  geo: HoleGeometry,
): { scored: ScoredClubOption[]; recommended: string } {
  const scored: ScoredClubOption[] = options.map((club) => {
    const spec = TEE_CLUBS[club] ?? { carry: len, hw: 6, ry: 6 };
    const r = computeRiskPercent(club, geo);
    const remainingMeters = Math.max(0, len - spec.carry);
    const score =
      r * 2 +
      (par === 3
        ? Math.abs(remainingMeters)
        : Math.abs(remainingMeters - (par === 5 ? 230 : 120)) / 4);

    return {
      club,
      carry: spec.carry,
      riskPercent: r,
      remainingMeters,
      score,
    };
  });

  const recommended =
    scored.length > 0
      ? scored.reduce((best, curr) => (curr.score < best.score ? curr : best)).club
      : "Driver";

  return { scored, recommended };
}

/** Beregner standard plan (anbefalt kølle) for et gitt hull. */
export function getRecommendedClub(i: number, par: number, len: number): string {
  const geo = getHoleGeo(i, len);
  const opts = getClubOptions(par, len);
  return evaluateClubOptions(par, len, opts, geo).recommended;
}

export interface GameplanCourseItem {
  id: string;
  name: string;
  tee: string;
  par: number;
  len: number;
  played: number;
  avg: number | null;
  plan: string;
  holes: {
    par: number;
    len: number;
    avgScoreDiff: number;
  }[];
}
