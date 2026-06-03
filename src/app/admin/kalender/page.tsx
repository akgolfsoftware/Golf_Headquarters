/**
 * AgencyOS Kalender — uke-visning, lese-modus (/admin/kalender) — v10-design.
 *
 * Rendrer <Kalender> (v10-fasit fra ag-kalender) med EKTE booking-data fra
 * loadWeekCalendar (Prisma). Coach ser hele uka i ett blikk: 1-til-1 (lime),
 * gruppe (forest) og live-økt (cream-gull). Klikk på event åpner booking-detalj.
 *
 * Server Component. Auth via canAccessMissionControl (ADMIN). Navigasjon mellom
 * uker via ?uke=YYYY-MM-DD (mandag).
 *
 * 3. juni: byttet fra WeekCalendar (eldre port) til Kalender (v10). mapCalendar
 * oversetter WeekCalendarProps → CalendarData. Tom-tilstand (tom events-liste)
 * bevares — v10-griden rendrer tomme kolonner uten liksom-data.
 */

import { redirect } from "next/navigation";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import {
  Kalender,
  type CalendarData,
  type WeekEvent,
} from "@/components/admin/kalender/kalender";
import { loadWeekCalendar } from "@/lib/admin-kalender/week-data";
import type { WeekCalendarProps } from "@/components/admin/kalender/week-calendar";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ uke?: string }>;

/** Oversetter ekte WeekCalendarProps → v10 CalendarData. Tom-tilstand bevares. */
function mapCalendar(props: WeekCalendarProps): CalendarData {
  const events: WeekEvent[] = props.events.map((e) => ({
    id: e.id,
    dayIndex: e.dayIndex,
    start: e.timeLabel,
    durationMin: Math.max(e.endMin - e.startMin, 0),
    kind: e.kind,
    player: e.title,
    typeLabel: e.serviceLabel,
    location: e.location ?? undefined,
    href: e.href,
  }));

  return {
    weekLabel: `Uke ${props.weekNumber}`,
    rangeLabel: props.rangeLabel,
    days: props.days.map((d) => ({
      dow: d.dow,
      date: String(d.date),
      // monthSub vises kun på i-dag-kolonnen (følger v10-fasiten).
      monthSub: d.isToday ? d.month : undefined,
      weekend: d.weekend,
      today: d.isToday,
    })),
    events,
    // Now-line kun når valgt uke er inneværende uke (nowDayIndex != null).
    nowMinutes: props.nowDayIndex !== null ? props.nowMinutes : undefined,
    prevHref: `/admin/kalender?uke=${props.prevWeekParam}`,
    nextHref: `/admin/kalender?uke=${props.nextWeekParam}`,
    todayHref: `/admin/kalender?uke=${props.todayParam}`,
    monthHref: "/admin/kalender/maned",
    listHref: "/admin/bookinger",
    newBookingHref: "/admin/bookinger/ny",
  };
}

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await canAccessMissionControl();
  if (!user) redirect("/admin");

  const { uke } = await searchParams;
  const props = await loadWeekCalendar(uke);

  return (
    <div className="px-4 py-5 sm:px-8 sm:py-6">
      <Kalender data={mapCalendar(props)} />
    </div>
  );
}
