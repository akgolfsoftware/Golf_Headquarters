"use server";

/**
 * Delt Workbench-persistering — spiller + coach (redigerer spillerens plan).
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

const PYRAMID_AREAS = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type WbPyramidArea = (typeof PYRAMID_AREAS)[number];

function mondayOf(d: Date): Date {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7;
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - dow);
  return x;
}

function dateForDayIndex(dayIndex: number, hour: number, minute: number): Date {
  const target = mondayOf(new Date());
  target.setDate(target.getDate() + dayIndex);
  target.setHours(hour, minute, 0, 0);
  return target;
}

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
): Promise<{ ok: boolean; error?: string }> {
  await ensureCoach();
  if (dayIndex < 0 || dayIndex > 6) return { ok: false, error: "Ugyldig dag" };

  const session = await sessionForPlayer(sessionId, playerId);
  if (!session || session.plan.userId !== playerId) {
    return { ok: false, error: "Økt ikke funnet" };
  }

  const target = dateForDayIndex(
    dayIndex,
    session.scheduledAt.getHours(),
    session.scheduledAt.getMinutes(),
  );

  await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: { scheduledAt: target },
  });
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

  const created = await prisma.trainingPlanSession.create({
    data: {
      planId: plan.id,
      title: input.title.trim().slice(0, 120) || "Ny økt",
      scheduledAt: dateForDayIndex(input.dayIndex, input.hour, input.minute),
      durationMin: Math.max(5, Math.min(480, Math.round(input.durMin))),
      pyramidArea: area,
      status: "PLANNED",
    },
    select: { id: true },
  });

  revalidateWorkbench(playerId);
  return { ok: true, sessionId: created.id };
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
  await prisma.trainingPlanSession.delete({ where: { id: sessionId } });
  revalidateWorkbench(playerId);
  return { ok: true };
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

  if (session.status === "PLANNED") {
    await prisma.trainingPlanSession.update({
      where: { id: sessionId },
      data: { status: "ACTIVE" },
    });
  }

  revalidateWorkbench(ownerId);
  return { ok: true, href: `/portal/tren/${sessionId}` };
}