/**
 * AgencyOS Kalender — uke-visning, lese-modus (fasit: _screens/ag-kalender.png +
 * SKJERMER-RUNDE-4-AGENCYOS skjerm 7). Coach ser hele uka på tvers av spillere
 * i ett blikk. Presentasjonell + props-drevet — ingen DB/auth/client-state.
 *
 * Layout (følger fasiten):
 *   - Topp-rad: H1 "Kalender" + vis-toggle (UKE aktiv / MÅNED / LISTE) + Ny booking
 *   - Nav-rad: ‹ "Uke 23 · 1.–7. jun 2026" › + I dag
 *   - Uke-grid (hvitt kort, radius 16, border): tidskolonne 64px + 7 dager (1fr),
 *     07–18 (12 timerader × 48px). Today-kolonne = lime 5%-tint + now-line.
 *   - Event-blokk: 3px venstre-strek (lime=1-til-1 / forest=gruppe / cream-gull=live)
 *   - Legende nederst: 3 swatches
 *
 * DS-tokens kun — ingen hardkodet hex, ingen emoji (kun lucide).
 */

import Link from "next/link";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Grid-geometri (fasit: 07–18, 1 t = 48px) ────────────────────────────────
const START_HOUR = 7;
const END_HOUR = 18;
const ROW_PX = 48;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i,
);
const BODY_PX = (END_HOUR - START_HOUR) * ROW_PX; // 11 * 48 = 528

// ── Event-typer ──────────────────────────────────────────────────────────────
export type WeekEventKind = "oneToOne" | "group" | "live";

export type WeekEvent = {
  id: string;
  /** 0 = mandag … 6 = søndag */
  dayIndex: number;
  /** "HH:MM" — starttid (klokkeslett innen 07–18) */
  start: string;
  /** Varighet i minutter (1 t = 48px) */
  durationMin: number;
  kind: WeekEventKind;
  player: string;
  /** Type-tekst under navnet, f.eks. "SLAG", "GRUPPE · WANG" */
  typeLabel: string;
  /** Valgfri sted-linje (vises med map-pin) */
  location?: string;
  href?: string;
};

export type CalendarDay = {
  /** "MAN" … "SØN" */
  dow: string;
  /** Datotall, f.eks. "1" */
  date: string;
  /** Måned-suffiks vist under datoen (fasiten viser kun "jun" på i-dag-kolonnen) */
  monthSub?: string;
  weekend?: boolean;
  today?: boolean;
};

export type CalendarData = {
  /** Nav-tittel, f.eks. "Uke 23" */
  weekLabel: string;
  /** Datospenn, f.eks. "1.–7. jun 2026" */
  rangeLabel: string;
  days: CalendarDay[]; // alltid 7 (man–søn)
  events: WeekEvent[];
  /** Minutter siden midnatt for now-line (kun tegnet i today-kolonnen) */
  nowMinutes?: number;
  /** Ruter for navigasjon */
  prevHref?: string;
  nextHref?: string;
  todayHref?: string;
  monthHref?: string;
  listHref?: string;
  newBookingHref?: string;
};

// ── Hjelpere ─────────────────────────────────────────────────────────────────
function minutesFromClock(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + (m || 0);
}

function topForClock(clock: string): number {
  return ((minutesFromClock(clock) - START_HOUR * 60) / 60) * ROW_PX;
}

function heightForDuration(min: number): number {
  return (min / 60) * ROW_PX;
}

// Event-stil per type (fasit/spec: lime=1:1, forest=gruppe, cream-gull=live)
const EVENT_STYLE: Record<
  WeekEventKind,
  { wrap: string; stroke: string; icon?: LucideIcon }
> = {
  oneToOne: {
    wrap: "bg-accent/15 border-accent/30",
    stroke: "bg-accent",
  },
  group: {
    wrap: "bg-primary/10 border-primary/20",
    stroke: "bg-primary",
    icon: Users,
  },
  live: {
    wrap: "bg-background border-warning/30",
    stroke: "bg-warning",
  },
};

