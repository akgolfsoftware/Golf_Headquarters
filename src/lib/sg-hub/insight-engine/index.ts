// SG Hub Insight Engine.
// Kjøres daglig 04:00 UTC via /api/cron/[agent] (agent = "sg-insights").

import { prisma } from "@/lib/prisma";
import type { InsightCategory } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { extractShots, extractClubs } from "@/lib/sg-hub/extract-shots";
import { computeStrikePattern } from "@/lib/sg-hub/strike-pattern";
import { computeTempo } from "@/lib/sg-hub/tempo";

type EvaluatorResult = {
  category: InsightCategory;
  severity: number;
  title: string;
  body: string;
  payload: Prisma.InputJsonObject;
} | null;

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TWELVE_WEEKS_MS = 12 * 7 * 24 * 60 * 60 * 1000;

async function getSessions(userId: string) {
  return prisma.trackManSession.findMany({
    where: {
      userId,
      recordedAt: { gte: new Date(Date.now() - NINETY_DAYS_MS) },
    },
    select: { rawJson: true, recordedAt: true },
  });
}

// Phase 6: Distance Gapping — analyser per-kølle distanse-mellomrom.
// Flagg gaps > 15 yards mellom etterfølgende køller (sortert etter snittdistanse).
async function evaluateDistanceGapping(userId: string): Promise<EvaluatorResult> {
  const sessions = await getSessions(userId);
  if (sessions.length === 0) return null;

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }

  type ClubAvg = { club: string; avgYards: number; shots: number };
  const avgs: ClubAvg[] = [];

  for (const club of clubSet) {
    const shots = sessions.flatMap((s) => extractShots(s.rawJson, club));
    if (shots.length < 5) continue;
    // totalDistance er i meter — konverter til yards (1m = 1.09361yd)
    const meters = shots.reduce((s, r) => s + r.totalDistance, 0) / shots.length;
    const yards = meters * 1.09361;
    avgs.push({ club, avgYards: Math.round(yards), shots: shots.length });
  }

  if (avgs.length < 2) return null;

  avgs.sort((a, b) => b.avgYards - a.avgYards);

  type Gap = { from: string; to: string; gap: number };
  const gaps: Gap[] = [];
  for (let i = 0; i < avgs.length - 1; i++) {
    const gap = avgs[i].avgYards - avgs[i + 1].avgYards;
    if (gap > 15) {
      gaps.push({ from: avgs[i].club, to: avgs[i + 1].club, gap });
    }
  }

  if (gaps.length === 0) return null;

  gaps.sort((a, b) => b.gap - a.gap);
  const worst = gaps[0];
  const severity = worst.gap > 25 ? 4 : 3;

  return {
    category: "DISTANCE_GAPPING",
    severity,
    title: `Distansegap: ${worst.from} → ${worst.to}`,
    body: `Det er ${worst.gap} yards mellom ${worst.from} og ${worst.to}. Større enn anbefalt 15-yards-grense. Vurder å justere bag-setup eller bygge en mellomkølle med ¾-sving.`,
    payload: { gaps, clubAverages: avgs } as Prisma.InputJsonObject,
  };
}

