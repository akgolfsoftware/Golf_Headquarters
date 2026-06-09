/**
 * AgencyOS — Kalender (måneds-vy).
 *
 * Bygd fra src/app/kalender-maaned-demo/page.tsx, koblet til Prisma:
 *  - prisma.booking.findMany() for hele måned + buffer-uker
 *  - Egne økter (innlogget coach) skilles fra andre coacher
 *  - Gruppe-økter: heuristikk på serviceType.name (grupp/akademi/junior/wang/a-lag)
 *  - 6-ukers visning (kalender-grid)
 *  - Navigasjon prev/next måned via ?mnd=YYYY-MM
 */

import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { CalendarViewToggle } from "@/components/admin/calendar-view-toggle";
import { sammeDag, ukenummer } from "@/lib/uke-helpers";

const ICON_STROKE = 1.75;

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

type EventTone = "own" | "others" | "group" | "block";

type DayEvent = {
  time: string;
  label: string;
  tone: EventTone;
};

type Search = { mnd?: string };

function mndKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function mndFromKey(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, 1);
}

export default async function KalenderManedPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { mnd } = await searchParams;

  const idag = new Date();
  const referansedag = mnd ? (mndFromKey(mnd) ?? idag) : idag;
  const year = referansedag.getFullYear();
  const month = referansedag.getMonth();

  const forsteIMnd = new Date(year, month, 1);
  const sisteIMnd = new Date(year, month + 1, 0);
  const dagerIMnd = sisteIMnd.getDate();
  const startWeekday = (forsteIMnd.getDay() + 6) % 7; // mandag = 0

  const visStart = new Date(year, month, 1 - startWeekday);
  const totaltRuter = Math.ceil((startWeekday + dagerIMnd) / 7) * 7;
  const visSlutt = new Date(visStart);
  visSlutt.setDate(visStart.getDate() + totaltRuter);

  const bookings = await prisma.booking.findMany({
    where: {
      startAt: { gte: visStart, lt: visSlutt },
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    },
    include: {
      user: { select: { id: true, name: true } },
      serviceType: {
        select: {
          name: true,
          coachUserId: true,
          coach: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { startAt: "asc" },
  });

  // Bygg dag-grid
  const ruter: Date[] = [];
  for (let i = 0; i < totaltRuter; i++) {
    const d = new Date(visStart);
    d.setDate(visStart.getDate() + i);
    ruter.push(d);
  }

  // Grupperinger
  const dagBookings = new Map<string, typeof bookings>();
  for (const b of bookings) {
    const key = `${b.startAt.getFullYear()}-${b.startAt.getMonth()}-${b.startAt.getDate()}`;
    const arr = dagBookings.get(key) ?? [];
    arr.push(b);
    dagBookings.set(key, arr);
  }

  function eventsForDag(d: Date): { events: DayEvent[]; total: number } {
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const liste = dagBookings.get(key) ?? [];
    const events: DayEvent[] = liste.slice(0, 3).map((b) => {
      const gruppe = /grupp|akademi|junior|wang|a-lag/i.test(
        b.serviceType?.name ?? "",
      );
      const erEgen = b.serviceType?.coachUserId === user.id;
      const tone: EventTone = gruppe ? "group" : erEgen ? "own" : "others";
      const timer = String(b.startAt.getHours()).padStart(2, "0");
      const navn = gruppe
        ? (b.serviceType?.name ?? "Gruppe")
        : (b.user?.name.split(" ")[0] ?? "Økt");
      return { time: timer, label: navn, tone };
    });
    return { events, total: liste.length };
  }

  // Måneds-statistikk
  const totaltMnd = bookings.filter(
    (b) =>
      b.startAt.getFullYear() === year && b.startAt.getMonth() === month,
  ).length;
  const egneMnd = bookings.filter(
    (b) =>
      b.startAt.getFullYear() === year &&
      b.startAt.getMonth() === month &&
      b.serviceType?.coachUserId === user.id,
  ).length;
  const gruppeMnd = bookings.filter(
    (b) =>
      b.startAt.getFullYear() === year &&
      b.startAt.getMonth() === month &&
      /grupp|akademi|junior|wang|a-lag/i.test(b.serviceType?.name ?? ""),
  ).length;

  const forrige = new Date(year, month - 1, 1);
  const neste = new Date(year, month + 1, 1);

  // Build day-detail for "today" if in current month, else first day with bookings
  const dagDetail =
    bookings.find(
      (b) => b.startAt.getFullYear() === year && b.startAt.getMonth() === month,
    ) ?? null;
  const valgtDag = dagDetail?.startAt ?? new Date(year, month, 1);
  const valgtKey = `${valgtDag.getFullYear()}-${valgtDag.getMonth()}-${valgtDag.getDate()}`;
  const valgtBookings = (dagBookings.get(valgtKey) ?? []).slice(0, 6);

  return (
    <div className="flex flex-col gap-6 px-6 py-8 md:px-10 md:py-10">
      <PageHeader
        eyebrow="AgencyOS · Kalender"
        titleLead="Kalender"
        titleItalic="måned"
        sub="Zoom ut. Se hvor måneden tetner."
        actions={
          <div className="flex items-center gap-2">
            <CalendarViewToggle active="month" />
            <Link
              href="/admin/calendar/maned"
              className="rounded-md border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-secondary"
            >
              I dag
            </Link>
            <Link
              href="/admin/kalender"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              Ny økt
            </Link>
          </div>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* Måneds-kort */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                <em className="font-normal italic">
                  {capitalize(MND_NAVN[month])} {year}
                </em>
              </h2>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                {totaltMnd} økter planlagt · {egneMnd} egne · {gruppeMnd} gruppe
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/calendar/maned?mnd=${mndKey(forrige)}`}
                aria-label="Forrige måned"
                className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={ICON_STROKE} />
              </Link>
              <Link
                href={`/admin/calendar/maned?mnd=${mndKey(neste)}`}
                aria-label="Neste måned"
                className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={ICON_STROKE} />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
          {/* Ukedager */}
          <div className="grid grid-cols-[32px_repeat(7,1fr)] border-b border-border bg-secondary/60">
            <div className="py-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Uke
            </div>
            {DAGER.map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Måneds-grid */}
          <div className="grid auto-rows-[112px] grid-cols-[32px_repeat(7,1fr)]">
            {Array.from({ length: totaltRuter / 7 }).map((_, ukeIdx) => {
              const ukeStart = ruter[ukeIdx * 7];
              const ukeNr = ukenummer(ukeStart);
              const inneIMnd = ukeStart.getMonth() === month;
              const erDenneUken = ruter
                .slice(ukeIdx * 7, ukeIdx * 7 + 7)
                .some((d) => sammeDag(d, idag));

              return (
                <RowFragment
                  key={ukeIdx}
                  ukeNr={ukeNr}
                  current={erDenneUken}
                  inneIMnd={inneIMnd}
                >
                  {ruter.slice(ukeIdx * 7, ukeIdx * 7 + 7).map((d) => {
                    const { events, total } = eventsForDag(d);
                    return (
                      <DayCell
                        key={d.toISOString()}
                        d={d}
                        month={month}
                        idag={idag}
                        events={events}
                        more={total - events.length}
                      />
                    );
                  })}
                </RowFragment>
              );
            })}
          </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="rounded-2xl bg-foreground p-6 text-background">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-background/50">
              Dag-detalj
            </span>
            <h3 className="mt-1.5 font-display text-xl font-semibold tracking-tight">
              {formatterDag(valgtDag)}
            </h3>
            <div className="font-mono text-[11px] text-background/60 tabular-nums">
              {valgtBookings.length} økter
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
              {valgtBookings.length === 0 && (
                <div className="font-mono text-[11px] text-background/50">
                  Ingen bookinger denne dagen.
                </div>
              )}
              {valgtBookings.map((b) => (
                <ScheduleEv
                  key={b.id}
                  t={String(b.startAt.getHours()).padStart(2, "0") + ":00"}
                  name={b.user?.name ?? "Gjest"}
                  who={`${b.serviceType?.name ?? "Økt"}${b.serviceType?.coach?.name ? " · " + b.serviceType.coach.name : ""}`}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Forklaring
            </div>
            <LegendRow
              swatchClass="border-l-2 border-primary bg-primary/10"
              label="Egne økter"
            />
            <LegendRow
              swatchClass="border-l-2 border-muted-foreground bg-secondary"
              label="Andre coacher"
            />
            <LegendRow
              swatchClass="border-l-2 border-accent bg-accent/30"
              label="Gruppe-økter"
            />
          </div>

          {/* Måneds-stats */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Måneds-snitt
            </div>
            <MiniStat k="Økter totalt" v={String(totaltMnd)} />
            <MiniStat k="Egne · solo" v={String(egneMnd - gruppeMnd > 0 ? egneMnd - gruppeMnd : egneMnd)} />
            <MiniStat k="Gruppe-økter" v={String(gruppeMnd)} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatterDag(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

function RowFragment({
  ukeNr,
  current,
  inneIMnd,
  children,
}: {
  ukeNr: number;
  current: boolean;
  inneIMnd: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className={`flex items-start justify-center border-b border-r border-border pt-2 font-mono text-[11px] font-medium ${
          current
            ? "bg-accent/30 text-foreground"
            : inneIMnd
              ? "bg-secondary text-muted-foreground"
              : "bg-secondary/40 text-muted-foreground/60"
        }`}
      >
        {ukeNr}
      </div>
      {children}
    </>
  );
}

function DayCell({
  d,
  month,
  idag,
  events,
  more,
}: {
  d: Date;
  month: number;
  idag: Date;
  events: DayEvent[];
  more: number;
}) {
  const inneIMnd = d.getMonth() === month;
  const erIdag = sammeDag(d, idag);
  const erHelg = d.getDay() === 0 || d.getDay() === 6;

  const baseTone = !inneIMnd
    ? "bg-background/40 text-muted-foreground/60"
    : erIdag
      ? "bg-accent/30"
      : erHelg
        ? "bg-secondary/40"
        : "bg-card hover:bg-secondary/30";

  return (
    <div
      className={`relative flex flex-col gap-1 overflow-hidden border-b border-r border-border px-2 py-2 transition-colors ${baseTone}`}
    >
      <div className="flex items-center justify-between">
        {erIdag ? (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground font-mono text-[11px] font-semibold text-background">
            {d.getDate()}
          </span>
        ) : (
          <span
            className={`font-mono text-[12px] font-medium ${
              inneIMnd ? "text-foreground" : "text-muted-foreground/60"
            }`}
          >
            {d.getDate()}
          </span>
        )}
      </div>
      {events.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {events.map((ev, i) => (
            <Pill key={i} {...ev} />
          ))}
        </div>
      )}
      {more > 0 && (
        <div className="font-mono text-[10px] text-muted-foreground">
          +{more} til
        </div>
      )}
    </div>
  );
}

function Pill({ time, label, tone }: DayEvent) {
  const styles =
    tone === "own"
      ? "border-l-2 border-primary bg-primary/10 text-primary"
      : tone === "others"
        ? "border-l-2 border-muted-foreground bg-secondary text-muted-foreground"
        : tone === "group"
          ? "border-l-2 border-accent bg-accent/30 text-accent-foreground"
          : "bg-secondary text-muted-foreground";
  return (
    <div
      className={`flex items-center gap-1 overflow-hidden whitespace-nowrap rounded-sm py-0.5 pl-1 pr-1.5 text-[10px] font-medium ${styles}`}
    >
      <span className="shrink-0 font-mono text-[9px] opacity-70 tabular-nums">
        {time}
      </span>
      <span className="overflow-hidden text-ellipsis">{label}</span>
    </div>
  );
}

function ScheduleEv({
  t,
  name,
  who,
}: {
  t: string;
  name: string;
  who?: string;
}) {
  return (
    <div className="grid grid-cols-[44px_1fr] items-baseline gap-2">
      <span className="font-mono text-[11px] text-background/55 tabular-nums">
        {t}
      </span>
      <span className="text-[12px]">
        {name}
        {who && (
          <span className="mt-0.5 block font-mono text-[10px] text-background/55">
            {who}
          </span>
        )}
      </span>
    </div>
  );
}

function LegendRow({
  swatchClass,
  label,
}: {
  swatchClass: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-[12px]">
      <span className={`h-3.5 w-3.5 shrink-0 rounded-sm ${swatchClass}`} />
      {label}
    </div>
  );
}

function MiniStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-t border-border/60 py-2 first:border-t-0">
      <span className="text-[12px] text-muted-foreground">{k}</span>
      <span className="font-mono text-sm font-medium tabular-nums">{v}</span>
    </div>
  );
}
