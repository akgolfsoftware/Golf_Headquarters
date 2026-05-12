"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import type { PlanTemplatePayload } from "../template-payload";

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
 * Marker en avvist plan som nytt utkast. Brukes når spilleren har bedt om
 * endring (status REJECTED) og coachen skal jobbe videre på planen.
 * Setter status til DRAFT og nullstiller playerComment.
 */
export async function markerSomNyttUtkast(planId: string) {
  const user = await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");
  if (plan.status !== "REJECTED") {
    throw new Error("invalid-status");
  }

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "DRAFT", playerComment: null },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.coach.toDraft",
      target: planId,
      metadata: {
        planName: plan.name,
        userId: plan.userId,
        previousComment: plan.playerComment,
      },
    },
  });

  revalidatePath(`/admin/plans/${planId}`);
  revalidatePath(`/portal/coach/plans/${planId}`);
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
 * Kopier en plan (inkl. økter og drills) til en annen spiller.
 * Kopien lagres som inaktiv (DRAFT). Returnerer ny planId.
 */
export async function kopierPlan(
  planId: string,
  nyUserId: string,
  nyNavn?: string,
): Promise<{ newPlanId: string }> {
  const user = await krevCoach();

  const original = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: { sessions: { include: { drills: true } } },
  });
  if (!original) throw new Error("not-found");

  // Sjekk at mottaker er en eksisterende PLAYER og ikke samme som original
  const mottaker = await prisma.user.findUnique({
    where: { id: nyUserId },
    select: { id: true, role: true, name: true },
  });
  if (!mottaker) throw new Error("recipient-not-found");
  if (mottaker.role !== "PLAYER") throw new Error("recipient-not-player");
  if (mottaker.id === original.userId) throw new Error("same-player");

  const navnEndelig = (nyNavn?.trim() || `Kopi av ${original.name}`).slice(0, 200);

  const ny = await prisma.trainingPlan.create({
    data: {
      userId: nyUserId,
      name: navnEndelig,
      startDate: original.startDate,
      endDate: original.endDate,
      isActive: false,
      createdById: user.id,
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

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.copy",
      target: ny.id,
      metadata: {
        sourcePlanId: original.id,
        sourcePlanName: original.name,
        sourceUserId: original.userId,
        targetUserId: nyUserId,
        targetUserName: mottaker.name,
        newPlanName: navnEndelig,
        sessionsCopied: original.sessions.length,
      },
    },
  });

  revalidatePath("/admin/plans");
  return { newPlanId: ny.id };
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

/**
 * Lagre en eksisterende plan som gjenbrukbar mal (PlanTemplate).
 * Strukturen lagres som JSON-payload med ukentlig fordeling av økter,
 * pyramidArea og drills, slik at en ny plan-wizard kan forhåndsfylle
 * alle steg.
 */
export async function lagreSomMal(
  planId: string,
  malNavn: string,
  beskrivelse?: string,
): Promise<{ ok: true; templateId: string } | { ok: false; feil: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, feil: "unauthenticated" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { ok: false, feil: "forbidden" };
  }

  const navn = malNavn.trim();
  if (navn.length < 2) return { ok: false, feil: "Mal-navn må være minst 2 tegn." };
  if (navn.length > 120) return { ok: false, feil: "Mal-navn er for langt (maks 120 tegn)." };

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: {
      sessions: {
        orderBy: { scheduledAt: "asc" },
        include: { drills: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
  if (!plan) return { ok: false, feil: "Fant ikke planen." };

  // Beregn antall uker basert på start/end (fall back til siste økt).
  const start = plan.startDate;
  const slutt = plan.endDate ?? (plan.sessions.at(-1)?.scheduledAt ?? plan.startDate);
  const msPerUke = 7 * 24 * 60 * 60 * 1000;
  const weeks = Math.max(
    1,
    Math.round((slutt.getTime() - start.getTime()) / msPerUke),
  );

  // Tell pyramide-fordeling og økter per uke.
  const omradeTeller: Record<PyramidArea, number> = {
    FYS: 0,
    TEK: 0,
    SLAG: 0,
    SPILL: 0,
    TURN: 0,
  };
  for (const s of plan.sessions) omradeTeller[s.pyramidArea] += 1;

  const total = plan.sessions.length || 1;
  const allokering = {
    FYS: Math.round((omradeTeller.FYS / total) * 100),
    TEK: Math.round((omradeTeller.TEK / total) * 100),
    SLAG: Math.round((omradeTeller.SLAG / total) * 100),
    SPILL: Math.round((omradeTeller.SPILL / total) * 100),
    TURN: Math.round((omradeTeller.TURN / total) * 100),
  };
  // Justér slik at sum = 100 — legg differansen på TEK.
  const sum = allokering.FYS + allokering.TEK + allokering.SLAG + allokering.SPILL + allokering.TURN;
  allokering.TEK += 100 - sum;

  const okterPerUke = Math.max(1, Math.round(total / weeks));
  const varighetMin = plan.sessions[0]?.durationMin ?? 75;

  const sessionsPayload = plan.sessions.map((s) => {
    const dagOffset = Math.floor((s.scheduledAt.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.floor(dagOffset / 7);
    const day = ((dagOffset % 7) + 7) % 7;
    return {
      week,
      day,
      title: s.title,
      pyramidArea: s.pyramidArea,
      durationMin: s.durationMin,
      rationale: s.rationale,
      drills: s.drills.map((d) => ({
        exerciseId: d.exerciseId,
        repsSets: d.repsSets,
        csTarget: d.csTarget,
        notes: d.notes,
        orderIndex: d.orderIndex,
      })),
    };
  });

  const payload: PlanTemplatePayload = {
    weeks,
    allokering,
    ukeSkjema: { okterPerUke, varighetMin },
    sessions: sessionsPayload,
  };

  const template = await prisma.planTemplate.create({
    data: {
      name: navn,
      description: beskrivelse?.trim() || null,
      weeks,
      payload: payload as unknown as object,
      active: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.template.create",
      target: template.id,
      metadata: { planId, planName: plan.name, templateName: navn },
    },
  });

  revalidatePath("/admin/plans/templates");
  return { ok: true, templateId: template.id };
}
