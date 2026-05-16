// SG Hub Insight Engine.
// Kjøres daglig 04:00 UTC via /api/cron/[agent] (agent = "sg-insights").

import { prisma } from "@/lib/prisma";
import type { InsightCategory } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { extractShots, extractClubs } from "@/lib/sg-hub/extract-shots";
import { computeStrikePattern } from "@/lib/sg-hub/strike-pattern";
import { computeTempo } from "@/lib/sg-hub/tempo";
import { detectDrift } from "@/lib/sg-hub/drift-detection";
import { computeFatigueCurve } from "@/lib/sg-hub/fatigue";
import { computeClubFit } from "@/lib/sg-hub/equipment-fit";
import { buildYardageRows } from "@/lib/sg-hub/yardage-calc";
import {
  buildStrategy,
  makeBaselineLookup,
} from "@/lib/sg-hub/same-distance-strategy";

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

// Phase 4: D-Plane Drift — lineær regresjon over 12 uker per metrikk per kølle.
async function evaluateDPlaneDrift(userId: string): Promise<EvaluatorResult> {
  const alerts = await detectDrift(userId);
  if (alerts.length === 0) return null;

  // Velg verste drift målt etter magnitude / threshold-ratio
  alerts.sort((a, b) => b.magnitude / b.threshold - a.magnitude / a.threshold);
  const worst = alerts[0];

  const metricLabel = {
    clubPath: "Club Path",
    faceAngle: "Face Angle",
    totalDistance: "Total Distance",
  }[worst.metric];

  const enhet = worst.metric === "totalDistance" ? "m" : "°";
  const retning = worst.direction === "up" ? "økning" : "reduksjon";
  const severity = worst.magnitude > worst.threshold * 2 ? 4 : 3;

  return {
    category: "D_PLANE_DRIFT",
    severity,
    title: `Teknisk drift: ${worst.club} · ${metricLabel}`,
    body: `${worst.club} viser jevn ${retning} på ${metricLabel} — ${Math.abs(worst.slopePerWeek)}${enhet}/uke over ${worst.weeks} uker (terskel: ${worst.threshold}${enhet}/uke). Sjekk teknikk eller utstyrsendring.`,
    payload: { alerts } as unknown as Prisma.InputJsonObject,
  };
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

// Phase 4: Fatigue Pattern — analyser per-økt om Club Speed faller etter ~slag 25-30.
// Flagg hvis ≥50% av økter viser fatigue.
async function evaluateFatiguePattern(userId: string): Promise<EvaluatorResult> {
  const sessions = await getSessions(userId);
  if (sessions.length < 3) return null;

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }

  type FatigueCount = { club: string; sessions: number; fatigued: number; avgDrop: number };
  const counts: FatigueCount[] = [];

  for (const club of clubSet) {
    let sessionCount = 0;
    let fatigueCount = 0;
    const drops: number[] = [];

    for (const s of sessions) {
      const shots = extractShots(s.rawJson, club);
      if (shots.length < 15) continue;
      sessionCount++;
      const fatigue = computeFatigueCurve(shots);
      if (fatigue.fatigueDetected) {
        fatigueCount++;
        drops.push(fatigue.dropPer10);
      }
    }

    if (sessionCount < 3) continue;
    const ratio = fatigueCount / sessionCount;
    if (ratio < 0.5) continue;

    const avgDrop = drops.length > 0
      ? Math.round((drops.reduce((s, d) => s + d, 0) / drops.length) * 10) / 10
      : 0;

    counts.push({ club, sessions: sessionCount, fatigued: fatigueCount, avgDrop });
  }

  if (counts.length === 0) return null;

  counts.sort((a, b) => b.avgDrop - a.avgDrop);
  const worst = counts[0];
  const severity = worst.avgDrop > 2 ? 4 : 3;

  return {
    category: "FATIGUE_PATTERN",
    severity,
    title: `Fatigue-mønster: ${worst.club}`,
    body: `Club Speed faller i ${worst.fatigued} av ${worst.sessions} økter på ${worst.club} — gjennomsnittlig ${worst.avgDrop} mph drop per 10 slag. Vurder kortere økter, oppvarming eller fysisk forberedelse.`,
    payload: { counts } as unknown as Prisma.InputJsonObject,
  };
}

