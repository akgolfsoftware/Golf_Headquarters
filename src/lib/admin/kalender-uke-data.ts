/**
 * Data-loader for /admin/kalender/uke — uke-visning av alle bookinger på tvers
 * av spillere. Henter ekte Prisma-data for valgt uke og mapper til
 * WeekCalendarProps (godkjent komponent src/components/admin/kalender/week-calendar.tsx).
 *
 * NB: src/lib/admin-kalender/week-data.ts er en DELT fil og røres ikke — denne
 * er en frittstående kopi i src/lib/admin/ for /admin/kalender/uke-ruten.
 *
 * Klassifisering av event-type (styrer venstre-strek-farge):
 *   - live    → økt pågår nå (now ∈ [startAt, endAt))      · cream-gull strek
 *   - group   → serviceType uten coach (felles/gruppe)      · forest strek
 *   - oneToOne → alt annet (1-til-1)                        · lime strek
 */

import { prisma } from "@/lib/prisma";
import type {
  WeekCalendarProps,
  WeekEvent,
} from "@/components/admin/kalender/week-calendar";

const DAGER_KORT = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
const MND_KORT = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

/** Mandag 00:00 for uka som inneholder `d` (ISO-uke, mandag-start). */
function mandagFor(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

/** ISO-ukenummer. */
function isoUke(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - aarStart.getTime()) / 86_400_000 + 1) / 7);
}

function minutterSidenMidnatt(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Parser ?uke=YYYY-MM-DD til en gyldig dato, ellers i dag. */
function basisdatoFra(ukeParam: string | undefined): Date {
  if (ukeParam) {
    const parsed = new Date(ukeParam);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function toParam(d: Date): string {
  const m = mandagFor(d);
  return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}-${String(m.getDate()).padStart(2, "0")}`;
}

export async function loadKalenderUke(ukeParam?: string): Promise<WeekCalendarProps> {
  const now = new Date();
  const nowMin = minutterSidenMidnatt(now);

  const ukeStart = mandagFor(basisdatoFra(ukeParam));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const forrigeUke = new Date(ukeStart);
  forrigeUke.setDate(forrigeUke.getDate() - 7);
  const nesteUke = new Date(ukeStart);
  nesteUke.setDate(nesteUke.getDate() + 7);

  const bookinger = await prisma.booking.findMany({
    where: {
      startAt: { gte: ukeStart, lt: ukeSlutt },
      status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] },
    },
    orderBy: { startAt: "asc" },
    include: {
      user: { select: { name: true } },
      serviceType: { select: { name: true, coachUserId: true } },
      location: { select: { name: true } },
      facility: { select: { name: true } },
    },
  });

  const ukerErLik = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const iDagensUke = ukerErLik(ukeStart, mandagFor(now));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ukeStart);
    d.setDate(d.getDate() + i);
    return {
      dow: DAGER_KORT[i],
      date: d.getDate(),
      month: MND_KORT[d.getMonth()],
      weekend: i >= 5,
      isToday: iDagensUke && ukerErLik(d, now),
    };
  });

  const events: WeekEvent[] = bookinger.map((b) => {
    const dayIndex = (b.startAt.getDay() + 6) % 7;
    const startMin = minutterSidenMidnatt(b.startAt);
    const sluttMin = minutterSidenMidnatt(b.endAt);
    const erLive =
      iDagensUke &&
      ((b.startAt.getDay() + 6) % 7) === ((now.getDay() + 6) % 7) &&
      startMin <= nowMin &&
      sluttMin > nowMin &&
      b.status !== "COMPLETED";
    const erGruppe = b.serviceType.coachUserId === null;
    const kind: WeekEvent["kind"] = erLive ? "live" : erGruppe ? "group" : "oneToOne";

    const navn = b.user?.name ?? b.guestName ?? "Gjest";
    const sted = b.facility?.name ?? b.location?.name ?? null;

    return {
      id: b.id,
      dayIndex,
      startMin,
      endMin: sluttMin,
      timeLabel: hhmm(b.startAt),
      title: navn,
      serviceLabel: b.serviceType.name,
      location: sted,
      kind,
      isCompleted: b.status === "COMPLETED" && !erLive,
      href: `/admin/bookinger/${b.id}`,
    };
  });

  const fmtRange = (a: Date, b: Date) => {
    const slutt = new Date(b);
    slutt.setDate(slutt.getDate() - 1);
    const sammeMnd = a.getMonth() === slutt.getMonth();
    const aStr = `${a.getDate()}.${sammeMnd ? "" : ` ${MND_KORT[a.getMonth()]}`}`;
    const bStr = `${slutt.getDate()}. ${MND_KORT[slutt.getMonth()]} ${slutt.getFullYear()}`;
    return `${aStr}–${bStr}`;
  };

  return {
    weekNumber: isoUke(ukeStart),
    rangeLabel: fmtRange(ukeStart, ukeSlutt),
    isCurrentWeek: iDagensUke,
    prevWeekParam: toParam(forrigeUke),
    nextWeekParam: toParam(nesteUke),
    todayParam: toParam(now),
    nowMinutes: nowMin,
    nowDayIndex: iDagensUke ? (now.getDay() + 6) % 7 : null,
    days,
    events,
    bookingCount: events.length,
  };
}
