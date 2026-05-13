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
  Download,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CoachFilter } from "@/components/admin/coach-filter";
import { EmptyState } from "@/components/shared/empty-state";
import {
  startOfWeek,
  dagerIUken,
  ukenummer,
  sammeDag,
} from "@/lib/uke-helpers";
import {
  CalendarWeekGrid,
  type DagPayload,
  type Ev,
  type Stripe,
} from "@/components/admin/calendar-week-grid";

// ---------- Konstanter ----------

const TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00",
];
const SLOT_PX = 56; // 1 time
const GRID_START_HOUR = 6;

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

type Search = { uke?: string; filter?: string; coach?: string };

export default async function AdminCalendar({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });
  const params = await searchParams;

  // Filter: "alle" (default) eller "mine"
  const filter = params.filter === "mine" ? "mine" : "alle";

  // Coach-filter for ADMIN. COACH ser alltid kun egen kalender.
  const coachParam = params.coach;
  const valgtCoachId =
    user.role === "COACH"
      ? user.id
      : coachParam && coachParam !== "alle"
        ? coachParam
        : null;

  // Beregn uke-vindu (mandag-start)
  const now = new Date();
  const referansedag = params.uke ? (ukeFromIso(params.uke) ?? now) : now;
  const ukeStart = startOfWeek(referansedag);
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeStart.getDate() + 7);
  const ukeNr = ukenummer(ukeStart);
  const dager = dagerIUken(ukeStart);

  // Bookings i uke-vinduet, evt. filtrert på coach via serviceType-relasjon
  const bookingsFilter: {
    startAt: { gte: Date; lt: Date };
    userId?: string;
    serviceType?: { coachUserId: string };
  } = {
    startAt: { gte: ukeStart, lt: ukeSlutt },
  };
  if (filter === "mine") bookingsFilter.userId = user.id;
  if (valgtCoachId) bookingsFilter.serviceType = { coachUserId: valgtCoachId };

  const kanBooke = user.role !== "GUEST";

  const [bookings, availability, spillere, serviceTypes, locations, coachListe, facilities] =
    await Promise.all([
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
        where: valgtCoachId
          ? { coachId: valgtCoachId, active: true }
          : { active: true },
        select: {
          id: true,
          coachId: true,
          weekday: true,
          startTime: true,
          endTime: true,
        },
      }),
      kanBooke
        ? prisma.user.findMany({
            where: { role: "PLAYER" },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" },
          })
        : Promise.resolve(
            [] as { id: string; name: string; email: string }[],
          ),
      kanBooke
        ? prisma.serviceType.findMany({
            where: { active: true },
            select: { id: true, name: true, durationMin: true },
            orderBy: { durationMin: "asc" },
          })
        : Promise.resolve(
            [] as { id: string; name: string; durationMin: number }[],
          ),
      kanBooke
        ? prisma.location.findMany({
            where: { active: true },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          })
        : Promise.resolve([] as { id: string; name: string }[]),
      user.role === "ADMIN"
        ? prisma.user.findMany({
            where: { serviceTypes: { some: { active: true } } },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          })
        : Promise.resolve([] as { id: string; name: string }[]),
      kanBooke
        ? prisma.facility.findMany({
            where: { active: true },
            select: { id: true, name: true, locationId: true },
            orderBy: { name: "asc" },
          })
        : Promise.resolve(
            [] as { id: string; name: string; locationId: string }[],
          ),
    ]);

  // Format helpers
  const datoFormatter = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
  });
  const periodeTekst = `${datoFormatter.format(dager[0])} – ${datoFormatter.format(dager[6])} ${ukeStart.getFullYear()}`;

  // Build events-per-day
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
      startHour: clampedStart,
      endHour: clampedEnd,
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
      startHour: g.startHour,
      endHour: g.endHour,
    });
  }

  // CoachAvailability stripes per day (lyse striper i bakgrunnen)
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

  // Nå-time (sendes til klient for rendering av nå-linje)
  const nowHour = hourFromDate(now);

  // Naviger frem/tilbake/i dag
  const forrigeIso = isoUkeKey(ukeShift(ukeStart, -1));
  const nesteIso = isoUkeKey(ukeShift(ukeStart, 1));

  // Sum events
  const totalEvents = eventsPerDag.reduce((sum, e) => sum + e.length, 0);
  const idagIdx = dager.findIndex((d) => sammeDag(d, now));
  const idagAntall = idagIdx >= 0 ? eventsPerDag[idagIdx].length : 0;
  const idagDato = idagIdx >= 0 ? dager[idagIdx] : null;
  const idagFormat = idagDato
    ? new Intl.DateTimeFormat("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }).format(idagDato)
    : "Ikke i denne uka";

  // Booking-typer per dag (for KPI-stripen)
  let coachingTeller = 0;
  let bookingTeller = 0;
  let gruppeTeller = 0;
  if (idagIdx >= 0) {
    for (const ev of eventsPerDag[idagIdx]) {
      if (ev.kind === "booking") {
        bookingTeller += 1;
        coachingTeller += 1;
      } else if (ev.kind === "group") {
        gruppeTeller += 1;
      }
    }
  }

  // Bygg payload til klient-grid. Bruk Y-M-D-key for tidsone-trygg sammenlikning.
  function dateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  const dagPayloads: DagPayload[] = dager.map((d, i) => ({
    dateKey: dateKey(d),
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    dayOfMonth: d.getDate(),
    events: eventsPerDag[i],
    stripes: stripesPerDag[i],
  }));
  const todayDateKey = dateKey(now);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`CoachHQ · Uke ${ukeNr}`}
        titleLead="Min"
        titleItalic="kalender"
        sub={`${periodeTekst} · ${totalEvents} ${totalEvents === 1 ? "økt" : "økter"} denne uka`}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              title="Kommer i v2"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground opacity-50"
            >
              <Download className="h-4 w-4" /> Eksporter
            </button>
            {kanBooke && (
              <Link
                href="/admin/bookings/ny"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Ny økt
              </Link>
            )}
          </div>
        }
      />

      {/* KPI-stripe */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-primary p-4 text-primary-foreground lg:col-span-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] opacity-70">
            I dag · {idagFormat}
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="font-mono text-[28px] font-medium tabular-nums leading-none">
              {idagAntall}{" "}
              <small className="text-[14px] opacity-70">
                {idagAntall === 1 ? "økt" : "økter"}
              </small>
            </div>
          </div>
          <div className="mt-2.5 flex gap-2.5 text-[12px] opacity-80">
            <span>
              <b className="font-mono font-medium text-accent">{coachingTeller}</b>{" "}
              coaching
            </span>
            <span>
              <b className="font-mono font-medium text-accent">{bookingTeller}</b>{" "}
              {bookingTeller === 1 ? "booking" : "bookinger"}
            </span>
            <span>
              <b className="font-mono font-medium text-accent">{gruppeTeller}</b>{" "}
              {gruppeTeller === 1 ? "gruppe" : "grupper"}
            </span>
          </div>
        </div>
        <Kpi label="Events denne uka" value={String(totalEvents)} />
        <Kpi
          label="Uke-nummer"
          value={String(ukeNr)}
          meta={`${ukeNr}/52`}
        />
        <Kpi
          label="Konflikter"
          value="0"
          meta="Ingen overlapp"
        />
      </section>

      {/* Coach-velger for ADMIN */}
      {user.role === "ADMIN" && coachListe.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-3">
          <CoachFilter
            coaches={coachListe.map((c) => ({ id: c.id, navn: c.name }))}
          />
        </div>
      )}

      {/* Chip-row */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip active>
          Alle typer <Count>{totalEvents}</Count>
        </Chip>
        <Chip>
          Coaching <Count>{bookings.length}</Count>
        </Chip>
        <Chip>
          Gruppe <Count>{FASTE_GRUPPER.length}</Count>
        </Chip>
        <Chip>Tilgjengelig</Chip>
        <span className="mx-1 h-5 w-px bg-border" />
        <Chip>
          <SlidersHorizontal className="h-3 w-3" /> Filtre
        </Chip>
      </div>

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
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_304px]">
          <CalendarWeekGrid
            dager={dagPayloads}
            todayDateKey={todayDateKey}
            nowHour={nowHour}
            spillere={spillere}
            serviceTypes={serviceTypes}
            locations={locations}
            facilities={facilities}
            kanBooke={kanBooke}
          />
          <aside className="sticky top-6 hidden flex-col gap-4 lg:flex">
            <CalendarTogglesCard
              coachingAntall={bookings.length}
              gruppeAntall={FASTE_GRUPPER.length}
            />
            <SyncCard />
            <PyramideLegendCard />
          </aside>
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

