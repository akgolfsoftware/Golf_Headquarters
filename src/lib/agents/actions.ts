"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { applyAcceptedPlanAction } from "@/lib/agents/apply-action";

export async function acceptPlanAction(actionId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  if (action.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") {
    throw new Error("forbidden");
  }
  if (action.status !== "PENDING") return;

  // Anvend forslaget på planen (f.eks. PYRAMID_ADJUST → ny mål-allokering),
  // og marker som godkjent. Apply-laget er idempotent og en no-op for
  // rent rådgivende typer.
  await applyAcceptedPlanAction(action);

  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
}

export async function rejectPlanAction(actionId: string) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  if (action.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") {
    throw new Error("forbidden");
  }

  await prisma.planAction.update({
    where: { id: actionId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
}
