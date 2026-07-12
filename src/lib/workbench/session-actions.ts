"use server";

/**
 * Delt Workbench-persistering — spiller + coach (redigerer spillerens plan).
 */

import { executeSessionUpdate, type SessionUpdateInput } from "@/lib/workbench/session-update";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { dateForDayIndex, executeSessionMove, weekRefDate } from "@/lib/workbench/session-move";
import { deleteV2ForPlanSession, upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";
import { duplicateWeekCore } from "@/lib/workbench/duplicate-week";
import { sanitizeAkFormel, type AkFormelInput } from "@/lib/workbench/ak-formel";

const PYRAMID_AREAS = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type WbPyramidArea = (typeof PYRAMID_AREAS)[number];

function revalidateWorkbench(playerId: string) {
  revalidatePath("/portal/planlegge/workbench");
  revalidatePath(`/admin/spillere/${playerId}/workbench`);
}

async function ensureCoach() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return user;
}

async function sessionForPlayer(sessionId: string, _playerId: string) {
  return prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      scheduledAt: true,
      status: true,
      plan: { select: { userId: true, id: true } },
    },
  });
}

export async function coachMoveWorkbenchSession(
  playerId: string,
  sessionId: string,
  dayIndex: number,
  weekOffset = 0,
): Promise<{ ok: boolean; error?: string }> {
  const coach = await ensureCoach();
  const result = await executeSessionMove(prisma, {
    sessionId,
    playerId,
    dayIndex,
    coachId: coach.id,
    refDate: weekRefDate(weekOffset),
  });
  if (!result.ok) return result;
  revalidateWorkbench(playerId);
  return { ok: true };
}

export async function coachAddWorkbenchSession(
  playerId: string,
  input: {
    dayIndex: number;
    title: string;
    durMin: number;
    area: WbPyramidArea;
    hour: number;
    minute: number;
    weekOffset?: number;
    /** AK-formel fra palette-malen / valgt økt (renses server-side). */
    akFormel?: AkFormelInput;
  },
): Promise<{ ok: boolean; sessionId?: string; error?: string }> {
  const coach = await ensureCoach();
  if (input.dayIndex < 0 || input.dayIndex > 6) return { ok: false, error: "Ugyldig dag" };
  const area = PYRAMID_AREAS.includes(input.area) ? input.area : "TEK";

  let plan = await prisma.trainingPlan.findFirst({
    where: { userId: playerId },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    select: { id: true },
  });
  if (!plan) {
    plan = await prisma.trainingPlan.create({
      data: {
        userId: playerId,
        name: "Treningsplan",
        startDate: new Date(),
        status: "ACTIVE",
        isActive: true,
        createdById: coach.id,
      },
      select: { id: true },
    });
  }

  const ak = sanitizeAkFormel(input.akFormel);
  const created = await prisma.trainingPlanSession.create({
    data: {
      planId: plan.id,
      title: input.title.trim().slice(0, 120) || "Ny økt",
      scheduledAt: dateForDayIndex(
        input.dayIndex,
        input.hour,
        input.minute,
        weekRefDate(input.weekOffset ?? 0),
      ),
      durationMin: Math.max(5, Math.min(480, Math.round(input.durMin))),
      pyramidArea: area,
      lFase: ak.lFase,
      miljo: ak.miljo,
      csNivaa: ak.csNivaa,
      pressureLevel: ak.pressureLevel,
      pPosisjoner: ak.pPosisjoner,
      status: "PLANNED",
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      durationMin: true,
      pyramidArea: true,
    },
  });

  await upsertV2ForPlanSession({
    planSessionId: created.id,
    playerId,
    title: created.title,
    scheduledAt: created.scheduledAt,
    durationMin: created.durationMin,
    pyramidArea: created.pyramidArea,
    coachId: coach.id,
    miljo: ak.miljo,
  });

  revalidateWorkbench(playerId);
  return { ok: true, sessionId: created.id };
}

export async function coachUpdateWorkbenchSession(
  playerId: string,
  sessionId: string,
  patch: SessionUpdateInput,
): Promise<{ ok: boolean; error?: string }> {
  const coach = await ensureCoach();
  const result = await executeSessionUpdate(prisma, {
    sessionId,
    playerId,
    patch,
    coachId: coach.id,
  });
  if (!result.ok) return result;
  revalidateWorkbench(playerId);
  return { ok: true };
}

export async function coachRemoveWorkbenchSession(
  playerId: string,
  sessionId: string,
): Promise<{ ok: boolean; error?: string }> {
  await ensureCoach();
  const session = await sessionForPlayer(sessionId, playerId);
  if (!session || session.plan.userId !== playerId) {
    return { ok: false, error: "Økt ikke funnet" };
  }
  await deleteV2ForPlanSession(sessionId);
  await prisma.trainingPlanSession.delete({ where: { id: sessionId } });
  revalidateWorkbench(playerId);
  return { ok: true };
}

/**
 * «Dupliser forrige uke» (bølge 3) — kopier alle økter (med drills, inkl.
 * rep-type/volum) fra uka før `targetWeekOffset` inn i den uka, forskjøvet +7
 * dager (samme dag+tid). Legger til (rører ikke eksisterende økter i måluka).
 */
export async function coachDuplicateWeek(
  playerId: string,
  targetWeekOffset = 0,
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const coach = await ensureCoach();
  const result = await duplicateWeekCore(playerId, targetWeekOffset, coach.id);
  if (result.ok) revalidateWorkbench(playerId);
  return result;
}

/** Lukk hengende ACTIVE/PAUSED før ny start. Returnerer URL til økt-brief. */
export async function resolvePlanSessionLiveHref(
  sessionId: string,
  playerId?: string,
): Promise<{ ok: boolean; href?: string; error?: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const isCoach = user.role === "COACH" || user.role === "ADMIN";

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      plan: { select: { userId: true } },
    },
  });
  if (!session) return { ok: false, error: "Økt ikke funnet" };

  const ownerId = session.plan.userId;
  const erEier = ownerId === user.id;
  if (!erEier && !isCoach) return { ok: false, error: "Ingen tilgang" };
  if (isCoach && playerId && ownerId !== playerId) {
    return { ok: false, error: "Økt tilhører ikke valgt spiller" };
  }

  // Rydd opp hengende økter for spilleren (unngår ACTIVE-lås).
  await prisma.trainingPlanSession.updateMany({
    where: {
      plan: { userId: ownerId },
      status: { in: ["ACTIVE", "PAUSED"] },
      id: { not: sessionId },
    },
    data: { status: "SKIPPED" },
  });

  revalidateWorkbench(ownerId);
  return { ok: true, href: `/portal/live/${sessionId}/brief` };
}