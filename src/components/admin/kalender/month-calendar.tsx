/**
 * AgencyOS Kalender — måned-visning, lese-modus (/admin/kalender/maned).
 * Søsterkomponent til WeekCalendar (week-calendar.tsx) — samme DNA: vis-toggle,
 * nav-rad, lime-glød på i-dag, event-strek per type (lime=1:1 / forest=gruppe /
 * cream-gull=live), legende, tomstate.
 *
 * Server Component (ren presentasjon, ingen client-state). Data kommer fra
 * loadKalenderManed (src/lib/admin/kalender-maned-data.ts).
 *
 * 6-rad måneds-grid: 7 dag-kolonner × 6 uker. Hver dag-celle viser maks 3
 * event-piller + "+N til"-overflow. Dager utenfor måneden er dempet.
 *
 * Design-fasit: agencyos-app/screens-ops.jsx CalendarScreen (måned-tab).
 * Eyebrow "GJENNOMFØRE · KALENDER" + lead tekst + seg-toggle (Uke/Måned).
 * DS-tokens kun — ingen hardkodet hex, ingen emoji (kun lucide).
 */

import Link from "next/link";
import {
  CalendarPlus,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type MonthEventKind = "oneToOne" | "group" | "live";

export type MonthEvent = {
  id: string;
  /** ISO-dato YYYY-MM-DD (lokal). */
  dateKey: string;
  timeLabel: string;
  title: string;
  kind: MonthEventKind;
  isCompleted: boolean;
  href: string;
};

export type MonthDay = {
  dateKey: string;
  date: number;
  inMonth: boolean;
  weekend: boolean;
  isToday: boolean;
};

export type MonthCalendarProps = {
  monthLabel: string;
  prevMonthParam: string;
  nextMonthParam: string;
  todayParam: string;
  isCurrentMonth: boolean;
  /** 42 celler (6 uker × 7 dager), mandag-start. */
  days: MonthDay[];
  events: MonthEvent[];
  bookingCount: number;
};

// Fasit: enkeltbokstaver (screens-ops.jsx CalendarScreen måned-view: ["M","T","O","T","F","L","S"])
const DOW = ["M", "T", "O", "T", "F", "L", "S"];

// ── Event-strek per type (matcher week-calendar) ────────────────
const kindStroke: Record<MonthEventKind, string> = {
  oneToOne: "border-l-accent",
  group: "border-l-primary",
  live: "border-l-warning",
};

const kindBg: Record<MonthEventKind, string> = {
  oneToOne: "bg-accent/[0.12]",
  group: "bg-primary/[0.08]",
  live: "bg-background",
};

// ── Vis-toggle (Uke / Måned aktiv) — fasit: .seg-stil fra agency.css ─────────
// Design: ["uke", "måned"] (2 tabs, ingen "Liste"). Matcher hub-sidens seg-toggle.
function ViewToggle() {
  return (
    <div className="mb-[14px] inline-flex gap-[2px] rounded-lg bg-secondary p-[3px]">
      <Link
        href="/admin/kalender"
        className="inline-flex h-[26px] items-center rounded-md px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Uke
      </Link>
      <span
        aria-current="page"
        className="inline-flex h-[26px] items-center rounded-md bg-card px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-foreground shadow-sm"
      >
        Måned
      </span>
    </div>
  );
}

// ── Nav-rad: ‹ Måned › + I dag ──────────────────────────────────
function NavRow({
  monthLabel,
  prevMonthParam,
  nextMonthParam,
  todayParam,
  isCurrentMonth,
}: Pick<
  MonthCalendarProps,
  "monthLabel" | "prevMonthParam" | "nextMonthParam" | "todayParam" | "isCurrentMonth"
>) {
  const navBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary";
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/kalender/maned?mnd=${prevMonthParam}`}
          className={navBtn}
          aria-label="Forrige måned"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
        <div className="font-display text-xl font-bold capitalize leading-none tracking-[-0.015em] text-foreground">
          {monthLabel}
        </div>
        <Link
          href={`/admin/kalender/maned?mnd=${nextMonthParam}`}
          className={navBtn}
          aria-label="Neste måned"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      </div>
      <Link
        href={`/admin/kalender/maned?mnd=${todayParam}`}
        className={cn(
          "inline-flex h-8 items-center rounded-lg border px-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] transition-colors",
          isCurrentMonth
            ? "border-border bg-secondary text-muted-foreground"
            : "border-primary bg-card text-primary hover:bg-primary hover:text-accent",
        )}
        aria-disabled={isCurrentMonth}
      >
        I dag
      </Link>
    </div>
  );
}

// ── Dag-header-rad ──────────────────────────────────────────────
function DayHeaders() {
  return (
    <div className="grid grid-cols-7 border-b border-border bg-card">
      {DOW.map((d, i) => (
        <div
          key={i}
          className={cn(
            "border-r border-border px-3 py-2.5 last:border-r-0",
            i >= 5 && "bg-foreground/[0.02]",
          )}
        >
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {d}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Event-pille i dag-celle ─────────────────────────────────────
function EventPill({ ev }: { ev: MonthEvent }) {
  return (
    <Link
      href={ev.href}
      className={cn(
        "flex items-center gap-1.5 overflow-hidden rounded border border-border border-l-[3px] px-1.5 py-0.5 transition-shadow hover:shadow-[0_2px_8px_hsl(var(--foreground)/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        kindStroke[ev.kind],
        kindBg[ev.kind],
        ev.isCompleted && "opacity-60",
      )}
    >
      <span className="font-mono text-[9px] font-bold leading-none tabular-nums text-foreground">
        {ev.timeLabel}
      </span>
      <span className="truncate text-[10px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
        {ev.title}
      </span>
    </Link>
  );
}

// ── Måned-grid ──────────────────────────────────────────────────
function MonthGrid({ days, events }: Pick<MonthCalendarProps, "days" | "events">) {
  // Grupper events per dato-nøkkel.
  const byDay = new Map<string, MonthEvent[]>();
  for (const ev of events) {
    const arr = byDay.get(ev.dateKey);
    if (arr) arr.push(ev);
    else byDay.set(ev.dateKey, [ev]);
  }

  return (
    <div className="grid grid-cols-7">
      {days.map((d, i) => {
        const dayEvents = byDay.get(d.dateKey) ?? [];
        const visible = dayEvents.slice(0, 3);
        const overflow = dayEvents.length - visible.length;
        const lastRow = i >= 35;
        return (
          <div
            key={d.dateKey}
            className={cn(
              // fasit: minHeight 60px per dag-celle — app bruker 80px for å gi plass til event-piller
              "flex min-h-[80px] flex-col gap-1 border-b border-r border-border p-1.5 last:border-r-0",
              (i + 1) % 7 === 0 && "border-r-0",
              lastRow && "border-b-0",
              d.weekend && d.inMonth && "bg-foreground/[0.02]",
              !d.inMonth && "bg-secondary/30",
              d.isToday && "bg-accent/[0.05]",
            )}
          >
            <div className="flex items-center justify-between px-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-mono text-[11px] font-bold leading-none tabular-nums",
                  d.isToday
                    ? "text-primary"
                    : !d.inMonth
                      ? "text-muted-foreground/50"
                      : d.weekend
                        ? "text-muted-foreground"
                        : "text-foreground",
                )}
              >
                {d.date}
                {d.isToday && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
                )}
              </span>
              {dayEvents.length > 0 && (
                <span className="font-mono text-[9px] font-semibold tabular-nums text-muted-foreground">
                  {dayEvents.length}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
              {visible.map((ev) => (
                <EventPill key={ev.id} ev={ev} />
              ))}
              {overflow > 0 && (
                <span className="mt-auto px-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  +{overflow} til
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Legende (matcher week-calendar) ─────────────────────────────
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
      <p className="mt-3 text-sm text-muted-foreground">Ingen timer denne måneden.</p>
      <Link
        href="/admin/bookinger/ny"
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-opacity hover:opacity-90"
      >
        <CalendarPlus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Book første time
      </Link>
    </div>
  );
}

// ── Topp-handling (fasit: btn btn-primary, action-knapp i PageHead) ────────────
function TopAction({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent transition-opacity hover:opacity-90"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      {label}
    </Link>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
// Fasit: CalendarScreen i agencyos-app/screens-ops.jsx med PageHead:
//   eyebrow "GJENNOMFØRE · KALENDER" + title + italic + lead + action "Ny økt"
export function MonthCalendar(props: MonthCalendarProps) {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-6 lg:px-8">
      {/* PageHead — fasit: .page-head med eyebrow + h1 + lead + actions */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground">
            Gjennomføre · Kalender
          </div>
          <h1 className="mt-2 font-display text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
            {props.monthLabel.split(" ")[0]}{" "}
            <em className="font-normal italic text-primary">
              · {props.monthLabel.split(" ")[1] ?? ""}
            </em>
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-normal text-muted-foreground">
            Alle øktene dine på tvers av stallen. Lime kant = pågår nå.
          </p>
        </div>
        {/* Primærhandling: Ny økt → Workbench (fasit: btn btn-primary → workbench) */}
        <div className="flex shrink-0 gap-2">
          <TopAction icon={Plus} label="Ny økt" href="/admin/coach-workbench" />
        </div>
      </div>

      {/* Seg-toggle (Uke / Måned aktiv) — fasit: .seg med 2 tabs */}
      <ViewToggle />

      <NavRow
        monthLabel={props.monthLabel}
        prevMonthParam={props.prevMonthParam}
        nextMonthParam={props.nextMonthParam}
        todayParam={props.todayParam}
        isCurrentMonth={props.isCurrentMonth}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <DayHeaders />
        {props.bookingCount === 0 ? (
          <EmptyState />
        ) : (
          <MonthGrid days={props.days} events={props.events} />
        )}
      </div>

      <Legend />
    </div>
  );
}
