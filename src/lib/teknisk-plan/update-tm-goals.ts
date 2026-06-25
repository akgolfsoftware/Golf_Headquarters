import { prisma } from "@/lib/prisma";
import type { TmGoalComparison } from "@/generated/prisma/client";

export type ShotMetrics = {
  clubSpeed: number | null;
  ballSpeed: number | null;
  smashFactor: number | null;
  carryDistance: number | null;
  side: number | null;
};

function metricFromShot(metric: string, shot: ShotMetrics): number | null {
  switch (metric) {
    case "smash_factor_mean":
    case "smash_factor_std":
      return shot.smashFactor;
    case "carry_mean":
      return shot.carryDistance;
    case "club_speed_mean":
      return shot.clubSpeed;
    case "ball_speed_mean":
      return shot.ballSpeed;
    case "side_std":
      return shot.side != null ? Math.abs(shot.side) : null;
    default:
      return null;
  }
}

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

/** Oppdaterer PositionTaskTmGoal.currentValue etter matchet TrackMan-slag. */
export async function updateTmGoalsFromShot(taskId: string, shot: ShotMetrics): Promise<void> {
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

  for (const goal of goals) {
    if (goal.targetType === "HIT_RATE") continue;

    const value = metricFromShot(goal.metric, shot);
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
  }
}