"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty, isoDate } from "@/lib/validation/schemas";

const GoalInputSchema = z.object({
  type: z.string().min(1, "Type er påkrevd"),
  title: nonEmpty(500),
  targetValue: z.number().nullable().optional(),
  targetDate: isoDate.nullable().optional(),
});

const GoalIdSchema = z.string().min(1, "Mål-ID er påkrevd");
const AvbrytGoalSchema = z.object({
  goalId: z.string().min(1, "Mål-ID er påkrevd"),
  reason: z.string().max(1000).optional(),
});

export type GoalInput = {
  type: string;
  title: string;
  targetValue?: number | null;
  targetDate?: string | null;
};

export async function createGoal(input: GoalInput) {
  GoalInputSchema.parse(input);
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
  GoalIdSchema.parse(goalId);
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
  GoalIdSchema.parse(goalId);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");

  await prisma.goal.delete({ where: { id: goalId } });
  revalidatePath("/portal/mal");
  redirect("/portal/mal");
}

/**
 * Avbryt et mål — markerer det som ABANDONED og lagrer grunn i payload.
 * I motsetning til `slettGoal` beholdes historikken.
 */
export async function avbrytGoal(goalId: string, reason: string) {
  AvbrytGoalSchema.parse({ goalId, reason });
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");

  const eksisterende =
    goal.payload &&
    typeof goal.payload === "object" &&
    !Array.isArray(goal.payload)
      ? (goal.payload as Record<string, unknown>)
      : {};

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      status: "ABANDONED",
      payload: {
        ...eksisterende,
        abandonedAt: new Date().toISOString(),
        abandonReason: reason.trim() || null,
      },
    },
  });

  revalidatePath("/portal/mal");
  revalidatePath(`/portal/mal/goal/${goalId}`);
}

/**
 * Endre et mål — oppdaterer tittel, type, targetValue og targetDate.
 * Brukes fra «Endre mål»-modalen i mål-detalj.
 */
export async function endreGoal(goalId: string, input: GoalInput) {
  GoalIdSchema.parse(goalId);
  GoalInputSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");
  if (!input.title.trim()) throw new Error("missing-title");

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      type: input.type,
      title: input.title.trim(),
      targetValue: input.targetValue ?? null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    },
  });

  revalidatePath("/portal/mal");
  revalidatePath(`/portal/mal/goal/${goalId}`);
}
