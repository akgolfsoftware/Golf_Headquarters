import { prisma } from "@/lib/prisma";
import type { TmGoalComparison } from "@/generated/prisma/client";

export type ShotMetrics = {
  clubSpeed: number | null;
  ballSpeed: number | null;
  smashFactor: number | null;
  carryDistance: number | null;
  side: number | null;
};

function progressTowardTarget(
  baseline: number,
  target: number,
  current: number,
  comparison: TmGoalComparison,
): number {
  if (comparison === "RANGE") {
    return current >= baseline && current <= target ? 100 : 0;
  }
  const span = target - baseline;
  if (Math.abs(span) < 0.0001) return current === target ? 100 : 0;
  const raw = ((current - baseline) / span) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function isInTarget(
  current: number,
  target: number,
  comparison: TmGoalComparison,
  rangeMax: number | null,
  corridorMin: number | null,
  corridorMax: number | null,
): boolean {
  switch (comparison) {
    case "LESS_THAN":
      return current <= target;
    case "GREATER_THAN":
      return current >= target;
    case "EQUAL":
      return Math.abs(current - target) < 0.05;
    case "RANGE":
      if (corridorMin != null && corridorMax != null) {
        return current >= corridorMin && current <= corridorMax;
      }
      if (rangeMax != null) {
        return current >= target && current <= rangeMax;
      }
      return current >= target;
    default:
      return false;
  }
}

function nums(values: (number | null)[]): number[] {
  return values.filter((n): n is number => typeof n === "number" && Number.isFinite(n));
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

/** Sample standard deviation (n-1). Én verdi → 0. */
function stddev(values: number[]): number | null {
  if (values.length === 0) return null;
  if (values.length === 1) return 0;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((s, n) => s + (n - m) ** 2, 0) / (values.length - 1);
  return Math.round(Math.sqrt(variance) * 100) / 100;
}

/** Henter rå-serie for en metric fra øktens matchede slag. */
function seriesForMetric(metric: string, shots: ShotMetrics[]): number[] {
  switch (metric) {
    case "smash_factor_mean":
    case "smash_factor_std":
      return nums(shots.map((s) => s.smashFactor));
    case "carry_mean":
      return nums(shots.map((s) => s.carryDistance));
    case "club_speed_mean":
      return nums(shots.map((s) => s.clubSpeed));
    case "ball_speed_mean":
      return nums(shots.map((s) => s.ballSpeed));
    case "side_std":
      return nums(shots.map((s) => (s.side != null ? s.side : null)));
    default:
      return [];
  }
}

function aggregateMetric(metric: string, shots: ShotMetrics[]): number | null {
  const series = seriesForMetric(metric, shots);
  if (series.length === 0) return null;

  if (metric.endsWith("_std") || metric === "side_std") {
    return stddev(series);
  }
  return mean(series);
}

/**
 * Oppdaterer TmGoals for én oppgave basert på **alle** matchede slag i økten.
 * mean → snitt, std → standardavvik. HIT_RATE hoppes over.
 */
export async function updateTmGoalsFromSessionAggregate(
  taskId: string,
  shots: ShotMetrics[],
): Promise<number> {
  if (shots.length === 0) return 0;

  const goals = await prisma.positionTaskTmGoal.findMany({
    where: { taskId },
    select: {
      id: true,
      metric: true,
      baselineValue: true,
      targetValue: true,
      comparison: true,
      rangeMax: true,
      corridorMin: true,
      corridorMax: true,
      targetType: true,
    },
  });

  const now = new Date();
  let updated = 0;

  for (const goal of goals) {
    if (goal.targetType === "HIT_RATE") continue;

    const value = aggregateMetric(goal.metric, shots);
    if (value == null) continue;

    const progressPct = progressTowardTarget(
      goal.baselineValue,
      goal.targetValue,
      value,
      goal.comparison,
    );
    const inTarget = isInTarget(
      value,
      goal.targetValue,
      goal.comparison,
      goal.rangeMax,
      goal.corridorMin,
      goal.corridorMax,
    );

    await prisma.positionTaskTmGoal.update({
      where: { id: goal.id },
      data: {
        currentValue: value,
        progressPct,
        inTarget,
        lastUpdated: now,
      },
    });
    updated++;
  }

  return updated;
}

/**
 * @deprecated Bruk updateTmGoalsFromSessionAggregate for import.
 * Beholdt for evt. enkelt-slag logging utenfor import-path.
 */
export async function updateTmGoalsFromShot(
  taskId: string,
  shot: ShotMetrics,
): Promise<void> {
  await updateTmGoalsFromSessionAggregate(taskId, [shot]);
}
