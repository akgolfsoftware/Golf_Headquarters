/**
 * /admin/calendar — CoachHQ uke-kalender
 *
 * Designet hentet fra src/app/kalender-demo/page.tsx.
 * Henter Prisma-data:
 *   - bookings (uke-vindu) med spiller, service-type, lokasjon
 *   - CoachAvailability (innlogget coach, ev. alle for ADMIN)
 *   - faste gruppetider hardkodet (WANG M/O/F 08–10, GFGK Junior ti/to 16–20)
 *
 * GUEST: kan se, men ingen booke-knapp.
 * Roller: COACH, ADMIN, GUEST.
 */

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Plus,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  startOfWeek,
  dagerIUken,
  ukenummer,
  sammeDag,
} from "@/lib/uke-helpers";

// ---------- Konstanter ----------

const TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00",
];
const SLOT_PX = 56; // 1 time
const GRID_START_HOUR = 6;
const GRID_TOTAL_PX = TIMES.length * SLOT_PX; // 17 * 56 = 952

const DAGER_LANGE = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
];

// Faste gruppetider (regelbasert). weekday: 0=mandag.
type FastGruppe = {
  weekday: number;
  startHour: number; // float, f.eks. 8 eller 16.5
  endHour: number;
  title: string;
  sub: string;
};
const FASTE_GRUPPER: FastGruppe[] = [
  // WANG Toppidrett — mandag, onsdag, fredag 08–10
  { weekday: 0, startHour: 8, endHour: 10, title: "WANG Toppidrett", sub: "Gruppeøkt · GFGK Range" },
  { weekday: 2, startHour: 8, endHour: 10, title: "WANG Toppidrett", sub: "Gruppeøkt · GFGK Range" },
  { weekday: 4, startHour: 8, endHour: 10, title: "WANG Toppidrett", sub: "Gruppeøkt · GFGK Range" },
  // GFGK Junior — tirsdag, torsdag 16–20
  { weekday: 1, startHour: 16, endHour: 20, title: "GFGK Junior", sub: "Akademi · Range + sim" },
  { weekday: 3, startHour: 16, endHour: 20, title: "GFGK Junior", sub: "Akademi · Range + sim" },
];

// ---------- Hjelpefunksjoner ----------

function parseHHmm(value: string): number {
  // "08:00" → 8, "16:30" → 16.5
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) + (m ?? 0) / 60;
}

function hourFromDate(d: Date): number {
  return d.getHours() + d.getMinutes() / 60;
}

function topForHour(hour: number): number {
  return (hour - GRID_START_HOUR) * SLOT_PX;
}

function heightForRange(startH: number, endH: number): number {
  return Math.max(28, (endH - startH) * SLOT_PX);
}

function isoUkeKey(d: Date): string {
  // "2026-W21"
  return `${d.getFullYear()}-W${String(ukenummer(d)).padStart(2, "0")}`;
}

