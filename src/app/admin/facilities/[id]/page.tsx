/**
 * /admin/facilities/[id] — Fasilitet-detalj med kalender
 *
 * Viser uke- eller måned-view for én fasilitet, 08:00-21:00.
 * Aktiviteter:
 *  - Faste gruppetider (WANG, GFGK Junior) hvor relevant
 *  - Bookinger på samme lokasjon (fasilitet-spesifikk filter via notes/serviceType)
 *  - Coachenes tilgjengelighet (CoachAvailability)
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarRange, Users, MapPin } from "lucide-react";
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

// Tidsbar: 08:00 - 21:00 (14 timer)
const START_HOUR = 8;
const END_HOUR = 21;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) =>
  String(START_HOUR + i).padStart(2, "0") + ":00",
);
const SLOT_PX = 56;

const DAGER = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MND_NAVN = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

// Faste gruppetider — hvis fasilitet matcher Range/Indoor → WANG på Range
type FastGruppe = {
  weekday: number; // 0=mandag
  startHour: number;
  endHour: number;
  title: string;
  sub: string;
  navnMatch: RegExp;
};

const FASTE_GRUPPER: FastGruppe[] = [
  {
    weekday: 0,
    startHour: 8,
    endHour: 10,
    title: "WANG Toppidrett",
    sub: "Gruppeøkt · 6 spillere",
    navnMatch: /range|sim/i,
  },
  {
    weekday: 2,
    startHour: 8,
    endHour: 10,
    title: "WANG Toppidrett",
    sub: "Gruppeøkt · 6 spillere",
    navnMatch: /range|sim/i,
  },
  {
    weekday: 4,
    startHour: 8,
    endHour: 10,
    title: "WANG Toppidrett",
    sub: "Gruppeøkt · 6 spillere",
    navnMatch: /range|sim/i,
  },
  {
    weekday: 1,
    startHour: 16,
    endHour: 18,
    title: "GFGK Junior Elite",
    sub: "U19 · Anders K",
    navnMatch: /range|nærspill|putt/i,
  },
  {
    weekday: 3,
    startHour: 16,
    endHour: 18,
    title: "GFGK Junior Elite",
    sub: "U19 · Anders K",
    navnMatch: /range|nærspill|putt/i,
  },
  {
    weekday: 1,
    startHour: 18,
    endHour: 19,
    title: "GFGK Junior Mini",
    sub: "U10 · Markus",
    navnMatch: /range|nærspill|putt/i,
  },
  {
    weekday: 1,
    startHour: 19,
    endHour: 20,
    title: "GFGK Junior Utvikling",
    sub: "U15 · Markus",
    navnMatch: /range|nærspill|putt/i,
  },
  {
    weekday: 3,
    startHour: 18,
    endHour: 19,
    title: "GFGK Junior Mini",
    sub: "U10 · Markus",
    navnMatch: /range|nærspill|putt/i,
  },
  {
    weekday: 3,
    startHour: 19,
    endHour: 20,
    title: "GFGK Junior Utvikling",
    sub: "U15 · Markus",
    navnMatch: /range|nærspill|putt/i,
  },
];

type Search = { view?: string; uke?: string; mnd?: string };

export default async function FacilityCalendar({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });
  const { id } = await params;
  const { view, uke, mnd } = await searchParams;

  const visning = view === "maned" ? "maned" : "uke";

  const facility = await prisma.facility.findUnique({
    where: { id },
    include: { location: true },
  });
  if (!facility) notFound();

  // Tidsvindu — uke eller måned
  const idag = new Date();
  const referansedag = uke
    ? ukeFromIso(uke) ?? idag
    : mnd
      ? mndFromKey(mnd) ?? idag
      : idag;

  if (visning === "uke") {
    return (
      <UkeView
        facility={facility}
        referansedag={referansedag}
      />
    );
  }
  return <MndView facility={facility} referansedag={referansedag} />;
}

// ----------------- UKE-VIEW -----------------

async function UkeView({
  facility,
  referansedag,
}: {
  facility: {
    id: string;
    name: string;
    capacity: number;
    location: { id: string; name: string };
  };
  referansedag: Date;
}) {
  const ukeStart = startOfWeek(referansedag);
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeStart.getDate() + 7);
  const ukeNr = ukenummer(ukeStart);
  const dager = dagerIUken(ukeStart);

  // Bookinger på samme lokasjon i uka
  const bookings = await prisma.booking.findMany({
    where: {
      locationId: facility.location.id,
      startAt: { gte: ukeStart, lt: ukeSlutt },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    include: {
      user: { select: { name: true } },
      serviceType: { select: { name: true, coach: { select: { name: true } } } },
    },
    orderBy: { startAt: "asc" },
  });

  // Filtrer faste grupper basert på fasilitetnavn
  const aktiveGrupper = FASTE_GRUPPER.filter((g) => g.navnMatch.test(facility.name));

  const dagFormatter = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
  });

  const idag = new Date();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/facilities"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.75} />
        Fasiliteter
      </Link>

      <PageHeader
        eyebrow={`CoachHQ · ${facility.location.name}`}
        titleLead={facility.name}
        titleItalic={`· uke ${ukeNr}`}
        sub={`${dagFormatter.format(dager[0])} – ${dagFormatter.format(dager[6])} ${ukeStart.getFullYear()} · Kapasitet ${facility.capacity}`}
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle facilityId={facility.id} active="uke" />
            <UkeNav facilityId={facility.id} ukeStart={ukeStart} />
          </div>
        }
      />

      {/* Info-strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard
          icon={MapPin}
          label="Lokasjon"
          value={facility.location.name}
        />
        <InfoCard
          icon={Users}
          label="Kapasitet"
          value={`${facility.capacity}`}
        />
        <InfoCard
          icon={CalendarRange}
          label="Bookinger denne uka"
          value={`${bookings.length}`}
        />
        <InfoCard
          icon={Users}
          label="Faste grupper"
          value={`${aktiveGrupper.length}`}
        />
      </div>

      {/* Live-belegg-kort */}
      <LiveOccupancy
        bookings={bookings.map((b) => ({
          startAt: b.startAt,
          endAt: b.endAt,
        }))}
        capacity={facility.capacity}
        ukeStart={ukeStart}
      />

      {/* Uke-kalender */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <div className="min-w-[800px]">
          {/* Header med ukedager */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-secondary/40">
            <div />
            {dager.map((d, i) => {
              const erIdag = sammeDag(d, idag);
              return (
                <div
                  key={i}
                  className={`border-l border-border px-2 py-2.5 text-center ${
                    erIdag ? "bg-accent/15" : ""
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {DAGER[i]}
                  </div>
                  <div
                    className={`mt-0.5 font-display text-sm font-semibold ${
                      erIdag ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time-grid */}
          <div
            className="relative grid grid-cols-[60px_repeat(7,1fr)]"
            style={{ height: `${HOURS.length * SLOT_PX}px` }}
          >
            {/* Tidskolonne */}
            <div>
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className="flex items-start justify-end border-t border-border/60 pr-2 pt-0.5 font-mono text-[10px] text-muted-foreground"
                  style={{ height: `${SLOT_PX}px` }}
                >
                  {i === 0 ? "" : h}
                </div>
              ))}
            </div>

            {/* Dag-kolonner */}
            {dager.map((d, dagIdx) => {
              const dagBookings = bookings.filter((b) => sammeDag(d, b.startAt));
              const weekday = (d.getDay() + 6) % 7; // 0=mandag
              const dagGrupper = aktiveGrupper.filter(
                (g) => g.weekday === weekday,
              );
              return (
                <div
                  key={dagIdx}
                  className="relative border-l border-border"
                >
                  {/* Time-linjer */}
                  {HOURS.map((_h, i) => (
                    <div
                      key={i}
                      className="border-t border-border/40"
                      style={{ height: `${SLOT_PX}px` }}
                    />
                  ))}

                  {/* Faste grupper */}
                  {dagGrupper.map((g, i) => (
                    <EventBlock
                      key={`g-${i}`}
                      startH={g.startHour}
                      endH={g.endHour}
                      title={g.title}
                      sub={g.sub}
                      tone="group"
                    />
                  ))}

                  {/* Bookinger */}
                  {dagBookings.map((b) => {
                    const startH =
                      b.startAt.getHours() + b.startAt.getMinutes() / 60;
                    const endH =
                      b.endAt.getHours() + b.endAt.getMinutes() / 60;
                    return (
                      <EventBlock
                        key={b.id}
                        startH={startH}
                        endH={endH}
                        title={`${b.user?.name ?? "Gjest"} · ${b.serviceType.name}`}
                        sub={b.serviceType.coach?.name ?? ""}
                        tone="booking"
                        bookingId={b.id}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <LegendDot color="bg-primary" label="Coaching-booking" />
        <LegendDot color="bg-accent" label="Fast gruppe" />
        <LegendDot
          color="bg-secondary border border-border"
          label="Ledig — klikk for å booke"
        />
      </div>

      <p className="font-mono text-[11px] text-muted-foreground">
        Viser aktivitet på lokasjon · {facility.location.name}. Fasilitet-spesifikk
        binding kommer i v2 (krever facilityId-felt på Booking).
      </p>
    </div>
  );
}

// ----------------- MÅNED-VIEW -----------------

async function MndView({
  facility,
  referansedag,
}: {
  facility: {
    id: string;
    name: string;
    capacity: number;
    location: { id: string; name: string };
  };
  referansedag: Date;
}) {
  const year = referansedag.getFullYear();
  const month = referansedag.getMonth();
  const forsteIMnd = new Date(year, month, 1);
  const sisteIMnd = new Date(year, month + 1, 0);
  const dagerIMnd = sisteIMnd.getDate();
  // Mandag = 0
  const startWeekday = (forsteIMnd.getDay() + 6) % 7;

  const visStart = new Date(year, month, 1 - startWeekday);
  const visSlutt = new Date(year, month, dagerIMnd + (7 - ((startWeekday + dagerIMnd) % 7)) % 7);
  visSlutt.setDate(visSlutt.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      locationId: facility.location.id,
      startAt: { gte: visStart, lt: visSlutt },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    include: {
      user: { select: { name: true } },
      serviceType: { select: { name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  const aktiveGrupper = FASTE_GRUPPER.filter((g) => g.navnMatch.test(facility.name));

  // Bygg dager-grid (typisk 35 eller 42 ruter)
  const ruter: Date[] = [];
  for (
    let d = new Date(visStart);
    d < visSlutt;
    d = new Date(d.getTime() + 86400000)
  ) {
    ruter.push(new Date(d));
  }

  const idag = new Date();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/facilities"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.75} />
        Fasiliteter
      </Link>

      <PageHeader
        eyebrow={`CoachHQ · ${facility.location.name}`}
        titleLead={facility.name}
        titleItalic={`· ${MND_NAVN[month]} ${year}`}
        sub={`Måneds-oversikt · Kapasitet ${facility.capacity}`}
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle facilityId={facility.id} active="maned" />
            <MndNav facilityId={facility.id} year={year} month={month} />
          </div>
        }
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-border bg-secondary/40">
          {DAGER.map((d) => (
            <div
              key={d}
              className="px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Dager */}
        <div className="grid grid-cols-7">
          {ruter.map((d, i) => {
            const erDenneMaaneden = d.getMonth() === month;
            const erIdag = sammeDag(d, idag);
            const weekday = (d.getDay() + 6) % 7;
            const dagBookings = bookings.filter((b) => sammeDag(d, b.startAt));
            const dagGrupper = aktiveGrupper.filter((g) => g.weekday === weekday);
            const totaltEvents = dagBookings.length + dagGrupper.length;

            return (
              <div
                key={i}
                className={`min-h-[110px] border-b border-r border-border/60 p-2 ${
                  !erDenneMaaneden ? "bg-secondary/20 text-muted-foreground" : ""
                } ${erIdag ? "bg-accent/15" : ""}`}
              >
                <div
                  className={`mb-1.5 font-mono text-[11px] ${
                    erIdag ? "font-semibold text-primary" : ""
                  }`}
                >
                  {d.getDate()}
                </div>

                <div className="space-y-1">
                  {dagGrupper.slice(0, 2).map((g, idx) => (
                    <div
                      key={`g-${idx}`}
                      className="truncate rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground"
                      title={g.title}
                    >
                      {String(g.startHour).padStart(2, "0")} {g.title}
                    </div>
                  ))}
                  {dagBookings.slice(0, 2).map((b) => (
                    <div
                      key={b.id}
                      className="truncate rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                      title={`${b.user?.name ?? "Gjest"} · ${b.serviceType.name}`}
                    >
                      {String(b.startAt.getHours()).padStart(2, "0")}{" "}
                      {b.user?.name.split(" ")[0] ?? "Gjest"}
                    </div>
                  ))}
                  {totaltEvents > 4 && (
                    <div className="px-1.5 text-[10px] text-muted-foreground">
                      +{totaltEvents - 4} til
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {bookings.length === 0 && aktiveGrupper.length === 0 && (
        <EmptyState
          icon={CalendarRange}
          titleItalic="Ingen aktivitet"
          titleTrail={`i ${MND_NAVN[month]}`}
          sub="Booket coaching-timer og faste gruppetider vises her."
        />
      )}
    </div>
  );
}

// ----------------- Komponenter -----------------

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        <Icon size={12} strokeWidth={1.75} />
        {label}
      </div>
      <div className="mt-1.5 font-display text-base font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function LiveOccupancy({
  bookings,
  capacity,
  ukeStart,
}: {
  bookings: { startAt: Date; endAt: Date }[];
  capacity: number;
  ukeStart: Date;
}) {
  const naa = new Date();
  const aktiv = bookings.find((b) => b.startAt <= naa && b.endAt > naa);

  // Bygg 7 dag-belegg som % (timer booket / 14 timer åpent 08-22)
  const ukeDager: { d: Date; pct: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ukeStart);
    d.setDate(ukeStart.getDate() + i);
    const dagBookings = bookings.filter((b) => sammeDag(d, b.startAt));
    const timer = dagBookings.reduce((s, b) => {
      const ms = b.endAt.getTime() - b.startAt.getTime();
      return s + ms / 3_600_000;
    }, 0);
    ukeDager.push({ d, pct: Math.min(100, Math.round((timer / 14) * 100)) });
  }

  const snitt = Math.round(
    ukeDager.reduce((s, d) => s + d.pct, 0) / Math.max(1, ukeDager.length),
  );

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Live-belegg
          </div>
          <div className="mt-1 font-display text-lg font-semibold">
            {aktiv ? "Opptatt nå" : "Ledig nå"}
            <span className="ml-2 font-mono text-sm font-normal text-muted-foreground tabular-nums">
              · snitt {snitt} % uke
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 font-mono text-[11px] font-medium ${
            aktiv
              ? "bg-primary/15 text-primary"
              : "bg-accent/30 text-accent-foreground"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              aktiv ? "bg-primary" : "bg-accent"
            }`}
          />
          Kapasitet {capacity}
        </span>
      </div>
      <div className="flex h-16 items-end gap-2">
        {ukeDager.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full w-full items-end">
              <div
                className={`w-full rounded-sm ${
                  d.pct >= 80
                    ? "bg-primary"
                    : d.pct >= 40
                      ? "bg-primary/60"
                      : d.pct > 0
                        ? "bg-primary/30"
                        : "bg-secondary"
                }`}
                style={{ height: `${Math.max(4, d.pct)}%` }}
              />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              {DAGER[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewToggle({
  facilityId,
  active,
}: {
  facilityId: string;
  active: "uke" | "maned";
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-0.5">
      <Link
        href={`/admin/facilities/${facilityId}?view=uke`}
        className={`px-4 py-1 text-xs font-medium ${
          active === "uke"
            ? "rounded bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Uke
      </Link>
      <Link
        href={`/admin/facilities/${facilityId}?view=maned`}
        className={`px-4 py-1 text-xs font-medium ${
          active === "maned"
            ? "rounded bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Måned
      </Link>
    </div>
  );
}

function UkeNav({
  facilityId,
  ukeStart,
}: {
  facilityId: string;
  ukeStart: Date;
}) {
  const forrige = new Date(ukeStart);
  forrige.setDate(forrige.getDate() - 7);
  const neste = new Date(ukeStart);
  neste.setDate(neste.getDate() + 7);

  return (
    <div className="inline-flex items-center gap-1">
      <Link
        href={`/admin/facilities/${facilityId}?view=uke&uke=${isoUkeKey(forrige)}`}
        aria-label="Forrige uke"
        className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <ChevronLeft size={14} strokeWidth={1.75} />
      </Link>
      <Link
        href={`/admin/facilities/${facilityId}?view=uke`}
        className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground hover:border-primary hover:text-primary"
      >
        I dag
      </Link>
      <Link
        href={`/admin/facilities/${facilityId}?view=uke&uke=${isoUkeKey(neste)}`}
        aria-label="Neste uke"
        className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <ChevronRight size={14} strokeWidth={1.75} />
      </Link>
    </div>
  );
}

function MndNav({
  facilityId,
  year,
  month,
}: {
  facilityId: string;
  year: number;
  month: number;
}) {
  const forrige = new Date(year, month - 1, 1);
  const neste = new Date(year, month + 1, 1);

  return (
    <div className="inline-flex items-center gap-1">
      <Link
        href={`/admin/facilities/${facilityId}?view=maned&mnd=${mndKey(forrige)}`}
        aria-label="Forrige måned"
        className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <ChevronLeft size={14} strokeWidth={1.75} />
      </Link>
      <Link
        href={`/admin/facilities/${facilityId}?view=maned`}
        className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground hover:border-primary hover:text-primary"
      >
        I dag
      </Link>
      <Link
        href={`/admin/facilities/${facilityId}?view=maned&mnd=${mndKey(neste)}`}
        aria-label="Neste måned"
        className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <ChevronRight size={14} strokeWidth={1.75} />
      </Link>
    </div>
  );
}

function EventBlock({
  startH,
  endH,
  title,
  sub,
  tone,
  bookingId,
}: {
  startH: number;
  endH: number;
  title: string;
  sub?: string;
  tone: "booking" | "group";
  bookingId?: string;
}) {
  if (endH <= START_HOUR || startH >= END_HOUR + 1) return null;
  const clampedStart = Math.max(startH, START_HOUR);
  const clampedEnd = Math.min(endH, END_HOUR + 1);
  const top = (clampedStart - START_HOUR) * SLOT_PX;
  const height = Math.max(28, (clampedEnd - clampedStart) * SLOT_PX);

  const baseClasses =
    "absolute left-0.5 right-0.5 overflow-hidden rounded px-2 py-1 text-[11px] leading-tight";
  const toneClasses =
    tone === "booking"
      ? "border border-primary/40 bg-primary/15 text-primary"
      : "border border-accent/50 bg-accent/30 text-accent-foreground";

  const content = (
    <>
      <div className="truncate font-semibold">{title}</div>
      {sub && <div className="mt-0.5 truncate opacity-75">{sub}</div>}
    </>
  );

  if (bookingId) {
    return (
      <Link
        href={`/admin/bookinger`}
        style={{ top: `${top}px`, height: `${height}px` }}
        className={`${baseClasses} ${toneClasses} transition-opacity hover:opacity-80`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      style={{ top: `${top}px`, height: `${height}px` }}
      className={`${baseClasses} ${toneClasses}`}
    >
      {content}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

// ----------------- Helpers -----------------

function isoUkeKey(d: Date): string {
  return `${d.getFullYear()}-W${String(ukenummer(d)).padStart(2, "0")}`;
}

function ukeFromIso(value: string): Date | null {
  const m = value.match(/^(\d{4})-W(\d{1,2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - (jan4Day - 1) + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function mndKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function mndFromKey(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, 1);
}
