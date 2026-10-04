import "server-only";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { addDays } from "@/lib/domain/workbench/operations";
import { loadWeek, type WbResultat } from "./wb-actions";
import { osloDatoOgMinutt, type MinKalenderData, type MinKalenderItem } from "./min-calendar";
import { workbenchUrl } from "./visning-url";
import { gyldigPlanDato } from "./plan-kontekst";
import { samletOsloMidnatt } from "./workbench-samlet-volum";
import { ownGroupPublicationWhere } from "./group-scope";

/** Egen kalender bruker spillerens synlighetsvakter; aldri coachens kalender. */
export async function loadPlayerMinCalendar(weekStart: string): Promise<WbResultat<MinKalenderData>> {
  const viewer = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (viewer.role === "PARENT" || viewer.role === "GUEST") return { ok: false, error: "Ingen tilgang til denne kalenderen." };
  if (!gyldigPlanDato(weekStart)) return { ok: false, error: "Ugyldig ukestart." };
  const week = await loadWeek({ playerId: viewer.id, weekStart, mode: { kind: "PLAYER", subjectId: viewer.id, sources: [] } });
  if (!week.ok) return week;
  const from = week.data.weekStart;
  const [bookings, templates] = await Promise.all([
    prisma.booking.findMany({ where: { userId: viewer.id, startAt: { gte: samletOsloMidnatt(from), lt: samletOsloMidnatt(addDays(from, 7)) },
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] } }, select: { id: true, startAt: true, endAt: true, serviceType: { select: { name: true } } }, orderBy: { startAt: "asc" } }),
    prisma.workbenchSession.findMany({ where: { playerId: viewer.id, isTemplate: true, hiddenByPlayer: false, AND: [ownGroupPublicationWhere()] },
      select: { id: true, title: true, durationMinutes: true }, orderBy: { updatedAt: "desc" }, take: 8 }),
  ]);
  const items: MinKalenderItem[] = week.data.days.flatMap(day => day.sessions.filter(s => !s.isTemplate && s.status !== "CANCELLED").map(session => ({
    id: `workbench:${session.id}`, kind: "WORKBENCH" as const, date: session.date, startMinute: session.startMinute,
    durationMinutes: session.durationMinutes, title: session.title, pyramid: session.pyramid, session,
    href: workbenchUrl(viewer.id, "okt", { uke: from, okt: session.id }, "player"),
  })));
  for (const booking of bookings) {
    const start = osloDatoOgMinutt(booking.startAt);
    items.push({ id: `booking:${booking.id}`, kind: "BOOKING", date: start.date, startMinute: start.minute,
      durationMinutes: Math.max(0, Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60_000)),
      title: booking.serviceType.name, href: `/portal/booking/${encodeURIComponent(booking.id)}` });
  }
  const now = osloDatoOgMinutt(new Date());
  return { ok: true, data: { weekStart: from, days: week.data.days.map(day => ({ date: day.date,
    items: items.filter(item => item.date === day.date).sort((a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id)) })),
    templates: templates.map(t => ({ id: t.id, title: t.title, subtitle: `${t.durationMinutes} min` })),
    bookings: bookings.map(b => ({ id: b.id, title: b.serviceType.name, subtitle: osloDatoOgMinutt(b.startAt).date })),
    todayIso: now.date, nowMinute: now.minute } };
}
