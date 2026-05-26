// Tempo / Rhythm Analysis (Phase 6 — feature #6 i SG Coaching Hub).
//
// Bruker tempo-data fra TrackMan CSV-eksport. HTML-rapporter inneholder IKKE
// tempo — kun CSV. Hvis tempo mangler returneres `hasData: false` og UI viser
// fallback-melding.
//
// Tempo-ratio = backswingTime / downswingTime. Optimal ratio er 3:1.
// Variasjon (σ av ratio) > 5% av snittet flagges som inkonsistent.

import type { ShotData } from "./extract-shots";

export type TempoZone = "GREEN" | "YELLOW" | "RED";

export type TempoPoint = {
  shotNumber: number;
  ratio: number;
  zone: TempoZone;
  smashFactor: number;
};

export type TempoResult = {
  hasData: boolean;
  points: TempoPoint[];
  avgRatio: number;
  sigmaRatio: number;
  variancePct: number; // (σ / snitt) × 100
  consistencyPct: number; // % grønne slag
};

export const TEMPO_ZONE_COLORS: Record<TempoZone, string> = {
  GREEN: "hsl(var(--primary))",
  YELLOW: "hsl(var(--accent))",
  RED: "hsl(var(--destructive))",
};

export const TEMPO_OPTIMAL_RATIO = 3.0;

// Klassifisering: avstand fra snittet i prosent.
// |delta| < 5% → grønn, < 10% → gul, ellers rød.
function classifyTempo(ratio: number, avg: number): TempoZone {
  if (avg <= 0) return "RED";
  const deltaPct = Math.abs((ratio - avg) / avg) * 100;
  if (deltaPct < 5) return "GREEN";
  if (deltaPct < 10) return "YELLOW";
  return "RED";
}

export function computeTempo(shots: ShotData[]): TempoResult {
  const valid = shots.filter(
    (s) =>
      typeof s.backswingTime === "number" &&
      typeof s.downswingTime === "number" &&
      s.backswingTime > 0 &&
      s.downswingTime > 0,
  );

  if (valid.length === 0) {
    return {
      hasData: false,
      points: [],
      avgRatio: 0,
      sigmaRatio: 0,
      variancePct: 0,
      consistencyPct: 0,
    };
  }

  const ratios = valid.map(
    (s) => (s.backswingTime as number) / (s.downswingTime as number),
  );
  const avgRatio = ratios.reduce((s, r) => s + r, 0) / ratios.length;
  const sigmaRatio = Math.sqrt(
    ratios.reduce((s, r) => s + (r - avgRatio) ** 2, 0) / ratios.length,
  );
  const variancePct = avgRatio > 0 ? (sigmaRatio / avgRatio) * 100 : 0;

  const points: TempoPoint[] = valid.map((s, i) => ({
    shotNumber: s.shotNumber,
    ratio: Math.round(ratios[i] * 100) / 100,
    zone: classifyTempo(ratios[i], avgRatio),
    smashFactor: s.smashFactor,
  }));

  const green = points.filter((p) => p.zone === "GREEN").length;
  const consistencyPct = Math.round((green / points.length) * 100);

  return {
    hasData: true,
    points,
    avgRatio: Math.round(avgRatio * 100) / 100,
    sigmaRatio: Math.round(sigmaRatio * 1000) / 1000,
    variancePct: Math.round(variancePct * 10) / 10,
    consistencyPct,
  };
}
