// Kalender-modul (/kommando/kalender). Gate i layoutet. Henter ekte hendelser
// fra DB: bookinger (status CONFIRMED/PENDING) + Kommando-oppgaver med frist.
// Bygger celler/hendelser på serveren og sender til CalendarViews (klient).

import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { CalendarViews } from "@/components/kommando/calendar-views";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import type { MonthDayCell, WeekEvent } from "@/components/athletic/calendars";

export const dynamic = "force-dynamic";

const DAGNAVN_KORT = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];

function sammeDag(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default async function KommandoKalenderPage() {
  const user = await canAccessMissionControl();
  if (!user) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-basert
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Inneværende uke (mandag–søndag)
  const idag = new Date(now);
  idag.setHours(0, 0, 0, 0);
  const mandag = new Date(idag);
  mandag.setDate(idag.getDate() - ((idag.getDay() + 6) % 7));
  const sondag = new Date(mandag);
  sondag.setDate(mandag.getDate() + 7);

  const [bookings, tasks] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: monthStart, lt: monthEnd }, status: { in: ["CONFIRMED", "PENDING"] } },
      orderBy: { startAt: "asc" },
      include: { user: { select: { name: true } }, serviceType: { select: { name: true } } },
    }),
    prisma.kommandoTask.findMany({
      where: { userId: user.id, dueAt: { gte: monthStart, lt: monthEnd } },
      orderBy: { dueAt: "asc" },
    }),
  ]);

  // ── Måneds-celler (alle hendelser per dag) ──
  const monthCells: MonthDayCell[] = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const events: NonNullable<MonthDayCell["events"]> = [];

    for (const b of bookings) {
      if (sammeDag(new Date(b.startAt), date)) {
        const tid = new Date(b.startAt).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
        events.push({ key: b.id, label: `${tid} ${b.serviceType.name}`, tone: "primary" });
      }
    }
    for (const t of tasks) {
      if (t.dueAt && sammeDag(new Date(t.dueAt), date)) {
        events.push({ key: t.id, label: t.title, tone: t.priority === "haster" ? "destructive" : "accent" });
      }
    }

    return {
      date,
      highlight: sammeDag(date, idag) ? "today" : undefined,
      events,
    };
  });

  // ── Uke-hendelser (tidssatte bookinger i inneværende uke) ──
  const weekEvents: WeekEvent[] = bookings
    .filter((b) => new Date(b.startAt) >= mandag && new Date(b.startAt) < sondag)
    .map((b) => {
      const start = new Date(b.startAt);
      const end = new Date(b.endAt);
      const dayIndex = (start.getDay() + 6) % 7;
      const startHour = start.getHours() + start.getMinutes() / 60;
      const endHour = Math.max(startHour + 0.25, end.getHours() + end.getMinutes() / 60);
      const navn = b.user?.name ?? b.guestName ?? "Gjest";
      return {
        key: b.id,
        dayIndex,
        startHour,
        endHour,
        title: `${b.serviceType.name} — ${navn}`,
        tone: "primary" as const,
      };
    });

  const todayIndex = idag >= mandag && idag < sondag ? (idag.getDay() + 6) % 7 : undefined;
  const monthName = monthStart.toLocaleDateString("nb-NO", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-4 font-display text-2xl font-bold tracking-[-0.02em] text-foreground capitalize">
        {monthName}
      </h1>
      <CalendarViews
        year={year}
        month={month + 1}
        monthName={monthName}
        monthCells={monthCells}
        weekStart={mandag}
        weekEvents={weekEvents}
        todayIndex={todayIndex}
      />
      <p className="mt-4 font-mono text-[11px] text-muted-foreground">
        {DAGNAVN_KORT.join(" · ")} — bookinger og oppgavefrister fra databasen.
      </p>
    </div>
  );
}
