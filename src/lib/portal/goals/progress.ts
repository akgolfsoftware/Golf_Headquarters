// Delt fremdriftsberegning for PlayerHQ-målsetninger (Goal-modellen).
//
// Én kilde til sannhet — brukes av mål-hub, mål-detalj, AI mål-bygger og
// spillerprofil-visningene (portal + admin). Dikter ALDRI opp et prosenttall:
// hvis ingenting relevant er logget ennå, returneres hasData=false og
// visningslaget skal vise "ingen data ennå", ikke en fabrikkert 0 %.

import { prisma } from "@/lib/prisma";
import type { Goal } from "@/generated/prisma/client";
import { PYR_LABEL } from "@/lib/pyramide";

export type GoalProgressStatus = "on-track" | "behind" | "achieved" | "no-data";

export type GoalProgress = {
  /** 0–100. Kun meningsfullt når hasData=true. */
  pct: number;
  status: GoalProgressStatus;
  /** false = ingenting relevant logget ennå — vis "ingen data ennå", ikke 0 %. */
  hasData: boolean;
  /** Rå nå-verdi til visning (HCP, antall runder/økter, poengsum). Null uten data. */
  value: number | null;
  /** Kort norsk forklaring til fremdriftskortet. */
  detail: string;
};

export type GoalForProgress = Pick<
  Goal,
  "userId" | "type" | "targetValue" | "linkedPyramidArea" | "linkedTestId"
>;

export type GoalProgressContext = {
  hcp: number | null;
  /** Kun for tester — injiseres for deterministiske enhetstester. */
  now?: Date;
};

const ROLLING_WINDOW_DAYS = 7;
const ROUNDS_WINDOW_DAYS = 30;
// Standard maks-HCP ved onboarding — samme antakelse som mål-hub har brukt siden før.
const HCP_START = 54;

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusFromPct(pct: number): GoalProgressStatus {
  if (pct >= 100) return "achieved";
  if (pct >= 50) return "on-track";
  return "behind";
}

function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function ingenData(detail: string): GoalProgress {
  return { pct: 0, status: "no-data", hasData: false, value: null, detail };
}

function progressHcp(goal: GoalForProgress, hcp: number | null): GoalProgress {
  if (hcp == null || goal.targetValue == null) {
    return ingenData("Ingen HCP registrert ennå");
  }
  const range = Math.max(0.1, HCP_START - goal.targetValue);
  const reise = Math.max(0, HCP_START - hcp);
  const pct = clampPct((reise / range) * 100);
  const delta = +(hcp - goal.targetValue).toFixed(1);
  const detail =
    delta > 0
      ? `${hcp.toFixed(1)} nå · trenger ${delta.toFixed(1)} til`
      : `Mål nådd! HCP ${hcp.toFixed(1)}`;
  return { pct, status: statusFromPct(pct), hasData: true, value: hcp, detail };
}

async function progressRoundsPerMonth(goal: GoalForProgress, now: Date): Promise<GoalProgress> {
  const target = goal.targetValue ?? 1;
  const windowStart = daysAgo(now, ROUNDS_WINDOW_DAYS);
  const count = await prisma.round.count({
    where: { userId: goal.userId, playedAt: { gte: windowStart } },
  });
  if (count === 0) {
    const noenGang = await prisma.round.findFirst({
      where: { userId: goal.userId },
      select: { id: true },
    });
    if (!noenGang) return ingenData("Ingen runder registrert ennå");
  }
  const pct = clampPct((count / target) * 100);
  return {
    pct,
    status: statusFromPct(pct),
    hasData: true,
    value: count,
    detail: `${count} av ${target} runder siste ${ROUNDS_WINDOW_DAYS} dager`,
  };
}

async function progressSessionFrequency(goal: GoalForProgress, now: Date): Promise<GoalProgress> {
  if (!goal.linkedPyramidArea) return ingenData("Ingen treningskategori valgt");

  const target = goal.targetValue ?? 1;
  const windowStart = daysAgo(now, ROLLING_WINDOW_DAYS);
  const sessionFilter = {
    pyramidArea: goal.linkedPyramidArea,
    plan: { userId: goal.userId },
  };

  const count = await prisma.trainingPlanSessionLog.count({
    where: { completedAt: { gte: windowStart }, session: sessionFilter },
  });

  if (count === 0) {
    const noenGang = await prisma.trainingPlanSessionLog.findFirst({
      where: { completedAt: { not: null }, session: sessionFilter },
      select: { id: true },
    });
    if (!noenGang) {
      return ingenData(`Ingen ${PYR_LABEL[goal.linkedPyramidArea].toLowerCase()}-økter logget ennå`);
    }
  }

  const pct = clampPct((count / target) * 100);
  return {
    pct,
    status: statusFromPct(pct),
    hasData: true,
    value: count,
    detail: `${count} av ${target} økter siste ${ROLLING_WINDOW_DAYS} dager`,
  };
}

async function progressTestScore(goal: GoalForProgress): Promise<GoalProgress> {
  if (!goal.linkedTestId) return ingenData("Ingen test valgt");

  const latest = await prisma.testResult.findFirst({
    where: { userId: goal.userId, testId: goal.linkedTestId },
    orderBy: { takenAt: "desc" },
    select: { score: true },
  });
  if (!latest) return ingenData("Ingen testresultat registrert ennå");

  const target = goal.targetValue ?? latest.score;
  const pct = target > 0 ? clampPct((latest.score / target) * 100) : 0;
  const status: GoalProgressStatus = latest.score >= target ? "achieved" : statusFromPct(pct);
  return {
    pct,
    status,
    hasData: true,
    value: latest.score,
    detail: `${latest.score} poeng · mål ${target}`,
  };
}

/**
 * Beregn fremdrift for ett mål. SG_AREA og FREE_TEXT har ingen automatisk
 * beregning bygget (spilleren følger selv opp) — returnerer ærlig "ingen data",
 * aldri en oppdiktet prosent.
 */
export async function beregnGoalProgress(
  goal: GoalForProgress,
  ctx: GoalProgressContext,
): Promise<GoalProgress> {
  const now = ctx.now ?? new Date();
  switch (goal.type) {
    case "HCP_TARGET":
      return progressHcp(goal, ctx.hcp);
    case "ROUNDS_PER_MONTH":
      return progressRoundsPerMonth(goal, now);
    case "SESSION_FREQUENCY":
      return progressSessionFrequency(goal, now);
    case "TEST_SCORE":
      return progressTestScore(goal);
    default:
      return ingenData("Følges opp manuelt");
  }
}
