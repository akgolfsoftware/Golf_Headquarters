import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { visibleV2Where } from "./visible-v2";
import { loadLegacyPlanWeekSessions } from "./legacy-plan-week-data";
import { workbenchWeekSession } from "./workbench-week";
import { GENERERT_FRA } from "@/lib/workbench/v2-drill-mirror";
import { OSLO_YMD_FMT, osloInstant } from "@/lib/jarvis/dagen";
import { tilDatoKolonne, SPILLER_SYNLIGE_STATUSER } from "@/lib/workbench/wb-map";
import { translateMiljo } from "./translate-taxonomy";
import { v2DbSessionHref } from "./session-hrefs";
import type { TodaySession } from "@/app/portal/actions";
import type { PracticeType, PyramidArea } from "@/generated/prisma/client";

const AXIS: Record<PracticeType, PyramidArea> = {
  BLOKK: "TEK", RANDOM: "SLAG", KONKURRANSE: "TURN", SPILL_TEST: "SPILL",
};

/** Internal reader AFTER the caller's ownership guard. Half-open Oslo interval.
 * Cache is request-scoped, keyed by primitives; no cross-user data cache.
 * Mirrors, publication and visibility match I dag/Plan for all three models.
 */
export const loadVisibleSessionRange = cache(async (playerId: string, startISO: string, endISO: string): Promise<TodaySession[]> => {
  const start = new Date(startISO), end = new Date(endISO);
  const endDate = tilDatoKolonne(OSLO_YMD_FMT.format(end));
  const endIsOsloMidnight = end.getTime() === osloInstant(
    endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, endDate.getUTCDate(), 0, 0,
  ).getTime();
  const visibility = await visibleV2Where(playerId);
  const [v2, wb, legacy] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: { ...visibility, startTime: { gte: start, lt: end } },
      orderBy: { startTime: "asc" },
      select: {
        id: true, generertFra: true, generertFraId: true, title: true, startTime: true, endTime: true,
        status: true, avbruddAarsak: true, practiceType: true, miljo: true, maalsetning: true,
        drills: { select: { id: true, name: true, durationMinutes: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.workbenchSession.findMany({
      where: {
        playerId,
        // Workbench stores a calendar date without time. Read both boundary
        // dates, then apply the exact instant interval after mapping.
        date: endIsOsloMidnight
          ? { gte: tilDatoKolonne(OSLO_YMD_FMT.format(start)), lt: endDate }
          : { gte: tilDatoKolonne(OSLO_YMD_FMT.format(start)), lte: endDate },
        status: { in: [...SPILLER_SYNLIGE_STATUSER] }, hiddenByPlayer: false, needsPlayerApproval: false,
        OR: [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }],
      },
      include: { drills: { orderBy: { sortOrder: "asc" } } },
    }),
    loadLegacyPlanWeekSessions(playerId, start, end),
  ]);
  return [
    ...v2.map((s): TodaySession => ({
      id: s.id, model: "v2", planSessionId: s.generertFra === GENERERT_FRA ? s.generertFraId : null,
      title: s.title, startTime: s.startTime, endTime: s.endTime, status: s.status, avbruddAarsak: s.avbruddAarsak,
      practiceType: s.practiceType, pyramidArea: AXIS[s.practiceType],
      durationMin: Math.max(0, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000)),
      sted: s.miljo ? translateMiljo(s.miljo) : null, maalsetning: s.maalsetning, drills: s.drills,
      href: v2DbSessionHref(s.id, s.status),
    })),
    ...wb.map(workbenchWeekSession), ...legacy,
  ].filter(session => session.startTime >= start && session.startTime < end)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
});
