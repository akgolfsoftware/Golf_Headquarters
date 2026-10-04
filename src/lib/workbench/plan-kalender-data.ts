import "server-only";
import { planTilgang } from "./plan-tilgang";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/domain/workbench/operations";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import type { LockedBlock } from "@/lib/domain/workbench/types";
import { weekLockedBlocks } from "./locked-blocks";
import { tilDatoKolonne } from "./wb-map";

/** Kall først ETTER eksisterende spillervakt. Bare spillerens planer og aktive grupper. */
export async function lastPlanKalenderBlokker(playerId: string, weekStart: string, ownPlayer: boolean): Promise<LockedBlock[][]> {
  const viewer = await planTilgang(playerId);
  if (!viewer) return Array.from({ length: 7 }, () => []);
  ownPlayer = viewer.id === playerId;
  const end = addDays(weekStart, 7), fromDate = tilDatoKolonne(weekStart), toDate = tilDatoKolonne(end);
  const groups = await prisma.groupSchedule.findMany({ where: { startAt: { lt: toDate },
    OR: [{ endAt: { gte: fromDate } }, { recurring: "WEEKLY" }],
    group: { arkivertAt: null, members: { some: { ...aktivtSpillerMedlemskapWhere(), userId: playerId } } } },
    select: { id: true, title: true, startAt: true, endAt: true, recurring: true, kind: true } });
  // Personlige opptattblokker brukes både i ukevisningen og ved flytting/kopi.
  // Bare eierens rader hentes; weekLockedBlocks maskerer private titler for trenere.
  const personal = await prisma.playerBusyBlock.findMany({
    where: { userId: playerId, startAt: { lt: tilDatoKolonne(end) }, OR: [{ endAt: { gt: tilDatoKolonne(weekStart) } }, { recurring: "WEEKLY" }] },
    select: { id: true, title: true, startAt: true, endAt: true, recurring: true, kind: true, isPrivate: true },
  });
  const days = weekLockedBlocks(weekStart, [
    ...groups.map(g => ({ ...g, id: `group-${g.id}`, kind: g.kind ?? "SAMLING", isPrivate: false })),
    ...personal,
  ], [], ownPlayer);
  let tournaments: Awaited<ReturnType<typeof prisma.workbenchTournamentPlan.findMany>>;
  try {
    tournaments = await prisma.workbenchTournamentPlan.findMany({ where: { playerId, status: { notIn: ["WITHDRAWN", "ARCHIVED"] },
      ...(ownPlayer ? { AND: [{ OR: [{ createdBy: playerId }, { status: { in: ["PUBLISHED", "CHANGED_AFTER_PUBLISH"] } }] }] } : {}),
      OR: [{ startDate: { lt: toDate }, endDate: { gte: fromDate } }, { travelStartDate: { lt: toDate }, travelEndDate: { gte: fromDate } }] } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2021") return days;
    throw error;
  }
  for (const t of tournaments) for (let i = 0; i < 7; i++) {
    const day = tilDatoKolonne(addDays(weekStart, i));
    if (t.startDate <= day && t.endDate >= day) days[i].push({ id: `tournament-${t.id}-${i}`, title: `${t.title}${t.status === "DRAFT" ? " · Utkast" : ""}`, startMinute: 0, durationMinutes: 1440, kind: "TURNERING", dimmed: true });
    if (t.travelStartDate && t.travelEndDate && t.travelStartDate <= day && t.travelEndDate >= day)
      days[i].push({ id: `travel-${t.id}-${i}`, title: `${t.title} · Reise`, startMinute: 0, durationMinutes: 1440, kind: "REISE", dimmed: true });
  }
  return days.map(day => day.sort((a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id)));
}
