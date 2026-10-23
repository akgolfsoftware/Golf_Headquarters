/**
 * AI-dispatch loader (server). Ren bygg ligger i ai-dispatch-build.ts.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { koTelling } from "@/lib/admin/ko-telling";
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
  const siden24t = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Samme mottaker, spillerutvalg og ferske observasjonsdeling som køen
  // brukeren åpner. ADMIN har ingen separat global reservevei.
  const [ko, agentRunsRunning, agentRunsFailed] = await Promise.all([
    koTelling(viewer.id, viewer.role),
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
    planActions: ko.planActions,
    caddieDrafts: isAdmin ? ko.caddieDrafts : 0,
    sessionRequests: ko.sessionRequests,
    agentRunsRunning,
    agentRunsFailed,
    innboksNye: viewer.innboksNye ?? 0,
    fokusSpillere: viewer.fokusSpillere ?? 0,
  });
}
