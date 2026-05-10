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

export async function togglePlanActive(planId: string) {
  await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");
  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { isActive: !plan.isActive },
  });
  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
}

export async function dupliserPlan(planId: string): Promise<string | null> {
  await krevCoach();
  const original = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: { sessions: { include: { drills: true } } },
  });
  if (!original) return null;

  const ny = await prisma.trainingPlan.create({
    data: {
      userId: original.userId,
      name: `${original.name} (kopi)`,
      startDate: original.startDate,
      endDate: original.endDate,
      isActive: false,
      createdById: original.createdById,
      sessions: {
        create: original.sessions.map((s) => ({
          scheduledAt: s.scheduledAt,
          durationMin: s.durationMin,
          title: s.title,
          rationale: s.rationale,
          pyramidArea: s.pyramidArea,
          status: "PLANNED",
          drills: {
            create: s.drills.map((d) => ({
              exerciseId: d.exerciseId,
              repsSets: d.repsSets,
              csTarget: d.csTarget,
              notes: d.notes,
              orderIndex: d.orderIndex,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/admin/plans");
  return ny.id;
}

export type CreatePlanInput = {
  userId: string;
  name: string;
  startDate: string;
  endDate?: string;
};

export async function createPlan(input: CreatePlanInput): Promise<string> {
  const coach = await krevCoach();
  const plan = await prisma.trainingPlan.create({
    data: {
      userId: input.userId,
      name: input.name.trim() || "Ny plan",
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      isActive: true,
      createdById: coach.id,
    },
  });
  revalidatePath("/admin/plans");
  return plan.id;
}

export async function deletePlan(planId: string) {
  await krevCoach();
  await prisma.trainingPlan.delete({ where: { id: planId } });
  revalidatePath("/admin/plans");
  redirect("/admin/plans");
}
