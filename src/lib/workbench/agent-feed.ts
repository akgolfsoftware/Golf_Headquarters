import "server-only";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const suggestionSchema = z.object({ forklaring: z.string().optional() });

export type WorkbenchAgentSignal = {
  id: string;
  kind: string;
  value: number | null;
  computedAt: string;
};

export type WorkbenchAgentPlanAction = {
  id: string;
  actionType: string;
  agentName: string;
  forklaring: string;
  createdAt: string;
};

export type WorkbenchAgentFeed = {
  signals: WorkbenchAgentSignal[];
  planActions: WorkbenchAgentPlanAction[];
};

export async function loadWorkbenchAgentFeed(
  userId: string,
): Promise<WorkbenchAgentFeed> {
  const [signals, planActions] = await Promise.all([
    prisma.signal.findMany({
      where: { userId },
      orderBy: { computedAt: "desc" },
      take: 10,
      select: {
        id: true,
        kind: true,
        value: true,
        computedAt: true,
      },
    }),
    prisma.planAction.findMany({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        actionType: true,
        agentName: true,
        suggestion: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    signals: signals.map((s) => ({
      id: s.id,
      kind: s.kind,
      value: s.value,
      computedAt: s.computedAt.toISOString(),
    })),
    planActions: planActions.map((a) => {
      const parsed = suggestionSchema.safeParse(a.suggestion);
      return {
        id: a.id,
        actionType: a.actionType,
        agentName: a.agentName,
        forklaring: parsed.success
          ? (parsed.data.forklaring ?? a.actionType)
          : a.actionType,
        createdAt: a.createdAt.toISOString(),
      };
    }),
  };
}