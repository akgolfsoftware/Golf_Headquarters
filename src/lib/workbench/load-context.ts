import "server-only";

import { prisma } from "@/lib/prisma";
import { loadTekniskPlanContext } from "@/lib/teknisk-plan/load-context";
import { loadWorkbenchData } from "./load-workbench";
import { buildWorkbenchInsights } from "./insights";
import { loadWorkbenchAgentFeed } from "./agent-feed";
import type { WorkbenchContext } from "./types";

/** Én loader for Workbench — data + innsikt + plan-status. */
export async function loadWorkbenchContext(
  userId: string,
  weekOffset = 0,
  opts?: { viewer?: "player" | "coach" },
): Promise<WorkbenchContext | null> {
  const data = await loadWorkbenchData(userId, weekOffset, opts);
  if (data === null) return null;

  const [insights, activePlan, tekniskPlan, agentFeed] = await Promise.all([
    buildWorkbenchInsights(userId, data),
    prisma.trainingPlan.findFirst({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
      select: { id: true, status: true },
    }),
    loadTekniskPlanContext(userId),
    loadWorkbenchAgentFeed(userId),
  ]);

  const hasWeekSessions = (data.weekDays?.some((d) => d.events.length > 0) ?? false);

  return {
    data,
    insights,
    hasWeekSessions,
    planId: activePlan?.id ?? null,
    planStatus: activePlan?.status ?? null,
    tekniskPlan,
    agentFeed,
  };
}