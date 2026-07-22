/**
 * Whitelist: testresultat → forslag til TM-mål baseline på fullsving-oppgaver.
 * Oppretter PlanAction (PENDING) — endrer aldri baseline uten godkjenning.
 */

import { prisma } from "@/lib/prisma";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { erFullsving } from "@/lib/teknisk-plan/fullsving";
import { varsleVedPlanAction } from "@/lib/agents/notify-plan-action";

export const AGENT_NAME_TEST_TM = "test-tm-baseline";

type WhitelistRule = {
  /** Match mot TestDefinition.name (case-insensitive). */
  namePattern: RegExp;
  metric: string;
  /** Hvordan hente tall: score-feltet, eller nøkkel i details. */
  valueFrom: "score" | "details.avg" | "details.max" | "details.chs";
};

/** Kun disse test-typene mater full sving-TM-mål. */
export const TEST_TM_WHITELIST: WhitelistRule[] = [
  {
    namePattern: /klubbhode|club.?head|chs|club speed/i,
    metric: "club_speed_mean",
    valueFrom: "score",
  },
  {
    namePattern: /driver basic|driver.?carry|carry.?driver/i,
    metric: "carry_mean",
    valueFrom: "score",
  },
  {
    namePattern: /smash/i,
    metric: "smash_factor_mean",
    valueFrom: "score",
  },
  {
    namePattern: /ball.?speed|ballhastighet/i,
    metric: "ball_speed_mean",
    valueFrom: "score",
  },
];

function extractValue(
  rule: WhitelistRule,
  score: number,
  details: unknown,
): number | null {
  if (rule.valueFrom === "score") {
    return Number.isFinite(score) ? score : null;
  }
  if (!details || typeof details !== "object") return null;
  const d = details as Record<string, unknown>;
  if (rule.valueFrom === "details.avg") {
    const v = d.avg ?? d.average ?? d.snitt;
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }
  if (rule.valueFrom === "details.max") {
    const v = d.max ?? d.maks;
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }
  if (rule.valueFrom === "details.chs") {
    const v = d.chs ?? d.clubHeadSpeed ?? d.club_speed;
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }
  return null;
}

export type TmBaselineProposalResult = {
  proposalsWritten: number;
};

/**
 * Etter TestResult: for whitelist-tester, foreslå baseline på matching TmGoals.
 */
export async function proposeTmBaselinesFromTest(
  userId: string,
  testResultId: string,
): Promise<TmBaselineProposalResult> {
  const result = await prisma.testResult.findFirst({
    where: { id: testResultId, userId },
    include: { test: { select: { id: true, name: true } } },
  });
  if (!result) return { proposalsWritten: 0 };

  const rules = TEST_TM_WHITELIST.filter((r) =>
    r.namePattern.test(result.test.name),
  );
  if (rules.length === 0) return { proposalsWritten: 0 };

  const plan = await prisma.technicalPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      positions: {
        select: {
          tasks: {
            where: { status: { in: ["ACTIVE", "PENDING"] } },
            select: {
              id: true,
              tittel: true,
              slagType: true,
              tmGoals: {
                select: {
                  id: true,
                  metric: true,
                  baselineValue: true,
                  targetValue: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!plan) return { proposalsWritten: 0 };

  const coachId = await resolveCoachIdForPlayer(userId);
  let proposalsWritten = 0;

  for (const rule of rules) {
    const value = extractValue(rule, result.score, result.details);
    if (value == null) continue;

    for (const pos of plan.positions) {
      for (const task of pos.tasks) {
        if (!erFullsving(task.slagType)) continue;
        for (const goal of task.tmGoals) {
          if (goal.metric !== rule.metric) continue;

          const eksisterende = await prisma.planAction.findFirst({
            where: {
              userId,
              status: "PENDING",
              agentName: AGENT_NAME_TEST_TM,
              actionType: "TM_BASELINE_PROPOSE",
            },
            select: { id: true, suggestion: true },
          });
          // Unngå duplikat for samme goal
          if (eksisterende?.suggestion && typeof eksisterende.suggestion === "object") {
            const s = eksisterende.suggestion as { goalId?: string };
            if (s.goalId === goal.id) continue;
          }

          const forklaring = `Test «${result.test.name}» ga ${value}. Foreslår som baseline for ${goal.metric} på «${task.tittel}».`;
          const created = await prisma.planAction.create({
            data: {
              userId,
              coachId,
              planId: null,
              actionType: "TM_BASELINE_PROPOSE",
              agentName: AGENT_NAME_TEST_TM,
              suggestion: {
                goalId: goal.id,
                taskId: task.id,
                taskTittel: task.tittel,
                metric: goal.metric,
                proposedBaseline: value,
                currentBaseline: goal.baselineValue,
                targetValue: goal.targetValue,
                testResultId: result.id,
                testName: result.test.name,
                technicalPlanId: plan.id,
                forklaring,
              },
            },
          });
          await varsleVedPlanAction({
            userId,
            agentName: AGENT_NAME_TEST_TM,
            actionType: "TM_BASELINE_PROPOSE",
            forklaring,
            planActionId: created.id,
          });
          proposalsWritten++;
        }
      }
    }
  }

  return { proposalsWritten };
}
