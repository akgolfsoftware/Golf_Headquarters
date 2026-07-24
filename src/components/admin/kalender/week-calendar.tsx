/**
 * AgencyOS Kalender — uke-visning, lese-modus (/admin/kalender).
 * Port av [historisk fasit, fjernet 2026-07-03] agencyos/components-workbench-week.html
 * (uke-grid-mønsteret) + skjerm 7-spec i SKJERMER-RUNDE-4-AGENCYOS.
 *
 * Server Component (ren presentasjon, ingen client-state). Data kommer fra
 * loadWeekCalendar (src/lib/admin-kalender/week-data.ts).
 *
 * Layout:
 *   - Toolbar: H1 "Kalender" + vis-toggle (Uke aktiv / Måned / Liste) + Ny booking
 *   - Nav-rad: ‹ Uke N · range › + I dag
 *   - Uke-grid: 8 kol (tidskolonne 64px + 7 dager 1fr), 07–18 (12 rader × 48px)
 *   - Event-blokk: 3px venstre-strek (lime=1:1 / forest=gruppe / cream-gull=live)
 *   - Legende nederst
 *
 * DS-tokens kun — ingen hardkodet hex, ingen emoji (kun lucide).
 */

import Link from "next/link";
import {
  CalendarPlus,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Notion Calendar-fasit — én kilde (05:00–23:00, 30 min).
import {
  GRID_START_HOUR as START_HOUR,
  GRID_END_HOUR as END_HOUR,
  PIXEL_PER_HOUR as ROW_PX,
  GRID_BODY_PX as BODY_PX,
  gridHours,
  minutesToPx,
} from "@/lib/calendar/notion-grid";

const HOURS = gridHours();

export type WeekEventKind = "oneToOne" | "group" | "live";

export type WeekEvent = {
  id: string;
  /** 0 = mandag … 6 = søndag. */
  dayIndex: number;
  /** Minutter siden midnatt (start/slutt). */
  startMin: number;
  endMin: number;
  timeLabel: string;
  /** Tittel = spiller/gjest-navn. */
  title: string;
  serviceLabel: string;
  location: string | null;
  kind: WeekEventKind;
  isCompleted: boolean;
  href: string;
};

export type WeekDayHeader = {
  dow: string;
  date: number;
  month: string;
  weekend: boolean;
  isToday: boolean;
};

export type WeekCalendarProps = {
  weekNumber: number;
  rangeLabel: string;
  isCurrentWeek: boolean;
  prevWeekParam: string;
  nextWeekParam: string;
  todayParam: string;
  nowMinutes: number;
  /** 0–6 hvis i dag er i denne uka, ellers null. */
  nowDayIndex: number | null;
  days: WeekDayHeader[];
  events: WeekEvent[];
  bookingCount: number;
};

// ── Event-strek per type ────────────────────────────────────────
const kindStroke: Record<WeekEventKind, string> = {
  oneToOne: "border-l-accent", // lime
  group: "border-l-primary", // forest
  live: "border-l-warning", // cream-gull
};

const kindBg: Record<WeekEventKind, string> = {
  oneToOne: "bg-accent/[0.12]",
  group: "bg-primary/[0.08]",
  live: "bg-background",
};

// ── Vis-toggle (Uke aktiv / Måned / Liste) ──────────────────────
function ViewToggle() {
  const item = (label: string, href: string | null, active: boolean) => {
    const cls = cn(
      "inline-flex h-8 items-center rounded-full px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
      active ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground",
    );
    return href ? (
      <Link href={href} className={cls}>
        {label}
      </Link>
    ) : (
      <span className={cls} aria-current="page">
        {label}
      </span>
    );
  };
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5">
      {item("Uke", null, true)}
      {item("Måned", "/admin/kalender/maned", false)}
      {item("Liste", "/admin/bookinger", false)}
    </div>
  );
}

