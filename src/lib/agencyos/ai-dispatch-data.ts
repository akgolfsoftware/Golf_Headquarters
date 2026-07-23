/**
 * AI-dispatch loader (server). Ren bygg ligger i ai-dispatch-build.ts.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import type { UserRole } from "@/generated/prisma/client";
import {
  byggAiDispatch,
  type AiDispatchData,
} from "@/lib/agencyos/ai-dispatch-build";

export type {
  AiDispatchData,
  AiDispatchRad,
  AiDispatchTil,
  AiDispatchInput,
} from "@/lib/agencyos/ai-dispatch-build";
export { byggAiDispatch } from "@/lib/agencyos/ai-dispatch-build";

export type LoadAiDispatchOpts = {
  id: string;
  role: UserRole;
  innboksNye?: number;
  fokusSpillere?: number;
};

export async function loadAiDispatch(
  viewer: LoadAiDispatchOpts,
): Promise<AiDispatchData> {
  const isAdmin = viewer.role === "ADMIN";
  const playerScope = coachScopedPlayerWhere(viewer);

  const planActionWhere = isAdmin
    ? { status: "PENDING" as const }
    : {
        status: "PENDING" as const,
        OR: [{ coachId: viewer.id }, { user: playerScope }],
      };

  const sessionWhere = isAdmin
    ? { status: "PENDING" as const }
    : {
        status: "PENDING" as const,
        OR: [{ coachId: viewer.id }, { user: playerScope }],
      };

  const siden24t = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [planActions, caddieDrafts, sessionRequests, agentRunsRunning, agentRunsFailed] =
    await Promise.all([
      prisma.planAction.count({ where: planActionWhere }),
      isAdmin
        ? prisma.caddieDraft.count({
            where: { status: "PENDING", userId: viewer.id },
          })
        : Promise.resolve(0),
      prisma.sessionRequest.count({ where: sessionWhere }),
      prisma.kommandoAgentRun.count({
        where: { userId: viewer.id, status: "running" },
      }),
      prisma.kommandoAgentRun.count({
        where: {
          userId: viewer.id,
          status: "failed",
          createdAt: { gte: siden24t },
        },
      }),
    ]);

  return byggAiDispatch({
    isAdmin,
    planActions,
    caddieDrafts,
    sessionRequests,
    agentRunsRunning,
    agentRunsFailed,
    innboksNye: viewer.innboksNye ?? 0,
    fokusSpillere: viewer.fokusSpillere ?? 0,
  });
}
