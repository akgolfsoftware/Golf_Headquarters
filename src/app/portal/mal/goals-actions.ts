"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export type GoalInput = {
  type: string;
  title: string;
  targetValue?: number | null;
  targetDate?: string | null;
};

export async function createGoal(input: GoalInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (!input.title.trim()) throw new Error("missing-title");

  await prisma.goal.create({
    data: {
      userId: user.id,
      type: input.type,
      title: input.title.trim(),
      targetValue: input.targetValue ?? null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    },
  });

  revalidatePath("/portal/mal");
}

export async function markeerGoalSomOppnaadd(goalId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");

  await prisma.goal.update({
    where: { id: goalId },
    data: { status: "ACHIEVED" },
  });

  revalidatePath("/portal/mal");
  revalidatePath(`/portal/mal/goal/${goalId}`);
}

export async function slettGoal(goalId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");

  await prisma.goal.delete({ where: { id: goalId } });
  revalidatePath("/portal/mal");
  redirect("/portal/mal");
}
