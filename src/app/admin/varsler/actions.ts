"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "@/lib/agents/accept-plan-action";

async function assertKanBehandlePlanAction(
  viewer: { id: string; role: string },
  actionId: string,
): Promise<{ userId: string } | null> {
  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
    select: { userId: true, coachId: true, status: true },
  });
  if (!action || action.status !== "PENDING") return null;
  if (viewer.role === "ADMIN") return action;
  if (viewer.role !== "COACH") throw new Error("forbidden");
  if (action.coachId && action.coachId !== viewer.id) throw new Error("forbidden");
  if (!(await harCoachTilgangTilSpiller(viewer, action.userId))) {
    throw new Error("forbidden");
  }
  return action;
}

/** Godta et agent-forslag (PlanAction) og kjør executor. */
export async function godtaPlanAction(actionId: string): Promise<{ ok: boolean }> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertKanBehandlePlanAction(user, actionId);
  await acceptAndApplyPlanAction(actionId);
  revalidatePath("/admin/varsler");
  revalidatePath("/admin/godkjenninger");
  return { ok: true };
}

/** Avvis et agent-forslag uten å kjøre det. */
export async function avvisPlanAction(actionId: string): Promise<{ ok: boolean }> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const action = await assertKanBehandlePlanAction(user, actionId);
  if (action) {
    await prisma.planAction.update({
      where: { id: actionId },
      data: { status: "REJECTED", updatedAt: new Date() },
    });
  }
  revalidatePath("/admin/varsler");
  revalidatePath("/admin/godkjenninger");
  return { ok: true };
}

/** Marker en av coachens egne notifikasjoner som lest. */
export async function markerVarselLest(notificationId: string): Promise<{ ok: boolean }> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/admin/varsler");
  return { ok: true };
}
