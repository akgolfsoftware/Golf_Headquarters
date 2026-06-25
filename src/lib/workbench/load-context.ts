import "server-only";

import { prisma } from "@/lib/prisma";
import { loadWorkbenchData } from "./load-workbench";
import { buildWorkbenchInsights } from "./insights";
import type { WorkbenchContext } from "./types";

/** Én loader for Workbench — data + innsikt + plan-status. */
export async function loadWorkbenchContext(userId: string): Promise<WorkbenchContext | null> {
  const data = await loadWorkbenchData(userId);
  if (data === null) return null;

  const [insights, activePlan] = await Promise.all([
    buildWorkbenchInsights(userId, data),
    prisma.trainingPlan.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: "desc" },
      select: { status: true },
    }),
  ]);

  const hasWeekSessions = (data.weekDays?.some((d) => d.events.length > 0) ?? false);

  return {
    data,
    insights,
    hasWeekSessions,
    planStatus: activePlan?.status ?? null,
  };
}