// Phase 2: σ-analyse per kølle — flagg høy variasjon i smash og distanse
async function evaluateConsistencyLeak(userId: string): Promise<EvaluatorResult> {
  const sessions = await getSessions(userId);
  if (sessions.length === 0) return null;

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }

  type LeakClub = { club: string; sigmaSmash: number; sigmaDist: number; shots: number };
  const leakers: LeakClub[] = [];

  for (const club of clubSet) {
    const shots = sessions.flatMap((s) => extractShots(s.rawJson, club));
    if (shots.length < 10) continue;

    const meanSmash = shots.reduce((s, r) => s + r.smashFactor, 0) / shots.length;
    const meanDist = shots.reduce((s, r) => s + r.totalDistance, 0) / shots.length;
    const sigmaSmash = Math.sqrt(
      shots.reduce((s, r) => s + (r.smashFactor - meanSmash) ** 2, 0) / shots.length
    );
    const sigmaDist = Math.sqrt(
      shots.reduce((s, r) => s + (r.totalDistance - meanDist) ** 2, 0) / shots.length
    );

    if (sigmaSmash > 0.05 || sigmaDist > 15) {
      leakers.push({ club, sigmaSmash: Math.round(sigmaSmash * 1000) / 1000, sigmaDist: Math.round(sigmaDist * 10) / 10, shots: shots.length });
    }
  }

  if (leakers.length === 0) return null;

  leakers.sort((a, b) => b.sigmaSmash - a.sigmaSmash);
  const worst = leakers[0];
  const severity = worst.sigmaSmash > 0.08 || worst.sigmaDist > 25 ? 4 : 3;

  return {
    category: "CONSISTENCY_LEAK",
    severity,
    title: `Konsistens-lekkasje: ${worst.club}`,
    body: `${worst.club} viser høy variasjon — Smash Factor σ ${worst.sigmaSmash} (mål: <0.05) og distanse σ ${worst.sigmaDist}m (mål: <15m). Fokuser på repeatable contact i trening.`,
    payload: { leakers } as Prisma.InputJsonObject,
  };
}

// Phase 6: Training Gap — finn køller med TrackMan-data men ingen ClubsPracticed
// de siste 30 dagene.
async function evaluateTrainingGap(userId: string): Promise<EvaluatorResult> {
  const sessions = await getSessions(userId);
  if (sessions.length === 0) return null;

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }

  if (clubSet.size === 0) return null;

  const since = new Date(Date.now() - THIRTY_DAYS_MS);
  const practiced = await prisma.clubsPracticed.findMany({
    where: {
      session: { plan: { userId } },
      createdAt: { gte: since },
    },
    select: { club: true },
  });

  const practicedSet = new Set(practiced.map((p) => p.club));
  const neglected = [...clubSet].filter((c) => !practicedSet.has(c));

  if (neglected.length === 0) return null;

  // Severity skalerer med antall neglisjerte køller
  const severity = neglected.length >= 5 ? 4 : neglected.length >= 3 ? 3 : 2;

  return {
    category: "TRAINING_GAP",
    severity,
    title: `${neglected.length} køller ikke tagget siste 30 dager`,
    body: `Du har TrackMan-data på ${neglected.join(", ")} men ingen registrert trening på dem siste 30 dager. Tagg køllene i live-økter for å få bedre treningsoversikt og fange opp drift tidlig.`,
    payload: { neglected, practiced: [...practicedSet] } as Prisma.InputJsonObject,
  };
}

// Phase 4: D-Plane Drift — venter på src/lib/sg-hub/drift-detection.ts.
// Aktiveres når Phase 4 er merged. Inntil videre returnerer null.
async function evaluateDPlaneDrift(userId: string): Promise<EvaluatorResult> {
  // TODO Phase 4: Krever src/lib/sg-hub/drift-detection.ts (drift-detection)
  // som leser ClubMetricTrend over 12 uker og kjører lineær regresjon
  // mot terskler (clubPath 0.2°/uke, faceAngle 0.15°/uke, totalDistance 0.5m/uke).
  void userId;
  return null;
}

// Phase 2: Sweet Spot % per kølle — flagg lav treffprosent
async function evaluateStrikeQuality(userId: string): Promise<EvaluatorResult> {
  const sessions = await getSessions(userId);
  if (sessions.length === 0) return null;

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }

  type PoorClub = { club: string; sweetPct: number; avgSmash: number; shots: number };
  const poorClubs: PoorClub[] = [];

  for (const club of clubSet) {
    const shots = sessions.flatMap((s) => extractShots(s.rawJson, club));
    if (shots.length < 8) continue;

    const result = computeStrikePattern(shots);
    if (result.sweetPct < 50) {
      poorClubs.push({ club, sweetPct: result.sweetPct, avgSmash: result.avgSmash, shots: shots.length });
    }
  }

  if (poorClubs.length === 0) return null;

  poorClubs.sort((a, b) => a.sweetPct - b.sweetPct);
  const worst = poorClubs[0];
  const severity = worst.sweetPct < 30 ? 4 : 3;

  return {
    category: "STRIKE_QUALITY",
    severity,
    title: `Lav kontaktkvalitet: ${worst.club}`,
    body: `Kun ${worst.sweetPct}% sweet spot-treff på ${worst.club} (${worst.shots} slag analysert). Snitt Smash Factor ${worst.avgSmash}. Prioriter kontaktkvalitet fremfor distanse i neste treningsøkt.`,
    payload: { poorClubs } as Prisma.InputJsonObject,
  };
}

