// Kalender-modul (/kommando/kalender). Gate i layoutet. Henter ekte hendelser
// fra DB: bookinger (status CONFIRMED/PENDING) + Kommando-oppgaver med frist.
// Bygger celler/hendelser på serveren og sender til CalendarViews (klient).

import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { CalendarViews } from "@/components/kommando/calendar-views";
import type { MaanedDag } from "@/components/athletic/golfdata";
import type { UkeBlokk } from "@/components/kommando/calendar-views";

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

  // ── Måneds-dager (alle hendelser per dag, som MaanedKalender-piller) ──
  const monthDays: MaanedDag[] = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const okter: NonNullable<MaanedDag["okter"]> = [];

    for (const b of bookings) {
      if (sammeDag(new Date(b.startAt), date)) {
        const tid = new Date(b.startAt).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
        okter.push({ id: b.id, tittel: b.serviceType.name, tid });
      }
    }
    for (const t of tasks) {
      if (t.dueAt && sammeDag(new Date(t.dueAt), date)) {
        okter.push({ id: t.id, tittel: t.title, akse: t.priority === "haster" ? "TURN" : undefined });
      }
    }

    return { date: i + 1, today: sammeDag(date, idag), okter };
  });

  // ── Uke-blokker (tidssatte bookinger i inneværende uke, som TidsGrid-blokker) ──
  const weekBlocks: UkeBlokk[] = bookings
    .filter((b) => new Date(b.startAt) >= mandag && new Date(b.startAt) < sondag)
    .map((b) => {
      const start = new Date(b.startAt);
      const end = new Date(b.endAt);
      const fra = start.getHours() + start.getMinutes() / 60;
      const navn = b.user?.name ?? b.guestName ?? "Gjest";
      return {
        id: b.id,
        dag: (start.getDay() + 6) % 7,
        fra,
        til: Math.max(fra + 0.5, end.getHours() + end.getMinutes() / 60),
        tittel: `${b.serviceType.name} — ${navn}`,
        tid: start.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
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
        monthDays={monthDays}
        weekStart={mandag}
        weekBlocks={weekBlocks}
        todayIndex={todayIndex}
      />
      <p className="mt-4 font-mono text-[11px] text-muted-foreground">
        {DAGNAVN_KORT.join(" · ")} — bookinger og oppgavefrister fra databasen.
      </p>
    </div>
  );
}
