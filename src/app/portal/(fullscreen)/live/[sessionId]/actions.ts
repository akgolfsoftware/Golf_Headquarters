"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { computeEffectiveness } from "@/lib/ai-plan/effectiveness";
import { notify } from "@/lib/notifications";

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

  // Sjekk om alle økter i planen nå er ferdige — i så fall auto-arkiver
  // planen, beregn effectiveness og opprett celebration-notifikasjon.
  // Sender også spilleren til feiringssiden i stedet for økt-detalj.
  let redirectMal = `/portal/tren/${input.sessionId}`;
  const sesjonMedPlan = await prisma.trainingPlanSession.findUnique({
    where: { id: input.sessionId },
    select: { planId: true },
  });
  if (sesjonMedPlan) {
    const planId = sesjonMedPlan.planId;
    const teller = await prisma.trainingPlanSession.groupBy({
      by: ["status"],
      where: { planId },
      _count: { _all: true },
    });
    const total = teller.reduce((sum, t) => sum + t._count._all, 0);
    const completed =
      teller.find((t) => t.status === "COMPLETED")?._count._all ?? 0;
    const planFortsattAapen = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      select: { id: true, status: true, userId: true, name: true },
    });
    if (
      planFortsattAapen &&
      planFortsattAapen.status !== "ARCHIVED" &&
      total > 0 &&
      completed === total
    ) {
      const now = new Date();
      await prisma.trainingPlan.update({
        where: { id: planId },
        data: { status: "ARCHIVED", isActive: false, endDate: now },
      });

      try {
        await computeEffectiveness(planId);
      } catch (err) {
        console.error("[completeSession] computeEffectiveness failed", err);
      }

      await notify({
        userId: planFortsattAapen.userId,
        type: "achievement",
        title: `Du fullførte planen: ${planFortsattAapen.name}`,
        body: "Se hvordan du har utviklet deg og be om ny plan.",
        link: `/portal/tren/feiring/${planId}`,
      });

      redirectMal = `/portal/tren/feiring/${planId}`;
    }
  }

  revalidatePath("/portal");
  revalidatePath("/portal/tren");
  revalidatePath(`/portal/tren/${input.sessionId}`);
  redirect(redirectMal);
}
