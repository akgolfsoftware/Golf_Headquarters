// SG Hub Insight Engine.
// Kjøres daglig 04:00 UTC via /api/cron/[agent] (agent = "sg-insights").

import { prisma } from "@/lib/prisma";
import type { InsightCategory } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { extractShots, extractClubs } from "@/lib/sg-hub/extract-shots";
import { computeStrikePattern } from "@/lib/sg-hub/strike-pattern";

type EvaluatorResult = {
  category: InsightCategory;
  severity: number;
  title: string;
  body: string;
  payload: Prisma.InputJsonObject;
} | null;

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

async function getSessions(userId: string) {
  return prisma.trackManSession.findMany({
    where: {
      userId,
      recordedAt: { gte: new Date(Date.now() - NINETY_DAYS_MS) },
    },
    select: { rawJson: true },
  });
}

async function evaluateDistanceGapping(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 3: Stock Yardage gapping analysis
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

async function evaluateTrainingGap(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 2: ClubsPracticed-frekvens vs treningsplan
}

async function evaluateDPlaneDrift(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 4: ClubMetricTrend lineær regresjon
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

async function evaluateFatiguePattern(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 4: Club Speed rolling average pr. økt
}

async function evaluateEquipmentFit(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 5: Launch/spin mot target per køllenummer
}

async function evaluateTempoVariance(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 6: Tempo-ratio hvis CSV-data tilgjengelig
}

async function evaluateProgressionTrend(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 4: ClubMetricTrend over 12 uker
}

async function evaluateSameDistanceOpportunity(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 3: Same-Distance Strategy optimalisering
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