/* ---------------- Helpers ---------------- */

function Kpi({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-mono text-[28px] font-medium tabular-nums leading-none text-foreground">
        {value}
      </div>
      {meta && (
        <div className="mt-2.5 text-[12px] text-muted-foreground">{meta}</div>
      )}
    </div>
  );
}

function Chip({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </span>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-0.5 font-mono text-[11px] opacity-60">{children}</span>
  );
}

function CalendarTogglesCard({
  coachingAntall,
  gruppeAntall,
}: {
  coachingAntall: number;
  gruppeAntall: number;
}) {
  const rows: { swatch: string; label: string; count: number }[] = [
    {
      swatch: "border border-accent/40 bg-accent/15",
      label: "Coaching · 1:1",
      count: coachingAntall,
    },
    {
      swatch: "border border-primary/20 bg-primary/10",
      label: "Gruppe-økter",
      count: gruppeAntall,
    },
    {
      swatch: "bg-primary/5",
      label: "Tilgjengelig",
      count: 0,
    },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Vis kalendere
      </div>
      <div>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center gap-2.5 py-2 text-[13px] text-foreground ${
              i > 0 ? "border-t border-border" : ""
            }`}
          >
            <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-sm ${r.swatch}`} />
            <span>{r.label}</span>
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">
              {r.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SyncCard() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
        Sist synket · —
      </div>
      <div className="mt-1.5 mb-0.5 font-display text-[15px] font-semibold">
        Google Calendar
      </div>
      <div className="mb-3 text-[12px] text-muted-foreground">
        {/* TODO: koble mot google-calendar-sync */}
        Sync-status kommer i v2.
      </div>
      <button
        type="button"
        disabled
        title="Kommer i v2"
        className="inline-flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground opacity-50"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Synk nå
      </button>
    </div>
  );
}

function PyramideLegendCard() {
  const items: { label: string; tone: string }[] = [
    { label: "FYS", tone: "bg-primary" },
    { label: "TEK", tone: "bg-primary/70" },
    { label: "SLAG", tone: "bg-accent" },
    { label: "SPILL", tone: "bg-foreground/60" },
    { label: "TURN", tone: "bg-muted-foreground" },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Pyramide-stripe
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center gap-2 text-[12px] text-muted-foreground"
          >
            <span className={`inline-block h-4 w-2 rounded-sm ${it.tone}`} />
            {it.label}
          </div>
        ))}
      </div>
      <div className="mt-2.5 text-[11px] leading-[1.4] text-muted-foreground">
        Stripe-segmenter viser fokus-fordeling per økt.
      </div>
    </div>
  );
}
