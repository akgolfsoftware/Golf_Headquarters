"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function acceptPlanAction(actionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const action = await prisma.planAction.findUnique({
    where: { id: actionId },
  });
  if (!action) throw new Error("not-found");
  if (action.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") {
    throw new Error("forbidden");
  }
  if (action.status !== "PENDING") return;

  // For PYRAMID_ADJUST: forenklet — bare marker som godkjent.
  // Faktisk planjustering kan kjøres av periodiseringsagenten
  // som henter accepted actions og oppretter sesjoner basert på dem.
  await prisma.planAction.update({
    where: { id: actionId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/agent-pipeline");
}

export async function rejectPlanAction(actionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

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
