"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { notify, notifyMany } from "@/lib/notifications";
import { computeEffectiveness } from "@/lib/ai-plan/effectiveness";
import type {
  PyramidArea,
  SkillArea,
  SessionEnvironment,
  LPhase,
} from "@/generated/prisma/client";
import type { PlanTemplatePayload } from "@/app/admin/(legacy)/plans/template-payload";
import {
  GENERERT_FRA,
  deleteV2ForPlanSession,
  syncV2FromPlanSessionId,
} from "@/lib/workbench/v2-sync";

type OktData = {
  title: string;
  scheduledAt: Date;
  durationMin: number;
  pyramidArea: PyramidArea;
  rationale?: string;
  skillArea?: SkillArea;
  environment?: SessionEnvironment;
  lPhase?: LPhase;
};

export type DrillInput = {
  exerciseId: string;
  sets?: number;
  reps?: number;
  csTarget?: number;
  notes?: string;
};

export type LeggTilOktInput = {
  planId: string;
  scheduledAt: string; // ISO
  durationMin: number;
  title: string;
  rationale?: string;
  pyramidArea: PyramidArea;
  skillArea?: SkillArea;
  environment?: SessionEnvironment;
  lPhase?: LPhase;
  drills: DrillInput[];
};

function repsSetsString(sets?: number, reps?: number): string {
  if (sets && reps) return `${sets}x${reps}`;
  if (reps) return `${reps}`;
  if (sets) return `${sets} sett`;
  return "—";
}

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
  await syncV2FromPlanSessionId(sessionId);

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
 * Send plan til spiller for godkjenning — status PENDING_PLAYER.
 * Brukes når coach er ferdig med utkastet og vil at spilleren skal vurdere
 * planen før den aktiveres.
 */
export async function sendTilSpiller(planId: string) {
  const user = await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "PENDING_PLAYER", playerComment: null },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.sendToPlayer",
      target: planId,
      metadata: { planName: plan.name, userId: plan.userId },
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
  revalidatePath(`/portal/spiller/plans/${planId}`);
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
 * Pause en aktiv plan. Settes til status=PAUSED, isActive=false.
 * Spilleren kan fortsatt se planen, men nye økter triggers ikke.
 */
export async function pausePlan(planId: string) {
  const user = await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "PAUSED", isActive: false },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.pause",
      target: planId,
      metadata: { planName: plan.name, userId: plan.userId },
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
}

/**
 * Gjenoppta en pauset plan. Settes til status=ACTIVE, isActive=true.
 */
export async function resumePlan(planId: string) {
  const user = await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "ACTIVE", isActive: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.resume",
      target: planId,
      metadata: { planName: plan.name, userId: plan.userId },
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
}

/**
 * Avslutt plan permanent. Settes til status=ARCHIVED, isActive=false, endDate=now.
 * Brukes når perioden er ferdig eller spiller stoppet planen.
 *
 * Trigger effectiveness-beregning best-effort etter arkivering — feiler vi her,
 * skal ikke arkiveringen rulles tilbake.
 */
export async function endPlan(planId: string) {
  const user = await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("not-found");

  const now = new Date();
  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "ARCHIVED", isActive: false, endDate: now },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.end",
      target: planId,
      metadata: {
        planName: plan.name,
        userId: plan.userId,
        endedAt: now.toISOString(),
      },
    },
  });

  // Best-effort: regn ut effectiveness umiddelbart. Feiler vi her, fortsetter
  // brukeren — beregningen kan kjøres på nytt manuelt eller via cron.
  try {
    await computeEffectiveness(planId);
  } catch (err) {
    console.error("[endPlan] computeEffectiveness failed", err);
  }

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
}

/**
 * Marker en plan som fullført fra coach-siden. Settes til status=ARCHIVED,
 * isActive=false, endDate=now. Trigger effectiveness-beregning og sender en
 * "fullført"-notifikasjon til spilleren med link til feiringssiden.
 */
