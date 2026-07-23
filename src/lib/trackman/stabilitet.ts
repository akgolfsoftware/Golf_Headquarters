/**
 * TrackMan stabilitet — ren beregning (uten UI).
 * Brukes av stabilitets-seksjon og tester (E.03/E.06).
 */

import type { TrackManShot } from "@/lib/trackman/parse-csv";

// ── Typer ───────────────────────────────────────────────────────────────────

export type ParamKey = "carry" | "side" | "ballSpeed" | "launchAngle" | "spinRate" | "smash";

export type ParamStats = {
  stddev: number | null;
  mean: number | null;
  level: 1 | 2 | 3 | 4 | 5 | null;
};

export type ClubStabStats = {
  navn: string;
  antallSlag: number;
  params: Record<ParamKey, ParamStats>;
  stabilitetScore: number;
  biasType: "steady" | "bias" | "spread" | "both";
  meanSide: number;
  stddevSide: number;
};

export type StabilitetData = {
  klubber: ClubStabStats[];
  mestStødig: ClubStabStats | null;
  trengerJobbing: ClubStabStats | null;
  størsteForbedring: null; // krev historikk — vis ikke ennå
};

// ── Stabilitetsgrenser (stddev per parameter → 5-nivå skala) ────────────────
// Tersklene er representative for HCP 0-10 spiller. v=1=best, v=5=verst.

const PARAM_THRESHOLDS: Record<ParamKey, [number, number, number, number]> = {
  carry:       [4,   7,   10,  14],  // meter
  side:        [2.5, 5,   8,   11],  // meter
  ballSpeed:   [0.8, 1.5, 2.5, 3.5], // m/s
  launchAngle: [0.8, 1.5, 2.5, 3.5], // grader
  spinRate:    [200, 350, 500, 700],  // rpm
  smash:       [0.02, 0.04, 0.06, 0.09], // dimensjonsløs
};

const PARAMS: ParamKey[] = ["carry", "side", "ballSpeed", "launchAngle", "spinRate", "smash"];

// ── Statistikk-hjelpere ──────────────────────────────────────────────────────

