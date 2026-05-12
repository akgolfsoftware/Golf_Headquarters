"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export type DrillResult = {
  drillId: string;
  csAchieved?: number;
  notes?: string;
};

export type SessionLogInput = {
  sessionId: string;
  startedAt: string; // ISO
  csAchieved?: number;
  notes?: string;
  rating?: number;
};

async function verifyEierskap(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: { plan: { select: { userId: true } } },
  });
  if (!session) throw new Error("not-found");
  if (session.plan.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") {
    throw new Error("forbidden");
  }
  return { user, session };
}

export async function startSession(sessionId: string) {
  const { session } = await verifyEierskap(sessionId);
  if (session.status === "PLANNED") {
    await prisma.trainingPlanSession.update({
      where: { id: sessionId },
      data: { status: "ACTIVE" },
    });
  }
  revalidatePath(`/portal/live/${sessionId}`);
}

export async function completeSession(input: SessionLogInput) {
  await verifyEierskap(input.sessionId);

  await prisma.trainingPlanSessionLog.upsert({
    where: { sessionId: input.sessionId },
    create: {
      sessionId: input.sessionId,
      startedAt: new Date(input.startedAt),
      completedAt: new Date(),
      csAchieved: input.csAchieved ?? null,
      notes: input.notes ?? null,
      rating: input.rating ?? null,
    },
    update: {
      completedAt: new Date(),
      csAchieved: input.csAchieved ?? null,
      notes: input.notes ?? null,
      rating: input.rating ?? null,
    },
  });

  await prisma.trainingPlanSession.update({
    where: { id: input.sessionId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/tren");
  revalidatePath(`/portal/tren/${input.sessionId}`);
  redirect(`/portal/tren/${input.sessionId}`);
}
