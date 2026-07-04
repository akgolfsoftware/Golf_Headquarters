"use client";

/**
 * BookingHubHybrid — hybrid design-port av /portal/booking.
 *
 * Design-kilde: [historisk fasit, fjernet 2026-07-03] prosjektgjennomgang-2026-06-17/
 *   prosjektgjennomgang-og-wireframing/project/PlayerHQ Booking (hybrid).dc.html
 *
 * Hybrid-mønster: editorial lyst øverst (hero + kalender), terminal data nedenfor
 * (mine bookinger). Kalender er klient-interaktiv (prev/next + dag-valg).
 * Dag-klikk navigerer til /portal/booking/ny?dato=YYYY-MM-DD.
 *
 * Props-drevet — ingen Prisma-import. Presentasjonell.
 * DS-tokens + lucide-ikoner. Ingen hardkodet hex, ingen emoji.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/athletic/golfdata";
import type { HubBooking, HubCredits, HubCoach } from "./booking-hub";

// ── Dag-namen (norsk, mandag-først) ──────────────────────────────
const DOW_LABELS = ["ma", "ti", "on", "to", "fr", "lø", "sø"];

// ── Hjelpefunksjoner ─────────────────────────────────────────────

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Mandag-basert ukedag (0=ma … 6=sø) */
function mondayDow(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString("nb-NO", { month: "long", year: "numeric" });
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatBookingTime(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("nb-NO", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    time: d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
  };
}

function formatDateSquare(iso: string): { day: string; mon: string } {
  const d = new Date(iso);
  return {
    day: String(d.getDate()),
    mon: d.toLocaleDateString("nb-NO", { month: "short" }).toUpperCase().replace(".", ""),
  };
}

function statusLabel(status: HubBooking["status"]): string {
  if (status === "CONFIRMED") return "Bekreftet";
  if (status === "PENDING") return "Avventer";
  if (status === "CANCELLED") return "Avbestilt";
  return "Gjennomført";
}

// ── Kalender-celle ───────────────────────────────────────────────

type CellState = "normal" | "today" | "selected" | "muted";

interface CalCell {
  date: Date | null; // null = tom celle (padding)
  n: number;
  state: CellState;
  hasBooking: boolean;
}

function buildCalCells(year: number, month: number, selectedDate: Date, bookingDates: Set<string>): CalCell[] {
  const today = startOfDay(new Date());
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const padStart = mondayDow(firstDay); // blank celler foran

  const cells: CalCell[] = [];

  // Padding celler
  for (let i = 0; i < padStart; i++) {
    cells.push({ date: null, n: 0, state: "muted", hasBooking: false });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const iso = toISODate(date);
    const isToday = toISODate(date) === toISODate(today);
    const isSel = toISODate(date) === toISODate(selectedDate);
    const isPast = date < today && !isToday;

    let state: CellState = "normal";
    if (isSel) state = "selected";
    else if (isToday) state = "today";
    else if (isPast) state = "muted";

    cells.push({
      date,
      n: d,
      state,
      hasBooking: bookingDates.has(iso),
    });
  }

  return cells;
}

// ── Eyebrow ──────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </div>
  );
}

// ── Kalender-komponent (klient-interaktiv) ───────────────────────

