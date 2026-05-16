// SG Hub Insight Engine — Phase 1 skeleton.
// Kjøres daglig 04:00 UTC via /api/cron/[agent] (agent = "sg-insights").
// Phase 2+ fyller ut evaluator-funksjonene med faktisk logikk.

import { prisma } from "@/lib/prisma";
import type { InsightCategory } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

type EvaluatorResult = {
  category: InsightCategory;
  severity: number;
  title: string;
  body: string;
  payload: Prisma.InputJsonObject;
} | null;

// Én evaluator per InsightCategory. Alle returnerer null i Phase 1.
async function evaluateDistanceGapping(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 3: Stock Yardage gapping analysis
}

async function evaluateConsistencyLeak(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 2: σ-analyse per kølle
}

async function evaluateTrainingGap(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 2: ClubsPracticed-frekvens vs treningsplan
}

async function evaluateDPlaneDrift(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 4: ClubMetricTrend lineær regresjon
}

async function evaluateStrikeQuality(_userId: string): Promise<EvaluatorResult> {
  return null; // TODO Phase 2: Smash Factor σ og Sweet Spot %
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
