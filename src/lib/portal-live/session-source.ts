import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { canAccessPlayer } from "@/lib/auth/own-or-coached";
import { canReadOwnGroupCopy } from "@/lib/workbench/group-scope";

export const LiveSessionIdSchema = z.string().min(1).max(100);

/** Intern servergrense. Bruker og tilgang utledes alltid fra innloggingen. */
export async function loadAuthorizedLiveSource(sessionId: string) {
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (!LiveSessionIdSchema.safeParse(sessionId).success) throw new Error("not-found");
  const v2 = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    include: { drills: { orderBy: { sortOrder: "asc" } }, participants: { where: { userId: viewer.id } } },
  });
  if (v2) {
    const direct = [v2.studentId, v2.hostId, v2.coachId].includes(viewer.id);
    const participant = v2.participants.some((p) => p.userId === viewer.id && (p.status === "ACCEPTED" || p.status === "ATTENDED"));
    if (!direct && !participant && !(v2.studentId && await canAccessPlayer(viewer, v2.studentId))) throw new Error("forbidden");
    return { kind: "v2" as const, row: v2, viewer, ownerId: v2.studentId ?? v2.hostId ?? v2.coachId };
  }
  const plan = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: { plan: { select: { userId: true, name: true } }, drills: { include: { exercise: true }, orderBy: { orderIndex: "asc" } }, log: true },
  });
  if (plan) {
    if (!(await canAccessPlayer(viewer, plan.plan.userId))) throw new Error("forbidden");
    return { kind: "plan" as const, row: plan, viewer, ownerId: plan.plan.userId };
  }
  const wb = await prisma.workbenchSession.findUnique({
    where: { id: sessionId },
    include: { drills: { orderBy: { sortOrder: "asc" } }, drillLogs: true },
  });
  if (!wb) throw new Error("not-found");
  if (!(await canAccessPlayer(viewer, wb.playerId))) throw new Error("forbidden");
  if (viewer.id === wb.playerId && (wb.hiddenByPlayer || wb.isTemplate || ["DRAFT", "SCHEDULED"].includes(wb.status) || !canReadOwnGroupCopy(wb))) throw new Error("not-found");
  if (wb.groupId && !wb.sourceGroupSessionId && /^wb-group-[a-f0-9]{64}$/.test(wb.id)) throw new Error("not-found");
  return { kind: "workbench" as const, row: wb, viewer, ownerId: wb.playerId };
}

export type LiveSource = Awaited<ReturnType<typeof loadAuthorizedLiveSource>>;
