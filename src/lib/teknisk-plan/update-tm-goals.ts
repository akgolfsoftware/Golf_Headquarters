import { prisma } from "@/lib/prisma";
import type { TmGoalComparison } from "@/generated/prisma/client";

export type ShotMetrics = {
  clubSpeed: number | null;
  ballSpeed: number | null;
  smashFactor: number | null;
  carryDistance: number | null;
  side: number | null;
  clubPath?: number | null;
  faceAngle?: number | null;
  faceToPath?: number | null;
  attackAngle?: number | null;
  launchAngle?: number | null;
  spinRate?: number | null;
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
    case "club_path_mean":
    case "club_path_std":
      return nums(shots.map((s) => s.clubPath ?? null));
    case "face_angle_mean":
    case "face_angle_std":
      return nums(shots.map((s) => s.faceAngle ?? null));
    case "face_to_path_mean":
    case "face_to_path_std":
      return nums(shots.map((s) => s.faceToPath ?? null));
    case "attack_angle_mean":
    case "attack_angle_std":
      return nums(shots.map((s) => s.attackAngle ?? null));
    case "launch_angle_mean":
    case "launch_angle_std":
      return nums(shots.map((s) => s.launchAngle ?? null));
    case "spin_rate_mean":
    case "spin_rate_std":
      return nums(shots.map((s) => s.spinRate ?? null));
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
 * Evaluerer deretter 2-spors milepælsstatus for oppgaven (trackStatus & status).
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

  // Evaluerer 2-spors milepæl for oppgaven
  await evaluateTaskMilestoneStatus(taskId, now);

  return updated;
}

/**
 * Evaluerer om en PositionTask har nådd milepæl basert på rep-spor og TM-spor.
 */
export async function evaluateTaskMilestoneStatus(
  taskId: string,
  now: Date = new Date(),
): Promise<void> {
  const task = await prisma.positionTask.findUnique({
    where: { id: taskId },
    include: {
      tmGoals: true,
    },
  });

  if (!task) return;

  const nonHitRateGoals = task.tmGoals.filter((g) => g.targetType !== "HIT_RATE");
  const allGoalsInTarget =
    nonHitRateGoals.length > 0 && nonHitRateGoals.every((g) => g.inTarget);
  const repsGjort =
    (task.repsGjortDry ?? 0) + (task.repsGjortLav ?? 0) + (task.repsGjortFull ?? 0);
  const repsMaal =
    (task.repsMaalDry ?? 0) + (task.repsMaalLav ?? 0) + (task.repsMaalFull ?? 0);
  const repsComplete = repsMaal > 0 && repsGjort >= repsMaal;

  const updateData: {
    lastRepLoggedAt: Date;
    trackStatusUpdatedAt: Date;
    status?: "PENDING" | "ACTIVE" | "DONE" | "ARCHIVED";
    trackStatus?: "PAA_VEI" | "STAGNERER" | "FERDIG" | "INAKTIV" | "AVSLAATT";
    estimatedCompleteAt?: Date | null;
  } = {
    lastRepLoggedAt: now,
    trackStatusUpdatedAt: now,
  };

  if (allGoalsInTarget && repsComplete) {
    updateData.status = "DONE";
    updateData.trackStatus = "FERDIG";
    updateData.estimatedCompleteAt = now;
  } else if (allGoalsInTarget) {
    updateData.trackStatus = "PAA_VEI";
    if (task.status === "PENDING") {
      updateData.status = "ACTIVE";
    }
  } else if (repsGjort > 0) {
    updateData.trackStatus = "PAA_VEI";
    if (task.status === "PENDING") {
      updateData.status = "ACTIVE";
    }
  }

  await prisma.positionTask.update({
    where: { id: taskId },
    data: updateData,
  });
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