export async function markPlanCompleted(
  planId: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await krevCoach();
  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) return { ok: false, feil: "Fant ikke planen." };
  if (plan.status === "ARCHIVED") {
    return { ok: false, feil: "Planen er allerede fullført." };
  }

  const now = new Date();
  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "ARCHIVED", isActive: false, endDate: now },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.complete",
      target: planId,
      metadata: {
        planName: plan.name,
        userId: plan.userId,
        completedAt: now.toISOString(),
      },
    },
  });

  try {
    await computeEffectiveness(planId);
  } catch (err) {
    console.error("[markPlanCompleted] computeEffectiveness failed", err);
  }

  await notify({
    userId: plan.userId,
    type: "achievement",
    title: `Du fullførte planen: ${plan.name}`,
    body: "Se hvordan du har utviklet deg og be om ny plan.",
    link: `/portal/tren/feiring/${planId}`,
  });

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${planId}`);
  revalidatePath(`/portal/tren`);
  return { ok: true };
}

/**
 * Coach vurderer en fullført plan — selfRating + coachRating + notater.
 * Brukes fra spiller-detalj "Effekt"-seksjonen.
 */
export async function rateEffectiveness(input: {
  effectivenessId: string;
  selfRating?: number | null;
  coachRating?: number | null;
  notes?: string | null;
}): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await krevCoach();

  const eff = await prisma.planEffectiveness.findUnique({
    where: { id: input.effectivenessId },
    select: { id: true, userId: true, planId: true },
  });
  if (!eff) return { ok: false, feil: "Fant ikke effektivitets-raden." };

  function validerRating(v: number | null | undefined): number | null {
    if (v === null || v === undefined) return null;
    if (Number.isNaN(v)) return null;
    if (v < 1 || v > 5) return null;
    return Math.round(v * 10) / 10;
  }

  const selfRating = validerRating(input.selfRating);
  const coachRating = validerRating(input.coachRating);
  const notes = input.notes?.trim() ? input.notes.trim().slice(0, 2000) : null;

  await prisma.planEffectiveness.update({
    where: { id: input.effectivenessId },
    data: {
      selfRating,
      coachRating,
      notes,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.effectiveness.rate",
      target: input.effectivenessId,
      metadata: {
        planId: eff.planId,
        userId: eff.userId,
        selfRating,
        coachRating,
        notesLength: notes?.length ?? 0,
      },
    },
  });

  revalidatePath(`/admin/spillere/${eff.userId}`);
  revalidatePath(`/admin/plans/${eff.planId}`);
  return { ok: true };
}

/**
 * Avbryt en planlagt økt (status=CANCELLED). Beholder data, men spiller
 * ser at den er kansellert.
 */
export async function cancelSession(sessionId: string) {
  const user = await krevCoach();

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { id: true, planId: true, title: true, status: true },
  });
  if (!session) throw new Error("not-found");
  if (session.status === "COMPLETED") {
    throw new Error("cannot-cancel-completed");
  }

  await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });
  // Speil avlysningen til spillerens live-økt.
  await prisma.trainingSessionV2.updateMany({
    where: { generertFra: GENERERT_FRA, generertFraId: sessionId, status: { in: ["PLANNED", "IN_PROGRESS"] } },
    data: { status: "CANCELLED" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.session.cancel",
      target: sessionId,
      metadata: { planId: session.planId, title: session.title },
    },
  });

  revalidatePath(`/admin/plans/${session.planId}`);
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

  // Rydd live-speilene FØR cascade-sletting fjerner plan-øktene (ellers
  // blir spillerens V2-økter foreldreløse og står igjen i Gjør-lista).
  const okter = await prisma.trainingPlanSession.findMany({
    where: { planId },
    select: { id: true },
  });
  if (okter.length > 0) {
    await prisma.trainingSessionV2.deleteMany({
      where: { generertFra: GENERERT_FRA, generertFraId: { in: okter.map((s) => s.id) } },
    });
  }

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
      skillArea: data.skillArea ?? null,
      environment: data.environment ?? null,
      lPhase: data.lPhase ?? null,
      rationale: data.rationale ?? null,
    },
  });
  await syncV2FromPlanSessionId(sessionId);

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
 * Send coach-feedback på en fullført live-økt.
 *
 * Lagrer feedback på TrainingPlanSessionLog.coachFeedback + audit-log.
 * Ingen e-post i v1 — spilleren ser tilbakemeldingen i portal/tren/[sessionId].
 */
export async function sendOktFeedback(
  sessionId: string,
  text: string,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, feil: "unauthenticated" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { ok: false, feil: "forbidden" };
  }

  const trimmed = text.trim();
  if (trimmed.length < 2) {
    return { ok: false, feil: "Tilbakemeldingen er for kort." };
  }
  if (trimmed.length > 2000) {
    return { ok: false, feil: "Tilbakemeldingen er for lang (maks 2000 tegn)." };
  }

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      planId: true,
      title: true,
      status: true,
      plan: { select: { userId: true, createdById: true } },
      log: { select: { id: true } },
    },
  });
  if (!session) return { ok: false, feil: "Fant ikke økten." };
  if (session.status !== "COMPLETED" || !session.log) {
    return { ok: false, feil: "Økten er ikke fullført ennå." };
  }
  if (
    user.role !== "ADMIN" &&
    session.plan.createdById &&
    session.plan.createdById !== user.id
  ) {
    return { ok: false, feil: "Du har ikke tilgang til denne planen." };
  }

  const now = new Date();
  await prisma.trainingPlanSessionLog.update({
    where: { sessionId },
    data: {
      coachFeedback: trimmed,
      coachFeedbackAt: now,
      coachFeedbackById: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.session.feedback",
      target: sessionId,
      metadata: {
        planId: session.planId,
        playerUserId: session.plan.userId,
        sessionTitle: session.title,
        feedbackLength: trimmed.length,
      },
    },
  });

  revalidatePath(`/admin/plans/${session.planId}`);
  revalidatePath(`/portal/tren/${sessionId}`);
  return { ok: true };
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
  await deleteV2ForPlanSession(sessionId);

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
 * Opprett en ny økt på en plan. Støtter både enkelt-form (uten drills/extras)
 * og strukturert form (med skillArea, environment, lPhase, drills).
 */
export async function leggTilOkt(input: LeggTilOktInput) {
  const { user } = await krevPlanRettighet(input.planId);

  const drillsCreate = (input.drills ?? []).map((d, idx) => ({
    exerciseId: d.exerciseId,
    repsSets: repsSetsString(d.sets, d.reps),
    sets: d.sets ?? null,
    reps: d.reps ?? null,
    csTarget: d.csTarget ?? null,
    notes: d.notes ?? null,
    orderIndex: idx,
  }));

  const session = await prisma.trainingPlanSession.create({
    data: {
      planId: input.planId,
      title: input.title,
      scheduledAt: new Date(input.scheduledAt),
      durationMin: input.durationMin,
      pyramidArea: input.pyramidArea,
      skillArea: input.skillArea ?? null,
      environment: input.environment ?? null,
      lPhase: input.lPhase ?? null,
      rationale: input.rationale ?? null,
      drills: drillsCreate.length ? { create: drillsCreate } : undefined,
    },
  });
  await syncV2FromPlanSessionId(session.id);

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.session.create",
      target: session.id,
      metadata: {
        planId: input.planId,
        title: input.title,
        drillCount: drillsCreate.length,
      },
    },
  });

  revalidatePath(`/admin/plans/${input.planId}`);
  return session.id;
}

/**
 * Opprett en ny ExerciseDefinition fra wizard (inline). Kun coach/admin.
 */
export async function opprettExerciseDefinition(data: {
  name: string;
  description?: string;
  pyramidArea: PyramidArea;
  lPhase: LPhase;
}) {
  await krevCoach();
  const navn = data.name.trim();
  if (navn.length < 2) throw new Error("Navn må være minst 2 tegn.");
  const ny = await prisma.exerciseDefinition.create({
    data: {
      name: navn,
      description: data.description?.trim() || null,
      pyramidArea: data.pyramidArea,
      lPhase: data.lPhase,
    },
  });
  return ny;
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
      varighetUker: weeks,
      kategori: "G", // default — coach kan justere senere
      lPhase: "GRUNN",
      disciplinFordeling: payload as unknown as object,
      approved: true,
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

  revalidatePath("/admin/plan-templates");
  return { ok: true, templateId: template.id };
}

/**
 * Tildel en eksisterende treningsplan til én eller flere spillere.
 *
 * Plan-mønsteret følger `kopierPlan`: hver mottaker får sin egen kopi av planen
 * (med økter og drills) — det finnes ingen TrainingPlanAssignment-modell i v1.
 *
 * - Coach må eie planen, eller være ADMIN.
 * - Mottakere må ha role=PLAYER.
 * - startDate forskyver alle økter med differansen mellom ny og original startDate.
 * - Hver mottaker får en in-app notification.
 */
const AssignSchema = z.object({
  planId: z.string().min(1),
  playerIds: z.array(z.string().min(1)).min(1, "Velg minst én spiller."),
  startDate: z
    .string()
    .min(1, "Velg startdato.")
    .refine((s) => !Number.isNaN(new Date(s).getTime()), {
      message: "Ugyldig startdato.",
    }),
  welcomeMessage: z.string().max(2000).optional(),
  replaceActive: z.boolean().optional(),
});

export type AssignPlanResult =
  | {
      ok: true;
      assignedCount: number;
      skippedCount: number;
      assignments: { userId: string; newPlanId: string }[];
    }
  | { ok: false; feil: string };

export async function assignPlanToPlayers(input: {
  planId: string;
  playerIds: string[];
  startDate: string; // ISO yyyy-mm-dd eller full ISO
  welcomeMessage?: string;
  replaceActive?: boolean;
}): Promise<AssignPlanResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, feil: "unauthenticated" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { ok: false, feil: "forbidden" };
  }

  const parsed = AssignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      feil: parsed.error.issues[0]?.message ?? "Ugyldig inndata.",
    };
  }
  const data = parsed.data;

  const original = await prisma.trainingPlan.findUnique({
    where: { id: data.planId },
    include: { sessions: { include: { drills: true } } },
  });
  if (!original) return { ok: false, feil: "Fant ikke planen." };

  if (
    user.role !== "ADMIN" &&
    original.createdById &&
    original.createdById !== user.id
  ) {
    return { ok: false, feil: "Du har ikke tilgang til denne planen." };
  }

  const playerIds = Array.from(new Set(data.playerIds));

  const mottakere = await prisma.user.findMany({
    where: { id: { in: playerIds }, role: "PLAYER" },
    select: { id: true, name: true, tier: true },
  });
  if (mottakere.length === 0) {
    return { ok: false, feil: "Ingen gyldige spillere valgt." };
  }

  const nyStart = new Date(data.startDate);
  const dagerOffset = Math.round(
    (nyStart.getTime() - original.startDate.getTime()) / (24 * 60 * 60 * 1000),
  );
  const nyEnd = original.endDate
    ? new Date(
        original.endDate.getTime() + dagerOffset * 24 * 60 * 60 * 1000,
      )
    : null;

  // Hvis replaceActive=true, marker eksisterende aktive planer for disse
  // spillerne som arkivert. Vi pauser ikke — vi setter isActive=false slik at
  // den nye planen blir den førende uten å miste historikken.
  if (data.replaceActive) {
    await prisma.trainingPlan.updateMany({
      where: {
        userId: { in: mottakere.map((m) => m.id) },
        isActive: true,
        status: { in: ["ACTIVE", "PENDING_PLAYER"] },
      },
      data: { isActive: false, status: "ARCHIVED" },
    });
  }

  const assignments: { userId: string; newPlanId: string }[] = [];
  for (const mottaker of mottakere) {
    const ny = await prisma.trainingPlan.create({
      data: {
        userId: mottaker.id,
        name: original.name,
        startDate: nyStart,
        endDate: nyEnd,
        isActive: false,
        status: "DRAFT",
        createdById: user.id,
        sessions: {
          create: original.sessions.map((s) => ({
            scheduledAt: new Date(
              s.scheduledAt.getTime() + dagerOffset * 24 * 60 * 60 * 1000,
            ),
            durationMin: s.durationMin,
            title: s.title,
            rationale: s.rationale,
            pyramidArea: s.pyramidArea,
            skillArea: s.skillArea,
            environment: s.environment,
            lPhase: s.lPhase,
            pressureLevel: s.pressureLevel,
            status: "PLANNED",
            drills: {
              create: s.drills.map((d) => ({
                exerciseId: d.exerciseId,
                repsSets: d.repsSets,
                sets: d.sets,
                reps: d.reps,
                csTarget: d.csTarget,
                notes: d.notes,
                orderIndex: d.orderIndex,
              })),
            },
          })),
        },
      },
      select: { id: true },
    });
    assignments.push({ userId: mottaker.id, newPlanId: ny.id });
  }

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "plan.assign",
      target: original.id,
      metadata: {
        planName: original.name,
        assignedTo: assignments,
        startDate: nyStart.toISOString(),
        replacedActive: data.replaceActive ?? false,
      },
    },
  });

  const coachName = user.name?.trim() || "Coachen din";
  const tittel = `Ny treningsplan: ${original.name}`;
  const kropp = (
    data.welcomeMessage?.trim() ||
    `${coachName} har tildelt deg en ny treningsplan: ${original.name}.`
  ).slice(0, 600);

  await notifyMany(
    assignments.map((a) => a.userId),
    {
      type: "plan",
      title: tittel,
      body: kropp,
      link: "/portal/spiller/plans",
    },
  );

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${data.planId}`);

  return {
    ok: true,
    assignedCount: assignments.length,
    skippedCount: playerIds.length - assignments.length,
    assignments,
  };
}
