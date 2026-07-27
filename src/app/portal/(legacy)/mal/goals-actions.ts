"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty, isoDate } from "@/lib/validation/schemas";
import { notify } from "@/lib/notifications";
import { resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";
import { PyramidArea } from "@/generated/prisma/client";

const GoalInputSchema = z.object({
  type: z.string().min(1, "Type er påkrevd"),
  title: nonEmpty(500),
  targetValue: z.number().nullable().optional(),
  targetDate: isoDate.nullable().optional(),
  linkedPyramidArea: z.nativeEnum(PyramidArea).nullable().optional(),
  linkedTestId: z.string().nullable().optional(),
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
  linkedPyramidArea?: PyramidArea | null;
  linkedTestId?: string | null;
};

export async function createGoal(input: GoalInput) {
  GoalInputSchema.parse(input);
  const user = await requireConsentingUser();
  if (!input.title.trim()) throw new Error("missing-title");

  await prisma.goal.create({
    data: {
      userId: user.id,
      type: input.type,
      title: input.title.trim(),
      targetValue: input.targetValue ?? null,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      linkedPyramidArea: input.linkedPyramidArea ?? null,
      linkedTestId: input.linkedTestId ?? null,
    },
  });

  revalidatePath("/portal/mal");
}

/**
 * Marker et mål som oppnådd. Datoen settes automatisk til i dag — vi lagrer
 * aldri en gjettet historisk dato for mål som ble oppnådd før dette feltet
 * fantes (de beholder achievedAt=null, «dato ukjent»).
 * Varsler både spilleren (in-app/push) og spillerens coach, jf. teksten i
 * «marker som oppnådd»-dialogen som lover at coach blir varslet.
 */
export async function markeerGoalSomOppnaadd(goalId: string) {
  GoalIdSchema.parse(goalId);
  const user = await requireConsentingUser();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.userId !== user.id) throw new Error("forbidden");

  const achievedAt = new Date();
  await prisma.goal.update({
    where: { id: goalId },
    data: { status: "ACHIEVED", achievedAt },
  });

  await notify({
    userId: user.id,
    type: "achievement",
    title: "Mål oppnådd",
    body: `«${goal.title}» er markert som oppnådd.`,
    link: `/portal/mal/goal/${goalId}`,
  });

  const coachId = await resolveCoachIdForPlayer(user.id);
  if (coachId !== user.id) {
    await notify({
      userId: coachId,
      type: "achievement",
      title: "Spiller nådde et mål",
      body: `${user.name ?? "En spiller"} nådde målet «${goal.title}».`,
      link: `/portal/mal/goal/${goalId}`,
    });
  }

  revalidatePath("/portal/mal");
  revalidatePath(`/portal/mal/goal/${goalId}`);
}

export async function slettGoal(goalId: string) {
  GoalIdSchema.parse(goalId);
  const user = await requireConsentingUser();

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
  const user = await requireConsentingUser();

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
  const user = await requireConsentingUser();

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
      linkedPyramidArea: input.linkedPyramidArea ?? null,
      linkedTestId: input.linkedTestId ?? null,
    },
  });

  revalidatePath("/portal/mal");
  revalidatePath(`/portal/mal/goal/${goalId}`);
}
