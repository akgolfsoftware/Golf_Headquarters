"use server";

/**
 * Bruk en PlanTemplate i Workbench — oppretter TrainingPlanSession + V2-sync
 * for mal-uke 1 (standard «Bruk»-flyt) i inneværende kalenderuke.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";
import {
  scheduleTemplateWeek,
  type ScheduledTemplateSession,
} from "@/lib/workbench/map-template-week";

const PYRAMID_AREAS = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

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

export type AppliedTemplateSession = ScheduledTemplateSession & { sessionId: string };

async function ensurePlanForPlayer(playerId: string, createdById?: string) {
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
        ...(createdById ? { createdById } : {}),
      },
      select: { id: true },
    });
  }
  return plan;
}

async function applyTemplateCore(
  templateId: string,
  playerId: string,
  coachId: string | null,
  weekNr = 1,
): Promise<{ ok: boolean; sessions?: AppliedTemplateSession[]; error?: string }> {
  const template = await prisma.planTemplate.findUnique({
    where: { id: templateId },
    select: {
      id: true,
      sessions: {
        where: { ukeNr: weekNr },
        orderBy: [{ dagNr: "asc" }, { title: "asc" }],
        select: {
          title: true,
          varighetMin: true,
          pyramidArea: true,
          ukeNr: true,
          dagNr: true,
        },
      },
    },
  });

  if (!template) return { ok: false, error: "Mal ikke funnet" };
  if (template.sessions.length === 0) {
    return { ok: false, error: "Malen har ingen økter for denne uka" };
  }

  const scheduled = scheduleTemplateWeek(template.sessions, weekNr);
  if (scheduled.length === 0) return { ok: false, error: "Ingen gyldige økter i malen" };

  const plan = await ensurePlanForPlayer(playerId, coachId ?? undefined);
  const created: AppliedTemplateSession[] = [];

  for (const row of scheduled) {
    const area = PYRAMID_AREAS.includes(row.area as (typeof PYRAMID_AREAS)[number])
      ? row.area
      : "TEK";
    const session = await prisma.trainingPlanSession.create({
      data: {
        planId: plan.id,
        title: row.title.slice(0, 120),
        scheduledAt: dateForDayIndex(row.dayIndex, row.hour, row.minute),
        durationMin: row.durMin,
        pyramidArea: area,
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
      planSessionId: session.id,
      playerId,
      title: session.title,
      scheduledAt: session.scheduledAt,
      durationMin: session.durationMin,
      pyramidArea: session.pyramidArea,
      coachId: coachId ?? undefined,
    });

    created.push({
      ...row,
      sessionId: session.id,
    });
  }

  await prisma.planTemplate.update({
    where: { id: templateId },
    data: { usageCount: { increment: 1 } },
  });

  revalidateWorkbench(playerId);
  return { ok: true, sessions: created };
}

/** Spiller bruker mal på egen plan. */
export async function applyWorkbenchTemplate(
  templateId: string,
  weekNr = 1,
): Promise<{ ok: boolean; sessions?: AppliedTemplateSession[]; error?: string }> {
  const user = await requirePortalUser();
  return applyTemplateCore(templateId, user.id, null, weekNr);
}

/** Coach bruker mal på valgt spiller. */
export async function coachApplyWorkbenchTemplate(
  playerId: string,
  templateId: string,
  weekNr = 1,
): Promise<{ ok: boolean; sessions?: AppliedTemplateSession[]; error?: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  return applyTemplateCore(templateId, playerId, coach.id, weekNr);
}