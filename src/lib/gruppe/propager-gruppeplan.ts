import "server-only";

import type { PyramidArea } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { mondayOf, weekRefDate } from "@/lib/workbench/session-move-math";
const GENERERT_FRA_GROUP = "GROUP_SCHEDULE";
const RATIONALE_PREFIX = "groupSchedule:";

export type PropagerResult = {
  members: number;
  schedules: number;
  upserted: number;
  removed: number;
};

/** Beregn forekomst av en WEEKLY-rad i måluka (mandag-basert). */
export function occurrenceInWeek(
  schedule: { startAt: Date; endAt: Date },
  weekMonday: Date,
): { scheduledAt: Date; durationMin: number } {
  const dayIndex = (schedule.startAt.getDay() + 6) % 7;
  const scheduledAt = new Date(weekMonday);
  scheduledAt.setHours(
    schedule.startAt.getHours(),
    schedule.startAt.getMinutes(),
    schedule.startAt.getSeconds(),
    schedule.startAt.getMilliseconds(),
  );
  scheduledAt.setDate(scheduledAt.getDate() + dayIndex);
  const durationMin = Math.max(
    5,
    Math.round((schedule.endAt.getTime() - schedule.startAt.getTime()) / 60_000),
  );
  return { scheduledAt, durationMin };
}

async function ensureActivePlan(userId: string, coachId: string | null) {
  let plan = await prisma.trainingPlan.findFirst({
    where: { userId, isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (!plan) {
    plan = await prisma.trainingPlan.create({
      data: {
        userId,
        name: "Treningsplan",
        startDate: new Date(),
        status: "ACTIVE",
        isActive: true,
        createdById: coachId,
      },
      select: { id: true },
    });
  }
  return plan.id;
}

/**
 * Propagerer gruppens faste timeplan (GroupSchedule WEEKLY) til alle medlemmer
 * for én uke. Kobler plan-økt via rationale + V2 via generertFra/GROUP_SCHEDULE.
 */
export async function propagerGruppeplanTilMedlemmer(
  groupId: string,
  weekOffset = 0,
): Promise<PropagerResult> {
  const gruppe = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      coachId: true,
      members: { select: { userId: true } },
      schedules: {
        where: { OR: [{ recurring: "WEEKLY" }, { recurring: null }] },
        select: { id: true, title: true, startAt: true, endAt: true, recurring: true },
      },
    },
  });
  if (!gruppe) return { members: 0, schedules: 0, upserted: 0, removed: 0 };

  const weekly = gruppe.schedules.filter((s) => s.recurring === "WEEKLY");
  const weekMonday = mondayOf(weekRefDate(weekOffset));
  const weekEnd = new Date(weekMonday);
  weekEnd.setDate(weekEnd.getDate() + 7);

  let upserted = 0;
  let removed = 0;

  for (const memberId of gruppe.members.map((m) => m.userId)) {
    const planId = await ensureActivePlan(memberId, gruppe.coachId);

    for (const sch of weekly) {
      const { scheduledAt, durationMin } = occurrenceInWeek(sch, weekMonday);
      const rationale = `${RATIONALE_PREFIX}${sch.id}`;

      const existing = await prisma.trainingPlanSession.findFirst({
        where: {
          planId,
          rationale,
          scheduledAt: { gte: weekMonday, lt: weekEnd },
        },
        select: { id: true, status: true },
      });

      if (existing && (existing.status === "COMPLETED" || existing.status === "ACTIVE")) {
        continue;
      }

      const pyramidArea: PyramidArea = "TEK";
      if (existing) {
        await prisma.trainingPlanSession.update({
          where: { id: existing.id },
          data: {
            title: sch.title,
            scheduledAt,
            durationMin,
            status: "PLANNED",
          },
        });
        await prisma.trainingSessionV2.updateMany({
          where: {
            studentId: memberId,
            generertFra: GENERERT_FRA_GROUP,
            generertFraId: sch.id,
            startTime: { gte: weekMonday, lt: weekEnd },
          },
          data: {
            title: sch.title,
            startTime: scheduledAt,
            endTime: new Date(scheduledAt.getTime() + durationMin * 60_000),
            status: "PLANNED",
          },
        });
      } else {
        const created = await prisma.trainingPlanSession.create({
          data: {
            planId,
            title: sch.title,
            scheduledAt,
            durationMin,
            pyramidArea,
            rationale,
            status: "PLANNED",
          },
          select: { id: true },
        });
        await prisma.trainingSessionV2.create({
          data: {
            title: sch.title,
            studentId: memberId,
            coachId: gruppe.coachId ?? memberId,
            startTime: scheduledAt,
            endTime: new Date(scheduledAt.getTime() + durationMin * 60_000),
            miljo: "M2",
            practiceType: "BLOKK",
            status: "PLANNED",
            isCoachCreated: true,
            generertFra: GENERERT_FRA_GROUP,
            generertFraId: sch.id,
          },
        });
        void created;
      }
      upserted++;
    }

    // Fjern foreldede gruppe-økter i uka som ikke lenger finnes i timeplanen.
    const stale = await prisma.trainingPlanSession.findMany({
      where: {
        planId,
        scheduledAt: { gte: weekMonday, lt: weekEnd },
        rationale: { startsWith: RATIONALE_PREFIX },
      },
      select: { id: true, rationale: true, status: true },
    });
    const activeScheduleIds = new Set(weekly.map((s) => s.id));
    for (const row of stale) {
      const sid = row.rationale?.slice(RATIONALE_PREFIX.length);
      if (!sid || activeScheduleIds.has(sid)) continue;
      if (row.status === "COMPLETED" || row.status === "ACTIVE") continue;
      await prisma.trainingPlanSession.delete({ where: { id: row.id } });
      await prisma.trainingSessionV2.deleteMany({
        where: {
          studentId: memberId,
          generertFra: GENERERT_FRA_GROUP,
          generertFraId: sid,
          startTime: { gte: weekMonday, lt: weekEnd },
        },
      });
      removed++;
    }
  }

  return {
    members: gruppe.members.length,
    schedules: weekly.length,
    upserted,
    removed,
  };
}

/** Etter CRUD på GroupSchedule — propagér inneværende + neste uke. */
export async function propagerGruppeplanEtterEndring(groupId: string): Promise<void> {
  await propagerGruppeplanTilMedlemmer(groupId, 0);
  await propagerGruppeplanTilMedlemmer(groupId, 1);
}