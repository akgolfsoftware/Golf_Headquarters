"use client";

/**
 * WorkbenchMobile — år/måned/uke/dag kalendervisning for coach-Workbench på mobil.
 * Rendres UNDER md-breakpoint i /admin/spillere/[id]/workbench.
 */

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  getISOWeek,
  getYear,
} from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type MobileSession = {
  id: string;
  scheduledAt: string; // ISO string (Prisma Date → JSON)
  title: string;
  pyramidArea: string; // FYS | TEK | SLAG | SPILL | TURN
  status: string; // PLANNED | COMPLETED | ABANDONED
  durationMin: number;
};

type ParsedSession = MobileSession & { date: Date };
type View = "aar" | "maned" | "uke" | "dag";

const DOW_SHORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const PYR_BAR: Record<string, string> = {
  FYS: "bg-pyr-fys",
  TEK: "bg-pyr-tek",
  SLAG: "bg-pyr-slag",
  SPILL: "bg-pyr-spill",
  TURN: "bg-pyr-turn",
};

function dowIndex(d: Date): number {
  return d.getDay() === 0 ? 6 : d.getDay() - 1;
}

export function WorkbenchMobile({
  sessions,
  playerName,
  playerId,
}: {
  sessions: MobileSession[];
  playerName: string;
  playerId: string;
}) {
  const today = new Date();
  const [view, setView] = useState<View>("uke");
  const [cursor, setCursor] = useState<Date>(today);

  const parsed = useMemo<ParsedSession[]>(
    () => sessions.map((s) => ({ ...s, date: new Date(s.scheduledAt) })),
    [sessions],
  );

  const views: { key: View; label: string }[] = [
    { key: "aar", label: "År" },
    { key: "maned", label: "Mnd" },
    { key: "uke", label: "Uke" },
    { key: "dag", label: "Dag" },
  ];

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background px-4 py-2.5">
        <span className="mr-auto font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Workbench · {playerName.split(" ")[0]}
        </span>
        <span className="inline-flex gap-[2px] rounded-lg bg-secondary p-[3px]">
          {views.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={cn(
                "inline-flex h-[26px] items-center rounded-md px-[10px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors",
                view === key
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </span>
      </div>

      <div className="px-4 pb-12 pt-4">
        {view === "aar" && (
          <YearView
            sessions={parsed}
            cursor={cursor}
            onSelectMonth={(d) => { setCursor(d); setView("maned"); }}
          />
        )}
        {view === "maned" && (
          <MonthView
            sessions={parsed}
            cursor={cursor}
            onNav={setCursor}
            onSelectDay={(d) => { setCursor(d); setView("dag"); }}
          />
        )}
        {view === "uke" && (
          <WeekView
            sessions={parsed}
            cursor={cursor}
            onNav={setCursor}
            onSelectDay={(d) => { setCursor(d); setView("dag"); }}
          />
        )}
        {view === "dag" && (
          <DayView sessions={parsed} cursor={cursor} onNav={setCursor} playerId={playerId} />
        )}
      </div>
    </div>
  );
}

function NavRow({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        type="button"
        onClick={onPrev}
        className="flex h-9 w-9 items-center justify-center rounded-[8px] hover:bg-secondary active:bg-secondary"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={onNext}
        className="flex h-9 w-9 items-center justify-center rounded-[8px] hover:bg-secondary active:bg-secondary"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function YearView({
  sessions,
  cursor,
  onSelectMonth,
}: {
  sessions: ParsedSession[];
  cursor: Date;
  onSelectMonth: (d: Date) => void;
}) {
  const year = getYear(cursor);
  const months = eachMonthOfInterval({
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 0, 1)),
  });

  return (
    <>
      <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {year}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((m) => {
          const ms = sessions.filter((s) => isSameMonth(s.date, m));
          const isCurrent = isSameMonth(m, new Date());
          const areas = Array.from(new Set(ms.map((s) => s.pyramidArea)));
          return (
            <button
              key={m.toISOString()}
              type="button"
              onClick={() => onSelectMonth(m)}
              className={cn(
                "flex flex-col items-start rounded-[10px] border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-secondary active:bg-secondary",
                isCurrent && "ring-1 ring-inset ring-accent",
              )}
            >
              <span className={cn("font-mono text-[9px] font-bold uppercase tracking-[0.07em]",
                isCurrent ? "text-accent" : "text-muted-foreground")}>
                {format(m, "MMM", { locale: nb })}
              </span>
              <span className="mt-1 font-mono text-[22px] font-extrabold leading-none text-foreground">
                {ms.length}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground">
                {ms.length === 1 ? "økt" : "økter"}
              </span>
              {areas.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-[3px]">
                  {areas.map((pa) => (
                    <span key={pa} className={cn("h-[5px] w-[5px] rounded-full", PYR_BAR[pa] ?? "bg-muted")} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

function MonthView({
  sessions,
  cursor,
  onNav,
  onSelectDay,
}: {
  sessions: ParsedSession[];
  cursor: Date;
  onNav: (d: Date) => void;
  onSelectDay: (d: Date) => void;
}) {
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const monthSessions = sessions
    .filter((s) => isSameMonth(s.date, cursor))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <>
      <NavRow
        label={format(cursor, "MMMM yyyy", { locale: nb })}
        onPrev={() => onNav(subMonths(cursor, 1))}
        onNext={() => onNav(addMonths(cursor, 1))}
      />

      <div className="mb-1 grid grid-cols-7 gap-px">
        {DOW_SHORT.map((d) => (
          <div key={d} className="py-1 text-center font-mono text-[9px] font-bold uppercase text-muted-foreground">
            {d.charAt(0)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {days.map((d) => {
          const ds = sessions.filter((s) => isSameDay(s.date, d));
          const inMonth = isSameMonth(d, cursor);
          const todayDay = isToday(d);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelectDay(d)}
              className={cn(
                "flex min-h-[44px] flex-col items-center rounded-[6px] py-1.5 transition-colors",
                inMonth ? "hover:bg-secondary active:bg-secondary" : "pointer-events-none opacity-25",
                todayDay && "bg-secondary ring-1 ring-inset ring-accent",
              )}
            >
              <span className={cn("font-mono text-[12px] font-bold leading-none",
                todayDay ? "text-accent" : "text-foreground")}>
                {format(d, "d")}
              </span>
              {ds.length > 0 && (
                <div className="mt-1 flex flex-wrap justify-center gap-[2px]">
                  {ds.slice(0, 3).map((s, i) => (
                    <span key={i} className={cn("h-[4px] w-[4px] rounded-full", PYR_BAR[s.pyramidArea] ?? "bg-muted")} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Alle økter · {monthSessions.length}
        </div>
        {monthSessions.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Ingen planlagte økter denne måneden.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {monthSessions.map((s) => <SessionCard key={s.id} session={s} showDate />)}
          </div>
        )}
      </div>
    </>
  );
}

function WeekView({
  sessions,
  cursor,
  onNav,
  onSelectDay,
}: {
  sessions: ParsedSession[];
  cursor: Date;
  onNav: (d: Date) => void;
  onSelectDay: (d: Date) => void;
}) {
  const weekStart = startOfWeek(cursor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekNum = getISOWeek(cursor);

  return (
    <>
      <NavRow
        label={`Uke ${weekNum} · ${format(weekStart, "d. MMM", { locale: nb })} – ${format(weekEnd, "d. MMM", { locale: nb })}`}
        onPrev={() => onNav(subWeeks(cursor, 1))}
        onNext={() => onNav(addWeeks(cursor, 1))}
      />

      <div className="flex flex-col gap-4">
        {days.map((d) => {
          const ds = sessions
            .filter((s) => isSameDay(s.date, d))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
          const todayDay = isToday(d);
          const dow = DOW_SHORT[dowIndex(d)];
          return (
            <div key={d.toISOString()}>
              <button
                type="button"
                onClick={() => onSelectDay(d)}
                className="mb-2 flex w-full items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground"
              >
                <span className="flex items-center gap-2">
                  {dow} {format(d, "d. MMM", { locale: nb })}
                  {todayDay && (
                    <span className="rounded-[4px] bg-accent px-[6px] py-[1px] font-mono text-[9px] font-bold text-accent-foreground">
                      I dag
                    </span>
                  )}
                </span>
                <span className="h-px flex-1 bg-border" />
              </button>
              {ds.length === 0 ? (
                <p className="px-1 text-[12px] text-muted-foreground">Ingen økter.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {ds.map((s) => <SessionCard key={s.id} session={s} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function DayView({
  sessions,
  cursor,
  onNav,
  playerId,
}: {
  sessions: ParsedSession[];
  cursor: Date;
  onNav: (d: Date) => void;
  playerId: string;
}) {
  const ds = sessions
    .filter((s) => isSameDay(s.date, cursor))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const todayDay = isToday(cursor);
  const dow = DOW_SHORT[dowIndex(cursor)];

  return (
    <>
      <NavRow
        label={`${dow} ${format(cursor, "d. MMMM yyyy", { locale: nb })}`}
        onPrev={() => onNav(subDays(cursor, 1))}
        onNext={() => onNav(addDays(cursor, 1))}
      />

      {todayDay && (
        <div className="mb-3 inline-flex items-center rounded-[6px] bg-accent px-[8px] py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-accent-foreground">
          I dag
        </div>
      )}

      {ds.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <div>
            <p className="text-[13px] font-semibold text-foreground">Ingen planlagte økter</p>
            <p className="mt-1 text-[12px] text-muted-foreground">Bruk desktop-Workbench for å legge til.</p>
          </div>
          <Link href={`/admin/spillere/${playerId}/workbench`}
            className="text-[12px] font-semibold text-primary hover:underline">
            Åpne Workbench →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ds.map((s) => <SessionCard key={s.id} session={s} expanded />)}
        </div>
      )}
    </>
  );
}

function SessionCard({
  session,
  expanded = false,
  showDate = false,
}: {
  session: ParsedSession;
  expanded?: boolean;
  showDate?: boolean;
}) {
  const isDone = session.status === "COMPLETED";
  const isAbandoned = session.status === "ABANDONED";

  return (
    <div
      className={cn(
        "relative flex items-center overflow-hidden rounded-[10px] border border-border bg-card px-4 py-3",
        isDone && "opacity-60",
      )}
    >
      <div className={cn("absolute left-0 top-0 h-full w-[3px]", PYR_BAR[session.pyramidArea] ?? "bg-muted")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-[13px] font-semibold leading-[1.25] text-foreground">
            {session.title}
          </span>
          {isDone && (
            <span className="shrink-0 rounded-[4px] bg-[var(--color-chip-ok-bg)] px-[6px] py-[2px] font-mono text-[9px] font-bold uppercase text-[var(--color-chip-ok-fg)]">
              Fullført
            </span>
          )}
          {isAbandoned && (
            <span className="shrink-0 rounded-[4px] bg-[var(--color-chip-warn-bg)] px-[6px] py-[2px] font-mono text-[9px] font-bold uppercase text-[var(--color-chip-warn-fg)]">
              Avbrutt
            </span>
          )}
        </div>
        <div className="mt-[3px] flex flex-wrap items-center gap-[6px]">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {session.pyramidArea}
          </span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="font-mono text-[10px] text-muted-foreground">{session.durationMin} min</span>
          {(expanded || showDate) && (
            <>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {format(session.date, "d. MMM", { locale: nb })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