// ── Nav-rad: ‹ Uke N · range › + I dag ──────────────────────────
function NavRow({
  weekNumber,
  rangeLabel,
  prevWeekParam,
  nextWeekParam,
  todayParam,
  isCurrentWeek,
}: Pick<
  WeekCalendarProps,
  "weekNumber" | "rangeLabel" | "prevWeekParam" | "nextWeekParam" | "todayParam" | "isCurrentWeek"
>) {
  const navBtn = "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary";
  return (
    <div className="mb-4 mt-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link href={`/admin/kalender?uke=${prevWeekParam}`} className={navBtn} aria-label="Forrige uke">
          <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
        <div className="font-display text-xl font-bold leading-none tracking-[-0.015em] text-foreground">
          Uke {weekNumber}{" "}
          <span className="font-mono text-sm font-semibold tracking-[0.02em] text-muted-foreground">
            · {rangeLabel}
          </span>
        </div>
        <Link href={`/admin/kalender?uke=${nextWeekParam}`} className={navBtn} aria-label="Neste uke">
          <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      </div>
      <Link
        href={`/admin/kalender?uke=${todayParam}`}
        className={cn(
          "inline-flex h-8 items-center rounded-lg border px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] transition-colors",
          isCurrentWeek
            ? "border-border bg-secondary text-muted-foreground"
            : "border-primary bg-card text-primary hover:bg-primary hover:text-primary-foreground",
        )}
        aria-disabled={isCurrentWeek}
      >
        I dag
      </Link>
    </div>
  );
}

