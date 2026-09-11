import "server-only";
import { prisma } from "@/lib/prisma";
import { GENERERT_FRA } from "@/lib/workbench/v2-drill-mirror";
import { planWeekSession } from "./plan-week";

/** Kalles etter spillerens tilgangskontroll i getWeekOverview. Kun lesing:
 * gamle, godtatte planøkter vises uten å opprette eller synkronisere økter. */
export async function loadLegacyPlanWeekSessions(playerId: string, start: Date, end: Date) {
  const rows = await prisma.trainingPlanSession.findMany({
    where: {
      plan: { userId: playerId, isActive: true, status: { in: ["ACCEPTED", "ACTIVE", "PAUSED"] } },
      scheduledAt: { gte: start, lt: end },
      status: { not: "ABANDONED" },
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true, title: true, scheduledAt: true, durationMin: true, status: true,
      pyramidArea: true, location: true, miljo: true, maalsetning: true,
      drills: { orderBy: { orderIndex: "asc" }, select: {
        id: true, repMinutter: true, exercise: { select: { name: true, durationMin: true } },
      } },
    },
  });
  if (rows.length === 0) return [];
  // Et flyttet eller avlyst V2-speil skal aldri gjenopplive originalen i
  // den gamle uken. Derfor ingen dato-/statusfilter på dette oppslaget.
  const mirrors = await prisma.trainingSessionV2.findMany({
    where: { studentId: playerId, generertFra: GENERERT_FRA, generertFraId: { in: rows.map((s) => s.id) } },
    select: { generertFraId: true },
  });
  const mirrored = new Set(mirrors.map((s) => s.generertFraId));
  return rows.filter((s) => !mirrored.has(s.id)).flatMap((s) => {
    const session = planWeekSession(s);
    return session ? [session] : [];
  });
}
