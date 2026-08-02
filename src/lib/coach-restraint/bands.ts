// Personlige feilbånd — grunnlaget for bandwidth-feedback (Sherwood 1988;
// Smith, Taylor & Withers 1997 [golf]): AI-en kommenterer KUN når et avvik er
// utenfor spillerens eget bånd, og båndet krymper automatisk når spilleren blir
// mer konsistent (mindre stddev → smalere bånd).
//
// Beregnes on-demand fra slaghistorikk (ingen egen tabell): bånd = k·stddev av
// siste N slag, klampet mellom PARAM_THRESHOLDS-nivå 1 (gulv — aldri smalere
// enn beste stabilitetsnivå) og nivå 4 (tak — aldri videre enn verste).

import { PARAM_THRESHOLDS } from "@/lib/trackman/stabilitet";
import type { RestraintMetric } from "./shot-events";

export type PlayerBand = {
  metric: RestraintMetric;
  center: number; // spillerens snitt
  halfWidth: number; // avvik utover dette = kommentar-kandidat
  sampleSize: number;
};

export type MetricExceedance = {
  metric: RestraintMetric;
  value: number;
  center: number;
  halfWidth: number;
  /** Hvor mange halvbredder utenfor (1.0 = akkurat på grensen). */
  severity: number;
};

/** Minste antall slag før et bånd er meningsfullt (under → null, AI tier). */
export const MIN_SAMPLE = 8;

/** k i bånd = k·stddev. 1.5 ≈ kommenter på de ~13 % mest avvikende slagene. */
const BAND_K = 1.5;

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  const m = mean(values);
  const variance =
    values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function computePlayerBand(
  metric: RestraintMetric,
  history: number[],
  opts: { k?: number } = {},
): PlayerBand | null {
  if (history.length < MIN_SAMPLE) return null;
  const [floor, , , ceiling] = PARAM_THRESHOLDS[metric];
  const raw = (opts.k ?? BAND_K) * stddev(history);
  return {
    metric,
    center: mean(history),
    halfWidth: Math.min(Math.max(raw, floor), ceiling),
    sampleSize: history.length,
  };
}

export function findExceedances(
  bands: PlayerBand[],
  metrics: Partial<Record<RestraintMetric, number>>,
): MetricExceedance[] {
  const out: MetricExceedance[] = [];
  for (const band of bands) {
    const value = metrics[band.metric];
    if (value === undefined) continue;
    const distance = Math.abs(value - band.center);
    if (distance > band.halfWidth) {
      out.push({
        metric: band.metric,
        value,
        center: band.center,
        halfWidth: band.halfWidth,
        severity: distance / band.halfWidth,
      });
    }
  }
  return out.sort((a, b) => b.severity - a.severity);
}
