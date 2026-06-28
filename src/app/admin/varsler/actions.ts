"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "@/lib/agents/accept-plan-action";

/** Godta et agent-forslag (PlanAction) og kjør executor. */
export async function godtaPlanAction(actionId: string): Promise<{ ok: boolean }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await acceptAndApplyPlanAction(actionId);
  revalidatePath("/admin/varsler");
  return { ok: true };
}

/** Avvis et agent-forslag uten å kjøre det. */
export async function avvisPlanAction(actionId: string): Promise<{ ok: boolean }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const action = await prisma.planAction.findUnique({ where: { id: actionId } });
  if (action && action.status === "PENDING") {
    await prisma.planAction.update({
      where: { id: actionId },
      data: { status: "REJECTED", updatedAt: new Date() },
    });
  }
  revalidatePath("/admin/varsler");
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