// Phase 4: Fatigue Pattern — venter på src/lib/sg-hub/fatigue.ts.
// Aktiveres når Phase 4 er merged. Inntil videre returnerer null.
async function evaluateFatiguePattern(userId: string): Promise<EvaluatorResult> {
  // TODO Phase 4: Krever src/lib/sg-hub/fatigue.ts som identifiserer økter
  // med Club Speed drop > 1 mph per 10 slag. Hvis ≥50% av økter viser fatigue
  // → generer insight med FATIGUE_PATTERN-kategori.
  void userId;
  return null;
}

// Phase 5: Equipment Fit — venter på src/lib/sg-hub/equipment-fit.ts.
// Aktiveres når Phase 5 er merged. Inntil videre returnerer null.
async function evaluateEquipmentFit(userId: string): Promise<EvaluatorResult> {
  // TODO Phase 5: Krever src/lib/sg-hub/equipment-fit.ts som sjekker launch,
  // spin og smash mot targets per kølletype. Hvis ≥2 metrikker er kritisk
  // avvik → generer EQUIPMENT_FIT-innsikt.
  void userId;
  return null;
}

// Phase 6: Tempo Variance — flagg tempo-ratio σ > 0.15.
async function evaluateTempoVariance(userId: string): Promise<EvaluatorResult> {
  const sessions = await getSessions(userId);
  if (sessions.length === 0) return null;

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }

  type TempoClub = {
    club: string;
    sigmaRatio: number;
    avgRatio: number;
    variancePct: number;
    shots: number;
  };
  const variable: TempoClub[] = [];
  let hasAnyTempoData = false;

  for (const club of clubSet) {
    const shots = sessions.flatMap((s) => extractShots(s.rawJson, club));
    if (shots.length < 8) continue;

    const result = computeTempo(shots);
    if (!result.hasData) continue;
    hasAnyTempoData = true;

    if (result.sigmaRatio > 0.15) {
      variable.push({
        club,
        sigmaRatio: result.sigmaRatio,
        avgRatio: result.avgRatio,
        variancePct: result.variancePct,
        shots: result.points.length,
      });
    }
  }

  if (!hasAnyTempoData) return null;
  if (variable.length === 0) return null;

  variable.sort((a, b) => b.sigmaRatio - a.sigmaRatio);
  const worst = variable[0];
  const severity = worst.sigmaRatio > 0.25 ? 4 : 3;

  return {
    category: "TEMPO_VARIANCE",
    severity,
    title: `Tempo varierer: ${worst.club}`,
    body: `${worst.club} har tempo-ratio σ ${worst.sigmaRatio} (variasjon ${worst.variancePct}%). Snitt-ratio ${worst.avgRatio}:1, optimal 3:1. Bruk metronom eller tempo-drill for å stabilisere rytmen.`,
    payload: { variable } as Prisma.InputJsonObject,
  };
}