// Phase 5: Equipment Fit — sjekk launch/spin/smash mot targets per kølletype.
async function evaluateEquipmentFit(userId: string): Promise<EvaluatorResult> {
  const sessions = await getSessions(userId);
  if (sessions.length === 0) return null;

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const c of extractClubs(s.rawJson)) clubSet.add(c);
  }

  type CriticalClub = {
    club: string;
    criticalCount: number;
    warnCount: number;
    notes: string[];
  };
  const flagged: CriticalClub[] = [];

  for (const club of clubSet) {
    const allShots = sessions.flatMap((s) => extractShots(s.rawJson, club));
    if (allShots.length < 8) continue;
    // Bruk siste sessions rawJson for launch/spin-lookup (CSV-felt)
    const rawJson = sessions[0].rawJson;
    const report = computeClubFit(club, allShots, rawJson);
    const critical = report.metrics.filter((m) => m.status === "critical");
    const warn = report.metrics.filter((m) => m.status === "warn");

    if (critical.length >= 2 || (critical.length >= 1 && warn.length >= 1)) {
      flagged.push({
        club,
        criticalCount: critical.length,
        warnCount: warn.length,
        notes: [...critical, ...warn].map((m) => m.note),
      });
    }
  }

  if (flagged.length === 0) return null;

  flagged.sort((a, b) => b.criticalCount - a.criticalCount);
  const worst = flagged[0];
  const severity = worst.criticalCount >= 2 ? 4 : 3;

  return {
    category: "EQUIPMENT_FIT",
    severity,
    title: `Utstyrstilpasning: ${worst.club}`,
    body: `${worst.club} har ${worst.criticalCount} kritiske og ${worst.warnCount} avvik fra target — ${worst.notes.slice(0, 2).join("; ")}. Vurder fitting eller justering av utstyr.`,
    payload: { flagged } as unknown as Prisma.InputJsonObject,
  };
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

// Phase 3: Same-Distance Opportunity — bruk SgBaseline for å se om spilleren
// kan vinne SG ved å bytte kølle på vanlige approach-distanser.
async function evaluateSameDistanceOpportunity(userId: string): Promise<EvaluatorResult> {
  const sessions = await getSessions(userId);
  if (sessions.length === 0) return null;

  const baselines = await prisma.sgBaseline.findMany({
    where: { category: "APP" },
    select: { distanceBucket: true, expectedStrokes: true },
  });

  if (baselines.length === 0) return null;

  const rows = buildYardageRows(sessions);
  if (rows.length === 0) return null;

  const lookupBaseline = makeBaselineLookup(baselines);

  // Sjekk på 3 vanlige approach-distanser (yards → meter)
  const targetsYards = [100, 125, 150];
  type Finding = { distanceY: number; best: string; recommended: string; sgDelta: number };
  const findings: Finding[] = [];

  for (const yardTarget of targetsYards) {
    const meterTarget = yardTarget / 1.0936;
    const options = buildStrategy(rows, meterTarget, 10, lookupBaseline);
    if (options.length < 2) continue;

    const best = options[0];
    const second = options[1];
    if (best.expectedSgVsBest != null && second.expectedSgVsBest != null) {
      const sgDelta = Math.abs(second.expectedSgVsBest - best.expectedSgVsBest);
      if (sgDelta > 0.05) {
        findings.push({
          distanceY: yardTarget,
          best: best.club,
          recommended: best.club,
          sgDelta: Math.round(sgDelta * 100) / 100,
        });
      }
    }
  }

  if (findings.length === 0) return null;

  findings.sort((a, b) => b.sgDelta - a.sgDelta);
  const worst = findings[0];

  return {
    category: "SAME_DISTANCE_OPPORTUNITY",
    severity: 2,
    title: `SG-mulighet på ${worst.distanceY} yards`,
    body: `På ${worst.distanceY}y er ${worst.best} statistisk beste valg basert på din distribusjon vs PGA-baseline (potensial: +${worst.sgDelta} SG vs nest beste alternativ). Bruk Same-Distance-verktøyet for å se hele rangeringen.`,
    payload: { findings } as unknown as Prisma.InputJsonObject,
  };
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
