"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";

/** Samme tilgang, beslutningsspor og delingskontroll som den ordinære køen. */
export async function godtaPlanAction(actionId: string): Promise<{ ok: boolean }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await acceptPlanAction(actionId);
  revalidatePath("/admin/varsler");
  return { ok: true };
}

export async function avvisPlanAction(actionId: string): Promise<{ ok: boolean }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await rejectPlanAction(actionId);
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
