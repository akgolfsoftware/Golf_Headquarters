/**
 * Widget-pakke — dataloader for StallOkterWidget (AgencyOS cockpit).
 *
 * Dagens TRENINGSØKTER på tvers av coachens stall — begge spor
 * (TrainingSessionV2 + TrainingPlanSession), samme fletting som
 * spillerens gjennomfore-data. Utfyller «Dagens timer» på cockpiten,
 * som kun viser bookinger.
 *
 * Både individuelle økter (studentId) og gruppeøkter (groupId) er med —
 * en gruppeøkt er ÉN rad for hele gruppa, ikke én per medlem.
 *
 * Scope: ADMIN ser alle spillere og grupper, COACH ser egne (samme
 * where-mønster som cockpit-sidens spillerliste/loadStallen).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { PlayerProgram } from "@/generated/prisma/client";
import { planSessionUiStatus, type V2OktUiStatus } from "@/lib/portal/session-hrefs";

type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

const PRACTICE_TO_PYRAMID: Record<string, PyramidArea> = {
  BLOKK: "TEK", RANDOM: "SLAG", KONKURRANSE: "TURN", SPILL_TEST: "SPILL",
};

export type StallOkt = {
  id: string;
  /** "08:00" (Oslo-tid) */
  tid: string;
  /** Spiller-id, eller gruppe-id når økten er en gruppeøkt. */
  deltakerId: string;
  /** Spillernavn, eller gruppenavn for gruppeøkter. */
  deltakerNavn: string;
  /** Gruppeøkt = én økt for flere spillere (TrainingSessionV2.groupId). */
  erGruppe: boolean;
  /** Antall medlemmer — kun for gruppeøkter. */
  antallMedlemmer: number | null;
  tittel: string;
  status: V2OktUiStatus;
  varighet: number;
  pyramidArea: PyramidArea;
  /** Coach-lenke: spillerens eller gruppens side. */
  href: string;
  kilde: "v2" | "plan";
};

export type StallOkterData = {
  antall: number;
  fullfort: number;
  paagaar: number;
  /** Hvor mange av øktene som er gruppeøkter. */
  antallGruppe: number;
  okter: StallOkt[];
};

function tid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo",
  });
}

export async function getStallOkterData(coach: {
  id: string;
  role: string;
}): Promise<StallOkterData> {
  const isAdmin = coach.role === "ADMIN";
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Coachens scope: egne spillere OG egne grupper (ADMIN ser alt).
  const [spillere, grupper] = await Promise.all([
    prisma.user
      .findMany({
        where: {
          role: "PLAYER",
          deletedAt: null,
          enrollmentsAsPlayer: {
            some: {
              endedAt: null,
              NOT: { program: "PLATFORM_ONLY" as PlayerProgram },
              ...(isAdmin ? {} : { coachId: coach.id }),
            },
          },
        },
        select: { id: true, name: true },
        take: 400,
      })
      .catch(() => [] as { id: string; name: string | null }[]),
    prisma.group
      .findMany({
        where: isAdmin ? {} : { coachId: coach.id },
        select: { id: true, name: true, _count: { select: { members: { where: { endedAt: null } } } } },
        take: 200,
      })
      .catch(() => [] as { id: string; name: string; _count: { members: number } }[]),
  ]);

  if (spillere.length === 0 && grupper.length === 0) {
    return { antall: 0, fullfort: 0, paagaar: 0, antallGruppe: 0, okter: [] };
  }

  const spillerIds = spillere.map((s) => s.id);
  const gruppeIds = grupper.map((g) => g.id);
  const navnMap = new Map(spillere.map((s) => [s.id, s.name ?? "Spiller"]));
  const gruppeMap = new Map(grupper.map((g) => [g.id, g]));

  const [v2Raw, planRaw] = await Promise.all([
    prisma.trainingSessionV2
      .findMany({
        where: {
          startTime: { gte: startOfDay, lt: endOfDay },
          OR: [
            ...(spillerIds.length > 0 ? [{ studentId: { in: spillerIds } }] : []),
            ...(gruppeIds.length > 0 ? [{ groupId: { in: gruppeIds } }] : []),
          ],
        },
        orderBy: { startTime: "asc" },
        select: {
          id: true, title: true, startTime: true, endTime: true,
          status: true, practiceType: true, studentId: true, groupId: true,
        },
        take: 60,
      })
      .catch(() => []),
    prisma.trainingPlanSession
      .findMany({
        where: {
          scheduledAt: { gte: startOfDay, lt: endOfDay },
          plan: { userId: { in: spillerIds }, isActive: true },
          status: { not: "ABANDONED" },
        },
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true, title: true, scheduledAt: true, durationMin: true,
          status: true, pyramidArea: true, plan: { select: { userId: true } },
        },
        take: 60,
      })
      .catch(() => []),
  ]);

  // En V2-økt er enten spiller-økt (studentId) eller gruppeøkt (groupId).
  // Har den ingen av delene, kan vi ikke si hvem den gjelder — da hoppes den
  // over i stedet for å vises som en økt uten eier.
  const okter: StallOkt[] = [
    ...v2Raw.flatMap((o): { at: number; okt: StallOkt }[] => {
      const felles = {
        id: o.id,
        tid: tid(o.startTime),
        tittel: o.title,
        status: (o.status === "COMPLETED" ? "done" : o.status === "IN_PROGRESS" ? "now" : "upcoming") as V2OktUiStatus,
        varighet: Math.max(0, Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000)),
        pyramidArea: PRACTICE_TO_PYRAMID[o.practiceType] ?? "TEK",
        kilde: "v2" as const,
      };

      if (o.groupId !== null) {
        const gruppe = gruppeMap.get(o.groupId);
        if (!gruppe) return [];
        return [{
          at: o.startTime.getTime(),
          okt: {
            ...felles,
            deltakerId: gruppe.id,
            deltakerNavn: gruppe.name,
            erGruppe: true,
            antallMedlemmer: gruppe._count.members,
            href: `/admin/grupper/${gruppe.id}`,
          },
        }];
      }

      const spillerId = o.studentId;
      if (spillerId === null) return [];
      return [{
        at: o.startTime.getTime(),
        okt: {
          ...felles,
          deltakerId: spillerId,
          deltakerNavn: navnMap.get(spillerId) ?? "Spiller",
          erGruppe: false,
          antallMedlemmer: null,
          href: `/admin/spillere/${spillerId}`,
        },
      }];
    }),
    ...planRaw.map((o): { at: number; okt: StallOkt } => ({
      at: o.scheduledAt.getTime(),
      okt: {
        id: o.id,
        tid: tid(o.scheduledAt),
        deltakerId: o.plan.userId,
        deltakerNavn: navnMap.get(o.plan.userId) ?? "Spiller",
        erGruppe: false,
        antallMedlemmer: null,
        tittel: o.title,
        status: planSessionUiStatus(
          o.status as "PLANNED" | "ACTIVE" | "PAUSED" | "COMPLETED",
        ),
        varighet: o.durationMin,
        pyramidArea: o.pyramidArea as PyramidArea,
        href: `/admin/spillere/${o.plan.userId}`,
        kilde: "plan",
      },
    })),
  ]
    .sort((a, b) => a.at - b.at)
    .map((x) => x.okt);

  return {
    antall: okter.length,
    fullfort: okter.filter((o) => o.status === "done").length,
    paagaar: okter.filter((o) => o.status === "now").length,
    antallGruppe: okter.filter((o) => o.erGruppe).length,
    okter,
  };
}