// ── Dag-header-rad ──────────────────────────────────────────────
function DayHeaders({ days }: { days: WeekDayHeader[] }) {
  return (
    <div
      className="grid border-b border-border bg-card"
      style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
    >
      <div className="border-r border-border" aria-hidden />
      {days.map((d, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col gap-0.5 border-r border-border px-3.5 py-3 last:border-r-0",
            d.weekend && "bg-foreground/[0.02]",
          )}
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {d.dow}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 font-display text-lg font-bold leading-none tracking-[-0.015em] tabular-nums",
              d.isToday ? "text-primary" : d.weekend ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {d.date}
            {d.isToday && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
            )}
            {i === 0 && (
              <span className="font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground">
                {d.month}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Event-blokk ─────────────────────────────────────────────────
function EventBlock({ ev }: { ev: WeekEvent }) {
  const minTop = START_HOUR * 60;
  const maxBottom = END_HOUR * 60;
  const top = minutesToPx(Math.max(ev.startMin, minTop));
  const bottom = minutesToPx(Math.min(ev.endMin, maxBottom));
  const height = Math.max(22, bottom - top);
  const compact = height < 44;

  return (
    <Link
      href={ev.href}
      className={cn(
        "group absolute left-1.5 right-1.5 flex flex-col gap-0.5 overflow-hidden rounded-lg border border-border border-l-[3px] px-2 py-1.5 shadow-[0_1px_2px_hsl(var(--foreground)/0.04)] transition-shadow hover:shadow-[0_4px_12px_hsl(var(--foreground)/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        kindStroke[ev.kind],
        kindBg[ev.kind],
        ev.isCompleted && "opacity-60",
      )}
      style={{ top, height }}
    >
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold leading-none tracking-[0.02em] tabular-nums text-foreground">
        {ev.timeLabel}
        {ev.kind === "live" && (
          <span className="inline-flex items-center gap-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-warning">
            <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-warning" />
            NÅ
          </span>
        )}
      </span>
      <span className="truncate text-xs font-semibold leading-tight tracking-[-0.005em] text-foreground">
        {ev.title}
      </span>
      {!compact && (
        <span className="inline-flex items-center gap-1.5 truncate font-mono text-[9px] uppercase tracking-[0.04em] text-muted-foreground">
          {ev.serviceLabel}
          {ev.location && (
            <span className="inline-flex items-center gap-0.5 normal-case">
              <MapPin className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
              {ev.location}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

// ── Uke-grid ────────────────────────────────────────────────────
function WeekGridBody({
  days,
  events,
  nowMinutes,
  nowDayIndex,
}: Pick<WeekCalendarProps, "days" | "events" | "nowMinutes" | "nowDayIndex">) {
  const nowVisible =
    nowDayIndex !== null && nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60;
  const nowTop = minutesToPx(nowMinutes);

  return (
    <div className="relative grid" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
      {/* Tidskolonne */}
      <div className="relative border-r border-border bg-card" style={{ height: BODY_PX }}>
        {HOURS.map((h, i) => (
          <span
            key={h}
            className="absolute right-2 -translate-y-1/2 font-mono text-[10px] font-semibold tracking-[0.04em] tabular-nums text-muted-foreground"
            style={{ top: i * ROW_PX }}
          >
            {String(h).padStart(2, "0")}
          </span>
        ))}
      </div>

      {/* 7 dag-kolonner */}
      {days.map((d, di) => {
        const dayEvents = events.filter((e) => e.dayIndex === di);
        const erIDag = nowDayIndex === di;
        return (
          <div
            key={di}
            className={cn(
              "relative border-r border-border last:border-r-0",
              d.weekend && "bg-foreground/[0.02]",
              erIDag && "bg-accent/[0.05]",
            )}
            style={{ height: BODY_PX }}
          >
            {/* Horisontale time-linjer (utelat top-kant, den deles med header) */}
            {HOURS.slice(1).map((h, i) => (
              <span
                key={h}
                className="pointer-events-none absolute inset-x-0 h-px bg-border/45"
                style={{ top: (i + 1) * ROW_PX }}
                aria-hidden
              />
            ))}

            {/* Now-line i dagens kolonne */}
            {erIDag && nowVisible && (
              <div
                className="pointer-events-none absolute inset-x-0 z-[4] h-0.5 bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.5)]"
                style={{ top: nowTop }}
                aria-hidden
              >
                <span className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-accent" />
              </div>
            )}

            {dayEvents.map((ev) => (
              <EventBlock key={ev.id} ev={ev} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Legende ─────────────────────────────────────────────────────
function Legend() {
  const item = (strokeClass: string, label: string) => (
    <span className="inline-flex items-center gap-2 text-[13px] text-foreground">
      <span className={cn("inline-block h-3 w-[3px] rounded-full", strokeClass)} aria-hidden />
      {label}
    </span>
  );
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 px-1">
      {item("bg-accent", "Lime = 1-til-1")}
      {item("bg-primary", "Forest = gruppe")}
      {item("bg-warning", "Cream-gull = live-økt")}
    </div>
  );
}

// ── Tomstate ────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <CalendarX2 className="h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
      <p className="mt-3 text-sm text-muted-foreground">Ingen timer denne uka.</p>
      <Link
        href="/admin/bookinger/ny"
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground transition-opacity hover:opacity-90"
      >
        <CalendarPlus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Book første time
      </Link>
    </div>
  );
}

// ── Topp-handling: Ny booking ───────────────────────────────────
function TopAction({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground transition-opacity hover:opacity-90"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      {label}
    </Link>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function WeekCalendar(props: WeekCalendarProps) {
  return (
    <div className="w-full px-6 py-6 lg:px-8">
      {/* H1-rad: tittel + toggle + Ny booking */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          Kalender
        </h1>
        <div className="flex items-center gap-3">
          <ViewToggle />
          <TopAction icon={CalendarPlus} label="Ny booking" href="/admin/bookinger/ny" />
        </div>
      </div>

      <NavRow
        weekNumber={props.weekNumber}
        rangeLabel={props.rangeLabel}
        prevWeekParam={props.prevWeekParam}
        nextWeekParam={props.nextWeekParam}
        todayParam={props.todayParam}
        isCurrentWeek={props.isCurrentWeek}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <DayHeaders days={props.days} />
        {props.bookingCount === 0 ? (
          <EmptyState />
        ) : (
          <WeekGridBody
            days={props.days}
            events={props.events}
            nowMinutes={props.nowMinutes}
            nowDayIndex={props.nowDayIndex}
          />
        )}
      </div>

      <Legend />
    </div>
  );
}
