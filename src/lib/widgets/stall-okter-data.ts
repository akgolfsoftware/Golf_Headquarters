/**
 * Widget-pakke — dataloader for StallOkterWidget (AgencyOS cockpit).
 *
 * Dagens TRENINGSØKTER på tvers av coachens stall — begge spor
 * (TrainingSessionV2 + TrainingPlanSession), samme fletting som
 * spillerens gjennomfore-data. Utfyller «Dagens timer» på cockpiten,
 * som kun viser bookinger.
 *
 * Scope: ADMIN ser alle spillere, COACH ser egne (samme where-mønster
 * som cockpit-sidens spillerliste/loadStallen).
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
  spillerId: string;
  spillerNavn: string;
  tittel: string;
  status: V2OktUiStatus;
  varighet: number;
  pyramidArea: PyramidArea;
  /** Coach-lenke: spillerens side i stallen. */
  href: string;
  kilde: "v2" | "plan";
};

export type StallOkterData = {
  antall: number;
  fullfort: number;
  paagaar: number;
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

  const spillere = await prisma.user
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
    .catch(() => [] as { id: string; name: string | null }[]);

  if (spillere.length === 0) return { antall: 0, fullfort: 0, paagaar: 0, okter: [] };

  const spillerIds = spillere.map((s) => s.id);
  const navnMap = new Map(spillere.map((s) => [s.id, s.name ?? "Spiller"]));

  const [v2Raw, planRaw] = await Promise.all([
    prisma.trainingSessionV2
      .findMany({
        where: { studentId: { in: spillerIds }, startTime: { gte: startOfDay, lt: endOfDay } },
        orderBy: { startTime: "asc" },
        select: {
          id: true, title: true, startTime: true, endTime: true,
          status: true, practiceType: true, studentId: true,
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

  // studentId er nullable (gruppeøkter bruker groupId i stedet). Where-filteret
  // over utelukker null, men typen er fortsatt string | null — derfor hoppes
  // null eksplisitt over her. Merk: rene gruppeøkter er ikke med i denne widgeten.
  const okter: StallOkt[] = [
    ...v2Raw.flatMap((o): { at: number; okt: StallOkt }[] => {
      const spillerId = o.studentId;
      if (spillerId === null) return [];
      return [{
        at: o.startTime.getTime(),
        okt: {
          id: o.id,
          tid: tid(o.startTime),
          spillerId,
          spillerNavn: navnMap.get(spillerId) ?? "Spiller",
          tittel: o.title,
          status: o.status === "COMPLETED" ? "done" : o.status === "IN_PROGRESS" ? "now" : "upcoming",
          varighet: Math.max(0, Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000)),
          pyramidArea: PRACTICE_TO_PYRAMID[o.practiceType] ?? "TEK",
          href: `/admin/spillere/${spillerId}`,
          kilde: "v2",
        },
      }];
    }),
    ...planRaw.map((o): { at: number; okt: StallOkt } => ({
      at: o.scheduledAt.getTime(),
      okt: {
        id: o.id,
        tid: tid(o.scheduledAt),
        spillerId: o.plan.userId,
        spillerNavn: navnMap.get(o.plan.userId) ?? "Spiller",
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
    okter,
  };
}
