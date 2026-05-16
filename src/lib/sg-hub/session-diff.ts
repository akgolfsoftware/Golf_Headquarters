// Beregn aggregat-metrikker per økt og sammenligning mot "beste økt".
// Brukes av /portal/mal/sg-hub/best-vs-now.

import { extractShots, extractClubs, type ShotData } from "./extract-shots";

export type SessionMetricKey =
  | "clubSpeed"
  | "ballSpeed"
  | "smashFactor"
  | "totalDistance"
  | "clubPath"
  | "faceAngle"
  | "sigmaDistance";

export type SessionMetric = {
  key: SessionMetricKey;
  label: string;
  unit: string;
  value: number;
  decimals: number;
  // higher: høyere verdi = bedre. lower: lavere absolutt verdi = bedre.
  // neutral: ingen retning (vises uten farge).
  direction: "higher" | "lower-abs" | "lower";
};

export type SessionMetricDiff = SessionMetric & {
  best: number;
  delta: number; // value - best
  betterThanBest: boolean;
};

export type SessionSummary = {
  sessionId: string;
  recordedAt: Date;
  shotCount: number;
  clubs: string[];
  metrics: SessionMetric[];
};

const METRIC_DEFS: Array<{
  key: SessionMetricKey;
  label: string;
  unit: string;
  decimals: number;
  direction: SessionMetric["direction"];
}> = [
  { key: "clubSpeed", label: "Club Speed", unit: "mph", decimals: 1, direction: "higher" },
  { key: "ballSpeed", label: "Ball Speed", unit: "mph", decimals: 1, direction: "higher" },
  { key: "smashFactor", label: "Smash Factor", unit: "", decimals: 2, direction: "higher" },
  { key: "totalDistance", label: "Total Distance", unit: "m", decimals: 1, direction: "higher" },
  { key: "clubPath", label: "Club Path", unit: "°", decimals: 2, direction: "lower-abs" },
  { key: "faceAngle", label: "Face Angle", unit: "°", decimals: 2, direction: "lower-abs" },
  { key: "sigmaDistance", label: "Distanse σ", unit: "m", decimals: 1, direction: "lower" },
];

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function round(v: number, decimals: number): number {
  const mult = Math.pow(10, decimals);
  return Math.round(v * mult) / mult;
}

function collectShots(rawJson: unknown): ShotData[] {
  const clubs = extractClubs(rawJson);
  const all: ShotData[] = [];
  for (const c of clubs) {
    all.push(...extractShots(rawJson, c));
  }
  return all.filter((s) => s.clubSpeed > 0 || s.totalDistance > 0);
}

export function summarizeSession(input: {
  id: string;
  recordedAt: Date;
  rawJson: unknown;
}): SessionSummary {
  const shots = collectShots(input.rawJson);
  const clubs = extractClubs(input.rawJson);

  const valuesByKey: Record<SessionMetricKey, number> = {
    clubSpeed: round(mean(shots.map((s) => s.clubSpeed).filter((v) => v > 0)), 1),
    ballSpeed: round(mean(shots.map((s) => s.ballSpeed).filter((v) => v > 0)), 1),
    smashFactor: round(
      mean(shots.map((s) => s.smashFactor).filter((v) => v > 0)),
      2
    ),
    totalDistance: round(
      mean(shots.map((s) => s.totalDistance).filter((v) => v > 0)),
      1
    ),
    clubPath: round(mean(shots.map((s) => s.clubPath)), 2),
    faceAngle: round(mean(shots.map((s) => s.faceAngle)), 2),
    sigmaDistance: round(
      stdDev(shots.map((s) => s.totalDistance).filter((v) => v > 0)),
      1
    ),
  };

  const metrics: SessionMetric[] = METRIC_DEFS.map((def) => ({
    key: def.key,
    label: def.label,
    unit: def.unit,
    decimals: def.decimals,
    direction: def.direction,
    value: valuesByKey[def.key],
  }));

  return {
    sessionId: input.id,
    recordedAt: input.recordedAt,
    shotCount: shots.length,
    clubs,
    metrics,
  };
}

// betterThan: er `value` strengt bedre enn `best` for gitt retning?
function isBetter(
  value: number,
  best: number,
  direction: SessionMetric["direction"]
): boolean {
  if (direction === "higher") return value > best;
  if (direction === "lower") return value < best;
  // lower-abs: nærmere null er bedre
  return Math.abs(value) < Math.abs(best);
}

export function diffSessions(
  best: SessionSummary,
  current: SessionSummary
): {
  metrics: SessionMetricDiff[];
  improvedCount: number;
  shouldSuggestNewBest: boolean;
} {
  const metrics: SessionMetricDiff[] = current.metrics.map((cur) => {
    const bestMetric = best.metrics.find((m) => m.key === cur.key);
    const bestValue = bestMetric?.value ?? 0;
    const delta = round(cur.value - bestValue, cur.decimals);
    const better = isBetter(cur.value, bestValue, cur.direction);
    return {
      ...cur,
      best: bestValue,
      delta,
      betterThanBest: better,
    };
  });

  const improvedCount = metrics.filter((m) => m.betterThanBest).length;

  return {
    metrics,
    improvedCount,
    shouldSuggestNewBest: improvedCount >= 3,
  };
}