// Phase 6: Progression Trend — bruk ClubMetricTrend over 12 uker.
// Positiv trend på avgTotal eller avgSmash → positiv insight.
async function evaluateProgressionTrend(userId: string): Promise<EvaluatorResult> {
  const since = new Date(Date.now() - TWELVE_WEEKS_MS);

  const trends = await prisma.clubMetricTrend.findMany({
    where: {
      userId,
      weekStart: { gte: since },
    },
    orderBy: { weekStart: "asc" },
  });

  if (trends.length === 0) return null;

  // Grupper per kølle, krever minst 4 ukentlige datapunkter
  const byClub = new Map<string, typeof trends>();
  for (const t of trends) {
    const arr = byClub.get(t.club) ?? [];
    arr.push(t);
    byClub.set(t.club, arr);
  }

  type Progress = {
    club: string;
    metric: "avgTotal" | "avgSmash";
    slopePerWeek: number;
    startValue: number;
    endValue: number;
    weeks: number;
  };

  const positives: Progress[] = [];

  function linearSlope(xs: number[], ys: number[]): number {
    const n = xs.length;
    const meanX = xs.reduce((s, x) => s + x, 0) / n;
    const meanY = ys.reduce((s, y) => s + y, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (ys[i] - meanY);
      den += (xs[i] - meanX) ** 2;
    }
    return den === 0 ? 0 : num / den;
  }

  for (const [club, points] of byClub) {
    if (points.length < 4) continue;
    const weeks = points.map((_, i) => i);
    const totals = points.map((p) => p.avgTotal);
    const smashes = points.map((p) => p.avgSmash);

    const slopeTotal = linearSlope(weeks, totals);
    const slopeSmash = linearSlope(weeks, smashes);

    if (slopeTotal > 0.5) {
      positives.push({
        club,
        metric: "avgTotal",
        slopePerWeek: Math.round(slopeTotal * 100) / 100,
        startValue: Math.round(totals[0] * 10) / 10,
        endValue: Math.round(totals[totals.length - 1] * 10) / 10,
        weeks: points.length,
      });
    }
    if (slopeSmash > 0.005) {
      positives.push({
        club,
        metric: "avgSmash",
        slopePerWeek: Math.round(slopeSmash * 1000) / 1000,
        startValue: Math.round(smashes[0] * 1000) / 1000,
        endValue: Math.round(smashes[smashes.length - 1] * 1000) / 1000,
        weeks: points.length,
      });
    }
  }

  if (positives.length === 0) return null;

  positives.sort((a, b) => b.slopePerWeek - a.slopePerWeek);
  const best = positives[0];
  const label = best.metric === "avgTotal" ? "distanse" : "smash factor";
  const enhet = best.metric === "avgTotal" ? "m" : "";

  return {
    category: "PROGRESSION_TREND",
    severity: 1, // positiv insight — lav severity
    title: `Positiv trend: ${best.club}`,
    body: `${best.club} har positiv ${label}-trend over ${best.weeks} uker — fra ${best.startValue}${enhet} til ${best.endValue}${enhet} (+${best.slopePerWeek}${enhet}/uke). Fortsett det du gjør.`,
    payload: { positives } as Prisma.InputJsonObject,
  };
}

// Phase 3: Same-Distance Opportunity — venter på src/lib/sg-hub/same-distance-strategy.ts.
// Aktiveres når Phase 3 er merged. Inntil videre returnerer null.
async function evaluateSameDistanceOpportunity(userId: string): Promise<EvaluatorResult> {
  // TODO Phase 3: Krever src/lib/sg-hub/same-distance-strategy.ts + SgBaseline-data
  // for å sammenligne expected SG på tvers av køller som dekker samme distanse.
  void userId;
  return null;
}

const EVALUATORS: Array<(userId: string) => Promise<EvaluatorResult>> = [
  evaluateDistanceGapping,
  evaluateConsistencyLeak,
  evaluateTrainingGap,
  evaluateDPlaneDrift,
  evaluateStrikeQuality,
  evaluateFatiguePattern,
  evaluateEquipmentFit,
  evaluateTempoVariance,
  evaluateProgressionTrend,
  evaluateSameDistanceOpportunity,
];

export async function generateInsights(userId: string): Promise<void> {
  const resultater = await Promise.all(EVALUATORS.map((fn) => fn(userId)));

  const nye = resultater.filter((r): r is NonNullable<typeof r> => r !== null);
  if (nye.length === 0) return;

  await prisma.sgInsight.createMany({
    data: nye.map((r) => ({
      userId,
      category: r.category,
      severity: r.severity,
      title: r.title,
      body: r.body,
      payload: r.payload,
    })),
  });
}

export async function runSgInsights(): Promise<{ processed: number }> {
  const brukere = await prisma.user.findMany({
    where: { trackManSessions: { some: {} } },
    select: { id: true },
  });

  for (const { id } of brukere) {
    await generateInsights(id);
  }

  return { processed: brukere.length };
}
