"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

type OktData = {
  title: string;
  scheduledAt: Date;
  durationMin: number;
  pyramidArea: PyramidArea;
  rationale?: string;
};

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

/**
 * Flytt en økt til et nytt tidspunkt (drag-and-drop på plan-detalj).
 * Brukes for å endre scheduledAt innenfor samme plan, på tvers av uker/dager.
 */
export async function flyttOkt(sessionId: string, newScheduledAt: Date) {
  const user = await krevCoach();

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { id: true, planId: true, scheduledAt: true, title: true },
  });
  if (!session) throw new Error("not-found");

  const oldScheduledAt = session.scheduledAt;

  await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: { scheduledAt: newScheduledAt },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.session.move",
      target: sessionId,
      metadata: {
        planId: session.planId,
        title: session.title,
        from: oldScheduledAt.toISOString(),
        to: newScheduledAt.toISOString(),
      },
    },
  });

  revalidatePath(`/admin/plans/${session.planId}`);
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

/**
 * Valider eier-rettighet for en plan — coach må eie planen, eller være ADMIN.
 */
async function krevPlanRettighet(planId: string) {
  const user = await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { id: true, createdById: true },
  });
  if (!plan) throw new Error("not-found");
  if (user.role !== "ADMIN" && plan.createdById && plan.createdById !== user.id) {
    throw new Error("forbidden");
  }
  return { user, plan };
}

/**
 * Oppdater en eksisterende økt — tittel, tid, varighet, pyramide og rasjonale.
 */
export async function oppdaterOkt(sessionId: string, data: OktData) {
  const user = await krevCoach();

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { id: true, planId: true, title: true },
  });
  if (!session) throw new Error("not-found");

  // Sjekk rettighet via plan-eierskap
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: session.planId },
    select: { createdById: true },
  });
  if (!plan) throw new Error("not-found");
  if (user.role !== "ADMIN" && plan.createdById && plan.createdById !== user.id) {
    throw new Error("forbidden");
  }

  await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: {
      title: data.title,
      scheduledAt: data.scheduledAt,
      durationMin: data.durationMin,
      pyramidArea: data.pyramidArea,
      rationale: data.rationale ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.session.update",
      target: sessionId,
      metadata: {
        planId: session.planId,
        oldTitle: session.title,
        newTitle: data.title,
      },
    },
  });

  revalidatePath(`/admin/plans/${session.planId}`);
}

/**
 * Slett en økt permanent. Drills og log slettes via cascade.
 */
export async function slettOkt(sessionId: string) {
  const user = await krevCoach();

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { id: true, planId: true, title: true },
  });
  if (!session) throw new Error("not-found");

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: session.planId },
    select: { createdById: true },
  });
  if (!plan) throw new Error("not-found");
  if (user.role !== "ADMIN" && plan.createdById && plan.createdById !== user.id) {
    throw new Error("forbidden");
  }

  await prisma.trainingPlanSession.delete({ where: { id: sessionId } });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.session.delete",
      target: sessionId,
      metadata: { planId: session.planId, title: session.title },
    },
  });

  revalidatePath(`/admin/plans/${session.planId}`);
}

/**
 * Opprett en ny økt på en plan.
 */
export async function leggTilOkt(planId: string, data: OktData) {
  const { user } = await krevPlanRettighet(planId);

  const session = await prisma.trainingPlanSession.create({
    data: {
      planId,
      title: data.title,
      scheduledAt: data.scheduledAt,
      durationMin: data.durationMin,
      pyramidArea: data.pyramidArea,
      rationale: data.rationale ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.session.create",
      target: session.id,
      metadata: { planId, title: data.title },
    },
  });

  revalidatePath(`/admin/plans/${planId}`);
  return session.id;
}