// ── Event-blokk ──────────────────────────────────────────────────────────────
function EventBlock({ ev }: { ev: WeekEvent }) {
  const style = EVENT_STYLE[ev.kind];
  const top = topForClock(ev.start);
  const height = Math.max(heightForDuration(ev.durationMin), 36);
  const compact = height < 56;
  const TypeIcon = style.icon;

  const inner = (
    <>
      {/* venstre-strek 3px */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-md",
          style.stroke,
        )}
      />
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tabular-nums tracking-[0.02em] text-foreground">
        <span>{ev.start}</span>
        {TypeIcon ? (
          <TypeIcon className="ml-auto h-2.5 w-2.5 text-muted-foreground" strokeWidth={2} aria-hidden />
        ) : null}
      </div>
      <div
        className={cn(
          "font-semibold leading-tight tracking-[-0.005em] text-foreground",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        {ev.player}
      </div>
      {!compact && (
        <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          <span className="truncate">{ev.typeLabel}</span>
        </div>
      )}
      {!compact && ev.location ? (
        <div className="flex items-center gap-1 font-mono text-[9px] tracking-[0.04em] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5 shrink-0" strokeWidth={2} aria-hidden />
          <span className="truncate">{ev.location}</span>
        </div>
      ) : null}
    </>
  );

  const className = cn(
    "absolute left-1.5 right-1.5 z-[3] flex flex-col gap-0.5 overflow-hidden rounded-md border pl-2.5 pr-2 shadow-[0_1px_2px_rgba(10,31,23,0.04)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    compact ? "py-1.5" : "py-2",
    style.wrap,
  );
  const positional = { top, height } as const;

  if (ev.href) {
    return (
      <Link
        href={ev.href}
        aria-label={`${ev.player} · ${ev.typeLabel} · ${ev.start}`}
        className={cn(className, "hover:shadow-[0_4px_12px_rgba(10,31,23,0.08)]")}
        style={positional}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className={className} style={positional}>
      {inner}
    </div>
  );
}

// ── Hoved-komponent ──────────────────────────────────────────────────────────
export function Kalender({ data }: { data: CalendarData }) {
  const {
    weekLabel,
    rangeLabel,
    days,
    events,
    nowMinutes,
    prevHref = "#",
    nextHref = "#",
    todayHref = "#",
    monthHref = "/admin/calendar/maned",
    listHref = "/admin/bookinger",
    newBookingHref = "/admin/bookinger/ny",
  } = data;

  const todayIndex = days.findIndex((d) => d.today);
  const showNowLine =
    typeof nowMinutes === "number" &&
    nowMinutes >= START_HOUR * 60 &&
    nowMinutes <= END_HOUR * 60;
  const nowTop = showNowLine
    ? ((nowMinutes! - START_HOUR * 60) / 60) * ROW_PX
    : 0;

  // 64px tidskolonne + 7 dager (1fr)
  const gridCols = "64px repeat(7, minmax(0, 1fr))";

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {/* ── Topp-rad: H1 + vis-toggle + Ny booking ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(1.75rem,4vw,2.25rem)] font-bold tracking-[-0.02em] text-foreground">
          Kalender
        </h1>

        <div className="flex items-center gap-3">
          {/* Vis-toggle (pill-gruppe, UKE aktiv) */}
          <div
            role="tablist"
            aria-label="Kalendervisning"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
          >
            <span
              role="tab"
              aria-selected="true"
              aria-current="page"
              className="rounded-full bg-accent px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-accent-foreground"
            >
              Uke
            </span>
            <Link
              href={monthHref}
              role="tab"
              aria-selected="false"
              className="rounded-full px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Måned
            </Link>
            <Link
              href={listHref}
              role="tab"
              aria-selected="false"
              className="rounded-full px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Liste
            </Link>
          </div>

          {/* Ny booking */}
          <Link
            href={newBookingHref}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={2} aria-hidden />
            Ny booking
          </Link>
        </div>
      </div>

      {/* ── Nav-rad: ‹ Uke · range › + I dag ── */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={prevHref}
            aria-label="Forrige uke"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold tracking-[-0.015em] text-foreground">
              {weekLabel}
            </span>
            <span className="font-mono text-sm tracking-[0.02em] text-muted-foreground">
              · {rangeLabel}
            </span>
          </p>
          <Link
            href={nextHref}
            aria-label="Neste uke"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        </div>

        <Link
          href={todayHref}
          className="rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          I dag
        </Link>
      </div>

      {/* ── Uke-grid ── */}
      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[820px] overflow-hidden rounded-2xl border border-border bg-card">
          {/* Dag-headers */}
          <div
            className="grid border-b border-border"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div className="border-r border-border" aria-hidden />
            {days.map((d, i) => (
              <div
                key={`${d.dow}-${i}`}
                className={cn(
                  "flex flex-col gap-1 px-3.5 py-3",
                  i < days.length - 1 && "border-r border-border",
                  d.weekend && "bg-foreground/[0.02]",
                )}
              >
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {d.dow}
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "font-display text-lg font-bold leading-none tabular-nums tracking-[-0.015em]",
                      d.today
                        ? "text-primary"
                        : d.weekend
                          ? "text-muted-foreground"
                          : "text-foreground",
                    )}
                  >
                    {d.date}
                  </span>
                  {d.today ? (
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(209,248,67,0.7)]"
                    />
                  ) : null}
                  {d.monthSub ? (
                    <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                      {d.monthSub}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>

          {/* Grid-body: tidskolonne + 7 dag-kolonner */}
          <div
            className="grid"
            style={{ gridTemplateColumns: gridCols }}
          >
            {/* Tidskolonne */}
            <div
              className="relative border-r border-border"
              style={{ height: BODY_PX }}
            >
              {HOURS.map((h, i) => (
                <span
                  key={h}
                  className="absolute right-0 -translate-y-1/2 pr-2 font-mono text-[10px] font-medium tabular-nums tracking-[0.04em] text-muted-foreground"
                  style={{ top: i * ROW_PX }}
                >
                  {String(h).padStart(2, "0")}
                </span>
              ))}
            </div>

            {/* Dag-kolonner */}
            {days.map((d, i) => {
              const dayEvents = events.filter((e) => e.dayIndex === i);
              return (
                <div
                  key={`col-${i}`}
                  className={cn(
                    "relative",
                    i < days.length - 1 && "border-r border-border",
                    d.weekend && "bg-foreground/[0.02]",
                    d.today && "bg-accent/[0.05]",
                  )}
                  style={{ height: BODY_PX }}
                >
                  {/* Horisontale time-linjer */}
                  {HOURS.slice(1).map((_, idx) => (
                    <span
                      key={idx}
                      aria-hidden
                      className="pointer-events-none absolute left-0 right-0 h-px bg-border/45"
                      style={{ top: (idx + 1) * ROW_PX }}
                    />
                  ))}

                  {/* Now-line (kun i today-kolonnen) */}
                  {showNowLine && i === todayIndex ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-0 right-0 z-[4] h-0.5 bg-accent shadow-[0_0_8px_rgba(209,248,67,0.5)]"
                      style={{ top: nowTop }}
                    >
                      <span className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-accent" />
                    </span>
                  ) : null}

                  {/* Events */}
                  {dayEvents.map((ev) => (
                    <EventBlock key={ev.id} ev={ev} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Legende ── */}
      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <LegendItem swatchClass="bg-accent" label="Lime = 1-til-1" />
        <LegendItem swatchClass="bg-primary" label="Forest = gruppe" />
        <LegendItem swatchClass="bg-warning" label="Cream-gull = Live-økt" />
      </div>
    </div>
  );
}

function LegendItem({
  swatchClass,
  label,
}: {
  swatchClass: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2 text-sm tracking-[-0.005em] text-foreground">
      <span aria-hidden className={cn("h-3.5 w-1 rounded-full", swatchClass)} />
      {label}
    </span>
  );
}