function MiniCalendar({
  selectedDate,
  bookingDates,
  onDaySelect,
}: {
  selectedDate: Date;
  bookingDates: Set<string>;
  onDaySelect: (date: Date) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const cells = buildCalCells(viewMonth.year, viewMonth.month, selectedDate, bookingDates);

  function prevMonth() {
    setViewMonth((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setViewMonth((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const monthTitle = monthLabel(new Date(viewMonth.year, viewMonth.month, 1));

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      {/* Navigasjonslinje */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-[14px] font-semibold capitalize text-foreground">
          {monthTitle}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={prevMonth}
            aria-label="Forrige måned"
            className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Neste måned"
            className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Ukedag-overskrifter */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DOW_LABELS.map((l) => (
          <div
            key={l}
            className="py-0.5 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            {l}
          </div>
        ))}
      </div>

      {/* Dag-grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell.date) {
            return <div key={`pad-${idx}`} />;
          }

          const isSelected = cell.state === "selected";
          const isToday = cell.state === "today";
          const isMuted = cell.state === "muted";

          return (
            <button
              key={toISODate(cell.date)}
              onClick={() => !isMuted && onDaySelect(cell.date!)}
              disabled={isMuted}
              aria-label={dayLabel(cell.date)}
              aria-pressed={isSelected}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-lg border font-mono text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected &&
                  "border-accent bg-accent text-primary",
                isToday &&
                  !isSelected &&
                  "border-primary bg-primary text-accent",
                !isSelected &&
                  !isToday &&
                  !isMuted &&
                  "border-border bg-card text-foreground hover:bg-secondary",
                isMuted && "cursor-default border-border bg-card text-muted-foreground/40",
              )}
            >
              {cell.n}
              {/* Prikk for dager med booking */}
              {cell.hasBooking && (
                <span
                  className={cn(
                    "absolute bottom-1 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full",
                    isSelected ? "bg-primary" : isToday ? "bg-accent" : "bg-primary",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Forklaring */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-[5px] w-[5px] rounded-full bg-primary" />
          Tilgjengelig
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-accent" />
          Valgt dag
        </span>
      </div>
    </div>
  );
}

// ── Valgt-dag-panel (tidsslot-liste: ledige + mine bookinger) ────

const SLOT_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function DayPanel({
  selectedDate,
  bookingsOnDay,
}: {
  selectedDate: Date;
  bookingsOnDay: HubBooking[];
}) {
  const router = useRouter();
  const iso = toISODate(selectedDate);

  const slots = SLOT_HOURS.map((h) => {
    const timeLabel = `${String(h).padStart(2, "0")}:00`;
    const booking = bookingsOnDay.find((b) => new Date(b.startIso).getHours() === h) ?? null;
    return { timeLabel, booking };
  });

  const ledigeCount = slots.filter((s) => !s.booking).length;

  return (
    <div>
      {/* Dag-header + ledige-teller */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="font-display text-[15px] font-semibold capitalize text-foreground">
          {dayLabel(selectedDate)}
        </div>
        <span className="rounded-full bg-success/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-success">
          {ledigeCount} ledige
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {slots.map(({ timeLabel, booking }) => {
          if (booking) {
            return (
              <Link
                key={timeLabel}
                href={`/portal/booking/${booking.id}`}
                className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0 transition-colors hover:bg-secondary/30"
              >
                <span className="w-10 shrink-0 font-mono text-[11px] font-semibold text-muted-foreground">
                  {timeLabel}
                </span>
                <div
                  className="min-w-0 flex-1 rounded-[8px] border border-accent/30 px-3 py-2"
                  style={{ background: "rgba(209,248,67,0.12)" }}
                >
                  <div className="font-sans text-[13px] font-semibold text-foreground">
                    {booking.serviceName}{" "}
                    <em className="font-normal not-italic text-primary">(din)</em>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {[booking.locationName, `${booking.durationMin} min`].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </Link>
            );
          }
          return (
            <div
              key={timeLabel}
              className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0"
            >
              <span className="w-10 shrink-0 font-mono text-[11px] font-semibold text-muted-foreground">
                {timeLabel}
              </span>
              <div className="min-w-0 flex-1 rounded-[8px] border border-dashed border-border bg-secondary/30 px-3 py-2">
                <div className="font-mono text-[10px] text-muted-foreground">Ledig</div>
              </div>
              <Button
                onClick={() => router.push(`/portal/booking/ny?dato=${iso}&tid=${timeLabel}`)}
                variant="signal"
                size="sm"
                className="shrink-0"
              >
                Book
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ── Mine bookinger-liste ─────────────────────────────────────────

function MineBookingerList({ bookings }: { bookings: HubBooking[] }) {
  const router = useRouter();

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center">
        <CalendarClock
          className="mx-auto h-7 w-7 text-muted-foreground/40"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="mt-3 font-sans text-[13.5px] text-muted-foreground">
          Du har ingen kommende bookinger.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {bookings.map((b) => {
        const { time } = formatBookingTime(b.startIso);
        const sq = formatDateSquare(b.startIso);
        const isConfirmed = b.status === "CONFIRMED";
        const isPending = b.status === "PENDING";

        return (
          <Card key={b.id} compact>
            <div className="flex items-center gap-3">
              {/* Dato-firkant */}
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-primary">
                <span className="font-mono text-[13px] font-bold leading-none text-accent">
                  {sq.day}
                </span>
                <span className="font-mono text-[7.5px] font-semibold text-accent/70">
                  {sq.mon}
                </span>
              </div>

              {/* Innhold */}
              <div className="min-w-0 flex-1">
                <div className="truncate font-sans text-[13.5px] font-semibold text-foreground">
                  {b.serviceName}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {[time, b.locationName, b.coachName].filter(Boolean).join(" · ")}
                </div>
              </div>

              {/* Status + avlys */}
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[9px] font-bold",
                    isConfirmed && "bg-success/10 text-success",
                    isPending && "bg-warning/10 text-warning",
                    !isConfirmed && !isPending && "bg-secondary text-muted-foreground",
                  )}
                >
                  {statusLabel(b.status)}
                </span>
                <button
                  onClick={() => router.push(`/portal/booking/${b.id}?action=avlys`)}
                  className="inline-flex items-center gap-0.5 font-mono text-[9px] font-semibold text-destructive/70 transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-2.5 w-2.5" strokeWidth={2} />
                  Avlys
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Eksportert hoved-komponent ───────────────────────────────────

export interface BookingHubHybridProps {
  userName: string;
  credits: HubCredits;
  upcoming: HubBooking[];
  past: HubBooking[];
  coaches: HubCoach[];
}

export function BookingHubHybrid({
  userName,
  upcoming,
}: BookingHubHybridProps) {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(today);

  // Set med ISO-datoer som har kommende bookinger
  const bookingDates = new Set<string>(
    upcoming.map((b) => toISODate(new Date(b.startIso))),
  );

  // Bookinger på valgt dag
  const bookingsOnDay = upcoming.filter(
    (b) => toISODate(new Date(b.startIso)) === toISODate(selectedDate),
  );

  const handleDaySelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <div className="golfdata-scope mx-auto max-w-[480px] space-y-6 px-4 py-6 pb-24">
      {/* ── 1. HEADER (eyebrow) ── */}
      <Eyebrow>
        <span
          className="h-1.5 w-1.5 rounded-full bg-primary"
          style={{ boxShadow: "0 0 0 3px hsl(var(--accent) / 0.7)" }}
        />
        Booking · {userName}
      </Eyebrow>

      {/* ── 2. HERO ── */}
      <section>
        <h1 className="font-display text-[28px] font-bold leading-[1.04] -tracking-[0.035em] text-foreground">
          Book{" "}
          <em className="font-normal italic text-primary">
            tid
          </em>
        </h1>
        <p className="mt-1 font-sans text-[13px] text-muted-foreground">
          Velg en dag, deretter ledige tider.
        </p>
      </section>

      {/* ── 3. MINI KALENDER ── */}
      <MiniCalendar
        selectedDate={selectedDate}
        bookingDates={bookingDates}
        onDaySelect={handleDaySelect}
      />

      {/* ── 4. VALGT DAG + SLOTS ── */}
      <DayPanel selectedDate={selectedDate} bookingsOnDay={bookingsOnDay} />

      {/* ── 5. MINE BOOKINGER ── */}
      <section>
        <div className="mb-3">
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Mine bookinger
          </div>
        </div>
        <MineBookingerList bookings={upcoming} />
      </section>
    </div>
  );
}
