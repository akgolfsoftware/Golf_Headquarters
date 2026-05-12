"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

async function krevAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

/**
 * Godkjenn plan — settes aktiv og synlig for spilleren.
 */
export async function godkjennPlan(planId: string) {
  const user = await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { isActive: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.approve",
      target: planId,
      metadata: { planName: plan.name, userId: plan.userId },
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
}

/**
 * Arkiver plan — settes inaktiv, beholder data og historikk.
 */
export async function arkiverPlan(planId: string) {
  const user = await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.archive",
      target: planId,
      metadata: { planName: plan.name, userId: plan.userId },
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
}

/**
 * Slett plan permanent. Kun ADMIN.
 */
export async function slettPlan(planId: string) {
  const user = await krevAdmin();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");

  await prisma.trainingPlan.delete({ where: { id: planId } });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.delete",
      target: planId,
      metadata: { planName: plan.name, userId: plan.userId },
    },
  });

  revalidatePath("/admin/plans");
  redirect("/admin/plans");
}