function beregnStddev(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function beregnMean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function variansNivå(sd: number | null, thresholds: [number, number, number, number]): 1 | 2 | 3 | 4 | 5 | null {
  if (sd === null) return null;
  if (sd <= thresholds[0]) return 1;
  if (sd <= thresholds[1]) return 2;
  if (sd <= thresholds[2]) return 3;
  if (sd <= thresholds[3]) return 4;
  return 5;
}

function stabilitetsScore(params: Record<ParamKey, ParamStats>): number {
  const levels = PARAMS
    .map((k) => params[k].level)
    .filter((l): l is 1 | 2 | 3 | 4 | 5 => l !== null);
  if (levels.length === 0) return 0;
  const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
  return Math.max(1, Math.min(10, Math.round((11 - avgLevel * 1.8) * 10) / 10));
}

function biasType(
  meanSide: number | null,
  stddevSide: number | null,
): "steady" | "bias" | "spread" | "both" {
  const hasBias = meanSide !== null && Math.abs(meanSide) > 3;
  const hasSpread = stddevSide !== null && stddevSide > 7;
  if (hasBias && hasSpread) return "both";
  if (hasBias) return "bias";
  if (hasSpread) return "spread";
  return "steady";
}

// ── Hoved-databygger ─────────────────────────────────────────────────────────

function sjekkShot(s: unknown): s is TrackManShot {
  return typeof s === "object" && s !== null && "club" in s;
}

/** Strukturerte DB-slag (TrackManShot-tabell) → parser-format for stabilitet. */
export type StabilitetDbShot = {
  club: string;
  carryDistance: number | null;
  totalDistance: number | null;
  smashFactor: number | null;
  ballSpeed: number | null; // mph i DB
  launchAngle: number | null;
  spinRate: number | null;
  side: number | null;
  clubSpeed: number | null; // mph i DB
};

function dbShotsTilTrackMan(db: StabilitetDbShot[]): TrackManShot[] {
  return db.map((s) => ({
    club: s.club,
    clubSpeedMps: s.clubSpeed != null ? s.clubSpeed * 0.44704 : null,
    ballSpeedMps: s.ballSpeed != null ? s.ballSpeed * 0.44704 : null,
    smashFactor: s.smashFactor,
    carryMeters: s.carryDistance,
    totalMeters: s.totalDistance,
    launchAngleDeg: s.launchAngle,
    spinRateRpm: s.spinRate,
    sideMeters: s.side,
    notes: null,
  }));
}

/**
 * Beregn stabilitet fra rawJson.shots.
 * Fallback: strukturerte TrackManShot-rader når rawJson mangler/er svak (E.03).
 */
export function beregnStabilitet(
  rawJson: unknown,
  dbShots?: StabilitetDbShot[],
): StabilitetData {
  let shots = (
    typeof rawJson === "object" &&
    rawJson !== null &&
    "shots" in rawJson &&
    Array.isArray((rawJson as { shots: unknown }).shots)
      ? (rawJson as { shots: unknown[] }).shots
      : Array.isArray(rawJson)
        ? (rawJson as unknown[])
        : []
  ).filter(sjekkShot) as TrackManShot[];

  // E.03: bruk DB-slag hvis rawJson er tom/svak
  if (shots.length < 2 && dbShots && dbShots.length >= 2) {
    shots = dbShotsTilTrackMan(dbShots);
  }

  // Grupper slag per kølle
  const klubbMap = new Map<string, TrackManShot[]>();
  for (const shot of shots) {
    const navn = shot.club?.trim() || "Ukjent";
    if (!klubbMap.has(navn)) klubbMap.set(navn, []);
    klubbMap.get(navn)!.push(shot);
  }

  const klubber: ClubStabStats[] = [];

  for (const [navn, klubbShots] of klubbMap.entries()) {
    const shotMap: Record<ParamKey, number[]> = {
      carry:       klubbShots.map((s) => s.carryMeters).filter((n): n is number => n !== null),
      side:        klubbShots.map((s) => s.sideMeters).filter((n): n is number => n !== null),
      ballSpeed:   klubbShots.map((s) => s.ballSpeedMps).filter((n): n is number => n !== null),
      launchAngle: klubbShots.map((s) => s.launchAngleDeg).filter((n): n is number => n !== null),
      spinRate:    klubbShots.map((s) => s.spinRateRpm).filter((n): n is number => n !== null),
      smash:       klubbShots.map((s) => s.smashFactor).filter((n): n is number => n !== null),
    };

    const params = Object.fromEntries(
      PARAMS.map((key) => {
        const vals = shotMap[key];
        const sd = beregnStddev(vals);
        const mean = beregnMean(vals);
        return [key, { stddev: sd, mean, level: variansNivå(sd, PARAM_THRESHOLDS[key]) }];
      }),
    ) as Record<ParamKey, ParamStats>;

    const sideVals = shotMap.side;
    const meanSide = beregnMean(sideVals);
    const stddevSide = beregnStddev(sideVals) ?? 0;

    klubber.push({
      navn,
      antallSlag: klubbShots.length,
      params,
      stabilitetScore: stabilitetsScore(params),
      biasType: biasType(meanSide, stddevSide),
      meanSide: meanSide ?? 0,
      stddevSide,
    });
  }

  // Sorter etter carry (høyeste carry = lengste kølle = øverst i heatmap)
  klubber.sort((a, b) => {
    const ac = a.params.carry.mean ?? 0;
    const bc = b.params.carry.mean ?? 0;
    return bc - ac;
  });

  const mestStødig =
    klubber.filter((k) => k.antallSlag >= 3).sort((a, b) => b.stabilitetScore - a.stabilitetScore)[0] ?? null;

  const trengerJobbing =
    klubber.filter((k) => k.antallSlag >= 3).sort((a, b) => a.stabilitetScore - b.stabilitetScore)[0] ?? null;

  return { klubber, mestStødig, trengerJobbing, størsteForbedring: null };
}