function ukeFromIso(value: string): Date | null {
  // "2026-W21" → mandag i ISO-uke 21 / 2026
  const m = value.match(/^(\d{4})-W(\d{1,2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  // ISO-uke 1 inneholder torsdag 4. januar
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - (jan4Day - 1) + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function ukeShift(start: Date, deltaWeeks: number): Date {
  const d = new Date(start);
  d.setDate(d.getDate() + deltaWeeks * 7);
  return d;
}

// ---------- Page ----------

type Search = { uke?: string; filter?: string };

export default async function AdminCalendar({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });
  const params = await searchParams;

  // Filter: "alle" (default) eller "mine"
  const filter = params.filter === "mine" ? "mine" : "alle";

  // Beregn uke-vindu (mandag-start)
  const now = new Date();
  const referansedag = params.uke ? (ukeFromIso(params.uke) ?? now) : now;
  const ukeStart = startOfWeek(referansedag);
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeStart.getDate() + 7);
  const ukeNr = ukenummer(ukeStart);
  const dager = dagerIUken(ukeStart);

  // Bookings i uke-vinduet
  const bookingsFilter: { startAt: { gte: Date; lt: Date }; userId?: string } = {
    startAt: { gte: ukeStart, lt: ukeSlutt },
  };
  if (filter === "mine") bookingsFilter.userId = user.id;

  const [bookings, availability] = await Promise.all([
    prisma.booking.findMany({
      where: bookingsFilter,
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        user: { select: { id: true, name: true } },
        serviceType: { select: { name: true } },
        location: { select: { name: true } },
      },
      orderBy: { startAt: "asc" },
    }),
    prisma.coachAvailability.findMany({
      where:
        user.role === "ADMIN"
          ? { active: true }
          : { coachId: user.id, active: true },
      select: {
        id: true,
        coachId: true,
        weekday: true,
        startTime: true,
        endTime: true,
      },
    }),
  ]);

  // Format helpers
  const datoFormatter = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
  });
  const periodeTekst = `${datoFormatter.format(dager[0])} – ${datoFormatter.format(dager[6])} ${ukeStart.getFullYear()}`;

  // Build events-per-day
  type Ev = {
    kind: "booking" | "group";
    top: number;
    height: number;
    timeLabel: string;
    title: string;
    sub?: string;
  };
  const eventsPerDag: Ev[][] = dager.map(() => []);

  // Bookings → events
  for (const b of bookings) {
    const dagIdx = dager.findIndex((d) => sammeDag(d, b.startAt));
    if (dagIdx === -1) continue;
    const startH = hourFromDate(b.startAt);
    const endH = hourFromDate(b.endAt);
    if (endH <= GRID_START_HOUR || startH >= GRID_START_HOUR + TIMES.length) continue;
    const clampedStart = Math.max(startH, GRID_START_HOUR);
    const clampedEnd = Math.min(endH, GRID_START_HOUR + TIMES.length);
    eventsPerDag[dagIdx].push({
      kind: "booking",
      top: topForHour(clampedStart),
      height: heightForRange(clampedStart, clampedEnd),
      timeLabel: `${b.startAt.toTimeString().slice(0, 5)} – ${b.endAt.toTimeString().slice(0, 5)}`,
      title: `${b.user.name} · ${b.serviceType.name}`,
      sub: b.location.name,
    });
  }

  // Faste gruppetider → events
  for (const g of FASTE_GRUPPER) {
    eventsPerDag[g.weekday].push({
      kind: "group",
      top: topForHour(g.startHour),
      height: heightForRange(g.startHour, g.endHour),
      timeLabel: `${String(Math.floor(g.startHour)).padStart(2, "0")}:00 – ${String(Math.floor(g.endHour)).padStart(2, "0")}:00`,
      title: g.title,
      sub: g.sub,
    });
  }

  // CoachAvailability stripes per day (lyse striper i bakgrunnen)
  type Stripe = { top: number; height: number };
  const stripesPerDag: Stripe[][] = dager.map((dag) => {
    const wd = (dag.getDay() + 6) % 7; // 0=mandag
    const matching = availability.filter((a) => a.weekday === wd);
    return matching
      .map((a) => {
        const s = Math.max(parseHHmm(a.startTime), GRID_START_HOUR);
        const e = Math.min(parseHHmm(a.endTime), GRID_START_HOUR + TIMES.length);
        if (e <= s) return null;
        return { top: topForHour(s), height: heightForRange(s, e) };
      })
      .filter((x): x is Stripe => x !== null);
  });

  // Nå-linje
  const todayIdx = dager.findIndex((d) => sammeDag(d, now));
  const nowHour = hourFromDate(now);
  const nowVisible =
    todayIdx >= 0 &&
    nowHour >= GRID_START_HOUR &&
    nowHour <= GRID_START_HOUR + TIMES.length;
  const nowTop = nowVisible ? topForHour(nowHour) : 0;
  const nowLabel = nowVisible
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    : "";

  // Naviger frem/tilbake/i dag
  const forrigeIso = isoUkeKey(ukeShift(ukeStart, -1));
  const nesteIso = isoUkeKey(ukeShift(ukeStart, 1));

  // Sum events
  const totalEvents = eventsPerDag.reduce((sum, e) => sum + e.length, 0);
  const kanBooke = user.role !== "GUEST";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`CoachHQ · Uke ${ukeNr}`}
        titleLead="Min"
        titleItalic="kalender"
        sub={`${periodeTekst} · ${totalEvents} ${totalEvents === 1 ? "økt" : "økter"} denne uka`}
        actions={
          kanBooke ? (
            <Link
              href="/admin/bookings/ny"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Ny økt
            </Link>
          ) : undefined
        }
      />

      {/* Toolbar: uke-nav + Uke/Maaned-toggle + filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        {/* Nav */}
        <div className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary p-0.5">
          <Link
            href={`/admin/calendar?uke=${forrigeIso}${filter === "mine" ? "&filter=mine" : ""}`}
            aria-label="Forrige uke"
            className="grid h-7 w-8 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/calendar${filter === "mine" ? "?filter=mine" : ""}`}
            className="rounded-sm px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-card"
          >
            I dag
          </Link>
          <Link
            href={`/admin/calendar?uke=${nesteIso}${filter === "mine" ? "&filter=mine" : ""}`}
            aria-label="Neste uke"
            className="grid h-7 w-8 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Periode-label */}
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Uke {ukeNr}
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">
            {periodeTekst}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Uke / Maaned-toggle */}
          <div className="inline-flex items-center gap-px rounded-md border border-border bg-secondary p-0.5 text-xs">
            <span className="rounded-sm bg-card px-2.5 py-1.5 font-medium text-foreground shadow-sm">
              Uke
            </span>
            <Link
              href="/admin/calendar/maned"
              className="rounded-sm px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              Måned
            </Link>
          </div>

          {/* Filter-toggle */}
          <div className="inline-flex items-center gap-px rounded-md border border-border bg-secondary p-0.5 text-xs">
            <Link
              href={`/admin/calendar${params.uke ? `?uke=${params.uke}` : ""}`}
              className={`rounded-sm px-2.5 py-1.5 transition-colors ${
                filter === "alle"
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Alle
            </Link>
            <Link
              href={`/admin/calendar?${params.uke ? `uke=${params.uke}&` : ""}filter=mine`}
              className={`rounded-sm px-2.5 py-1.5 transition-colors ${
                filter === "mine"
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mine
            </Link>
          </div>
        </div>
      </div>

      {/* Tom-tilstand hvis ingenting (verken bookinger eller faste grupper) */}
      {totalEvents === 0 ? (
        <EmptyState
          icon={CalendarRange}
          titleItalic="Tom"
          titleTrail="uke"
          sub="Ingen bookinger eller faste gruppetider for valgt uke."
          cta={
            kanBooke ? (
              <Link
                href="/admin/bookings/ny"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Opprett ny økt
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <div
            className="relative grid min-w-[860px] overflow-hidden rounded-lg border border-border bg-card"
            style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
          >
            {/* Header rad */}
            <div className="border-b border-r border-border bg-card px-3 py-2" />
            {dager.map((d, i) => {
              const erIdag = sammeDag(d, now);
              const erHelg = i >= 5;
              return (
                <div
                  key={d.toISOString()}
                  className={`flex flex-col gap-0.5 border-b border-border px-3 py-2 ${
                    erIdag
                      ? "bg-accent"
                      : erHelg
                        ? "bg-secondary"
                        : "bg-card"
                  } ${i < 6 ? "border-r" : ""}`}
                >
                  <span
                    className={`font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
                      erIdag ? "text-accent-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {DAGER_LANGE[i]}
                  </span>
                  <span
                    className={`font-display text-lg font-semibold leading-none tracking-tight ${
                      erIdag ? "text-accent-foreground" : "text-foreground"
                    }`}
                  >
                    {d.getDate()}
                    {erIdag && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {eventsPerDag[i].length}{" "}
                    {eventsPerDag[i].length === 1 ? "økt" : "økter"}
                  </span>
                </div>
              );
            })}

            {/* Tids-kolonne */}
            <div className="border-r border-border bg-card">
              {TIMES.map((t, i) => (
                <div
                  key={t}
                  className={`h-14 border-b border-border pr-2 pt-1 text-right font-mono text-[10px] ${
                    i % 2 === 1 ? "text-muted-foreground/50" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>

            {/* Dag-kolonner */}
            {dager.map((d, i) => {
              const erIdag = sammeDag(d, now);
              const erHelg = i >= 5;
              const events = eventsPerDag[i];
              const stripes = stripesPerDag[i];
              return (
                <div
                  key={d.toISOString()}
                  className={`relative ${
                    erHelg && !erIdag ? "bg-secondary/30" : ""
                  } ${i < 6 ? "border-r border-border" : ""}`}
                  style={{ minHeight: GRID_TOTAL_PX }}
                >
                  {/* Time-slot lines */}
                  {TIMES.map((_, j) => (
                    <div
                      key={j}
                      className={`h-14 ${
                        j % 2 === 1
                          ? "border-b border-dashed border-border"
                          : "border-b border-border"
                      }`}
                    />
                  ))}

                  {/* Availability-striper (under events) */}
                  {stripes.map((s, idx) => (
                    <div
                      key={`stripe-${idx}`}
                      className="absolute inset-x-1 rounded-sm bg-primary/5"
                      style={{ top: s.top, height: s.height }}
                    />
                  ))}

                  {/* Events */}
                  {events.map((ev, idx) => (
                    <div
                      key={`ev-${idx}`}
                      className={`absolute inset-x-1.5 flex flex-col gap-0.5 overflow-hidden rounded-md border px-2.5 py-1.5 shadow-sm ${
                        ev.kind === "group"
                          ? "border-primary/20 bg-primary/8"
                          : "border-accent/40 bg-accent/15"
                      }`}
                      style={{ top: ev.top, height: ev.height }}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {ev.timeLabel}
                      </span>
                      <span className="text-xs font-semibold leading-tight text-foreground">
                        {ev.title}
                      </span>
                      {ev.sub && (
                        <span className="text-[11px] leading-tight text-muted-foreground">
                          {ev.sub}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Nå-linje */}
                  {erIdag && nowVisible && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-10 h-px bg-destructive"
                      style={{ top: nowTop }}
                    >
                      <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-destructive" />
                      <span className="absolute -top-2 right-1 rounded bg-card px-1 font-mono text-[9px] font-semibold text-destructive">
                        {nowLabel}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-accent/40 bg-accent/15" />
          Booking
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-primary/20 bg-primary/10" />
          Fast gruppetid
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary/5" />
          Tilgjengelig
        </span>
        {user.role === "GUEST" && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Gjest-tilgang · kun visning
          </span>
        )}
      </div>
    </div>
  );
}
