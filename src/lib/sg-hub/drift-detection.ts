// Cross-Session Drift Detection — lineær regresjon over 12 uker per metrikk
// per kølle. Bruker ClubMetricTrend som input.
//
// Terskler (per uke):
//   - Club Path:      0.20 °/uke
//   - Face Angle:     0.15 °/uke
//   - Total Distance: 0.50 m/uke

import { prisma } from "@/lib/prisma";

export type DriftMetric = "clubPath" | "faceAngle" | "totalDistance";

export type DriftTrendPoint = {
  weekStart: string; // ISO-string (lett å serialisere til klient)
  value: number;
  shotCount: number;
};

export type DriftAlert = {
  club: string;
  metric: DriftMetric;
  slopePerWeek: number; // signert helning
  magnitude: number; // |slope|
  threshold: number;
  weeks: number; // antall uker brukt
  direction: "up" | "down";
  trend: DriftTrendPoint[];
};

const TWELVE_WEEKS_MS = 12 * 7 * 24 * 60 * 60 * 1000;
const MIN_WEEKS = 4;

const METRICS: ReadonlyArray<{
  key: DriftMetric;
  field: "avgClubPath" | "avgFaceAngle" | "avgTotal";
  threshold: number;
}> = [
  { key: "clubPath", field: "avgClubPath", threshold: 0.2 },
  { key: "faceAngle", field: "avgFaceAngle", threshold: 0.15 },
  { key: "totalDistance", field: "avgTotal", threshold: 0.5 },
];

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

type TrendRow = {
  club: string;
  weekStart: Date;
  avgClubPath: number;
  avgFaceAngle: number;
  avgTotal: number;
  shotCount: number;
};

async function fetchTrends(userId: string): Promise<TrendRow[]> {
  const since = new Date(Date.now() - TWELVE_WEEKS_MS);
  const rows = await prisma.clubMetricTrend.findMany({
    where: { userId, weekStart: { gte: since } },
    orderBy: [{ club: "asc" }, { weekStart: "asc" }],
    select: {
      club: true,
      weekStart: true,
      avgClubPath: true,
      avgFaceAngle: true,
      avgTotal: true,
      shotCount: true,
    },
  });
  return rows;
}

// Eksportert wrapper for testing/page-bruk.
export async function getClubTrend(
  userId: string,
  club: string
): Promise<{ weekStart: Date; avgClubPath: number; avgFaceAngle: number; avgTotal: number; shotCount: number }[]> {
  const since = new Date(Date.now() - TWELVE_WEEKS_MS);
  return prisma.clubMetricTrend.findMany({
    where: { userId, club, weekStart: { gte: since } },
    orderBy: { weekStart: "asc" },
    select: {
      weekStart: true,
      avgClubPath: true,
      avgFaceAngle: true,
      avgTotal: true,
      shotCount: true,
    },
  });
}

export async function detectDrift(userId: string): Promise<DriftAlert[]> {
  const rows = await fetchTrends(userId);
  if (rows.length === 0) return [];

  // Grupper på kølle
  const byClub = new Map<string, TrendRow[]>();
  for (const r of rows) {
    const list = byClub.get(r.club) ?? [];
    list.push(r);
    byClub.set(r.club, list);
  }

  const alerts: DriftAlert[] = [];

  for (const [club, trend] of byClub) {
    if (trend.length < MIN_WEEKS) continue;

    // Normaliser X til antall uker fra første punkt (slope = enhet per uke).
    const t0 = trend[0].weekStart.getTime();
    const xs = trend.map(
      (t) => (t.weekStart.getTime() - t0) / (7 * 24 * 60 * 60 * 1000)
    );

    for (const m of METRICS) {
      const ys = trend.map((t) => t[m.field]);
      const slope = linearRegressionSlope(xs, ys);
      const magnitude = Math.abs(slope);
      if (magnitude < m.threshold) continue;

      alerts.push({
        club,
        metric: m.key,
        slopePerWeek: Math.round(slope * 1000) / 1000,
        magnitude: Math.round(magnitude * 1000) / 1000,
        threshold: m.threshold,
        weeks: trend.length,
        direction: slope > 0 ? "up" : "down",
        trend: trend.map((t) => ({
          weekStart: t.weekStart.toISOString(),
          value: Math.round(t[m.field] * 100) / 100,
          shotCount: t.shotCount,
        })),
      });
    }
  }

  alerts.sort((a, b) => b.magnitude / b.threshold - a.magnitude / a.threshold);
  return alerts;
}
