"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { acceptAndApplyPlanAction } from "./accept-plan-action";

export async function acceptPlanAction(actionId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  if (
    action.userId !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "COACH"
  ) {
    throw new Error("forbidden");
  }
  if (action.status !== "PENDING") return;

  await acceptAndApplyPlanAction(actionId);

  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
  revalidatePath("/admin/godkjenninger");
  revalidatePath(`/admin/godkjenninger/${actionId}`);
  revalidatePath("/admin/approvals");
}

export async function rejectPlanAction(actionId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  if (
    action.userId !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "COACH"
  ) {
    throw new Error("forbidden");
  }

  await prisma.planAction.update({
    where: { id: actionId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
  revalidatePath("/admin/godkjenninger");
}