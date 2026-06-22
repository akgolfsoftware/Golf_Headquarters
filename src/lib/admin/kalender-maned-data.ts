/**
 * Data-loader for /admin/kalender/maned — måned-visning av alle bookinger på
 * tvers av spillere. Henter ekte Prisma-data for valgt måned (utvidet til 6-rad
 * grid) og mapper til MonthCalendarProps (src/components/admin/kalender/month-calendar.tsx).
 *
 * NB: src/lib/admin-kalender/* røres ikke — denne lever i src/lib/admin/.
 *
 * Klassifisering av event-type (styrer venstre-strek-farge):
 *   - live    → økt pågår nå (now ∈ [startAt, endAt))  · cream-gull strek
 *   - group   → serviceType uten coach (felles/gruppe)  · forest strek
 *   - oneToOne → alt annet (1-til-1)                     · lime strek
 */

import { prisma } from "@/lib/prisma";
import type {
  MonthCalendarProps,
  MonthDay,
  MonthEvent,
} from "@/components/admin/kalender/month-calendar";

const MND_LANG = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

function isoDato(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function sammeDag(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Parser ?mnd=YYYY-MM(-DD) til en gyldig dato i den måneden, ellers i dag. */
function basisdatoFra(mndParam: string | undefined): Date {
  if (mndParam) {
    // Aksepter både YYYY-MM og YYYY-MM-DD.
    const norm = /^\d{4}-\d{2}$/.test(mndParam) ? `${mndParam}-01` : mndParam;
    const parsed = new Date(norm);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function mndParam(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function loadKalenderManed(param?: string): Promise<MonthCalendarProps> {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const basis = basisdatoFra(param);
  const aar = basis.getFullYear();
  const mnd = basis.getMonth();

  const mndStart = new Date(aar, mnd, 1);
  const mndSlutt = new Date(aar, mnd + 1, 1);

  // Grid-start: mandag i uka som inneholder den 1.
  const gridStart = new Date(mndStart);
  gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 6) % 7));
  gridStart.setHours(0, 0, 0, 0);
  // 42 celler (6 uker) — dekker alltid hele måneden.
  const gridSlutt = new Date(gridStart);
  gridSlutt.setDate(gridSlutt.getDate() + 42);

  const [bookinger, spillerCount] = await Promise.all([
    prisma.booking.findMany({
      where: {
        startAt: { gte: gridStart, lt: gridSlutt },
        status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] },
      },
      orderBy: { startAt: "asc" },
      include: {
        user: { select: { name: true } },
        serviceType: { select: { name: true, coachUserId: true } },
      },
    }),
    prisma.user.count({ where: { role: "PLAYER" } }),
  ]);

  // Fasit: vis kun antall uker måneden faktisk dekker (5 eller 6) — ingen
  // hel ekstra rad med neste-måned-dager når 5 uker holder.
  const leadingDays = (mndStart.getDay() + 6) % 7; // mandag-start-offset til den 1.
  const daysInMonth = new Date(aar, mnd + 1, 0).getDate();
  const weeksNeeded = Math.ceil((leadingDays + daysInMonth) / 7);
  const cellCount = weeksNeeded * 7;

  const days: MonthDay[] = Array.from({ length: cellCount }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    const dow = (d.getDay() + 6) % 7;
    return {
      dateKey: isoDato(d),
      date: d.getDate(),
      inMonth: d.getMonth() === mnd,
      weekend: dow >= 5,
      isToday: sammeDag(d, now),
    };
  });

  const events: MonthEvent[] = bookinger.map((b) => {
    const startMin = b.startAt.getHours() * 60 + b.startAt.getMinutes();
    const sluttMin = b.endAt.getHours() * 60 + b.endAt.getMinutes();
    const erLive =
      sammeDag(b.startAt, now) &&
      startMin <= nowMin &&
      sluttMin > nowMin &&
      b.status !== "COMPLETED";
    const erGruppe = b.serviceType.coachUserId === null;
    const kind: MonthEvent["kind"] = erLive ? "live" : erGruppe ? "group" : "oneToOne";

    return {
      id: b.id,
      dateKey: isoDato(b.startAt),
      timeLabel: hhmm(b.startAt),
      title: b.user?.name ?? b.guestName ?? "Gjest",
      kind,
      isCompleted: b.status === "COMPLETED" && !erLive,
      href: `/admin/bookinger/${b.id}`,
    };
  });

  const erInneverende =
    now.getFullYear() === aar && now.getMonth() === mnd;

  const forrige = new Date(aar, mnd - 1, 1);
  const neste = new Date(aar, mnd + 1, 1);

  // Tell kun events innenfor selve måneden (ikke utvidet grid) for tomstate.
  const iMaaneden = bookinger.filter(
    (b) => b.startAt >= mndStart && b.startAt < mndSlutt,
  ).length;

  return {
    monthLabel: `${MND_LANG[mnd]} ${aar}`,
    prevMonthParam: mndParam(forrige),
    nextMonthParam: mndParam(neste),
    todayParam: mndParam(now),
    isCurrentMonth: erInneverende,
    days,
    events,
    bookingCount: iMaaneden,
    spillerCount,
  };
}
