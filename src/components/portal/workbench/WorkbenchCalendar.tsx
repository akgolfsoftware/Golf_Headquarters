"use client";

import { useMemo } from "react";
import { CalendarDays, LayoutTemplate, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionCard } from "./SessionCard";
import type {
  CalendarDay,
  CalendarEvent,
  WorkbenchSession,
  WorkbenchView,
} from "./types";

type WorkbenchCalendarProps = {
  view: WorkbenchView;
  sessions: WorkbenchSession[];
  selectedId: string | null;
  onSelectSession: (session: WorkbenchSession) => void;
  onDropSession?: (sessionId: string, dateIso: string) => void;
  onDropStandardSession?: (malId: string, dateIso: string) => void;
  weekStart: string;
};

const DOW = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
const MND_SHORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const HOURS = Array.from({ length: 16 }, (_, i) => 6 + i);
const ROW_H = 48;
const GRID_H = ROW_H * (HOURS.length - 1);

export function WorkbenchCalendar({
  view,
  sessions,
  selectedId,
  onSelectSession,
  onDropSession,
  onDropStandardSession,
  weekStart,
}: WorkbenchCalendarProps) {
  const days = useMemo<CalendarDay[]>(() => {
    const start = new Date(weekStart);
    const today = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      return {
        dow: DOW[i],
        date: String(d.getDate()),
        today: isToday,
        sub: i === 0 ? MND_SHORT[d.getMonth()] : "",
        events: sessions
          .filter((s) => {
            const sd = new Date(s.scheduledAt);
            return sd.getDay() === ((i + 1) % 7);
          })
          .map((s) => sessionToEvent(s, i)),
      };
    });
  }, [sessions, weekStart]);

  if (view === "day") {
    const todayDay = days.find((d) => d.today) ?? days[2];
    return <DayView day={todayDay} selectedId={selectedId} onSelectSession={onSelectSession} />;
  }

  if (view === "list") {
    return <ListView sessions={sessions} selectedId={selectedId} onSelectSession={onSelectSession} />;
  }

  if (view === "kanban" || view === "dashboard") {
    const Icon = view === "kanban" ? LayoutTemplate : CalendarDays;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <span className="mb-1 grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="font-display text-lg font-bold text-foreground">
          {view === "kanban" ? "Kanban" : "Dashboard"}
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Denne visningen er under utvikling. Bruk Uke- eller Liste-visningen for full oversikt.
        </p>
      </div>
    );
  }

  return (
    <WeekView
      days={days}
      selectedId={selectedId}
      onSelectSession={onSelectSession}
      onDropSession={onDropSession}
      onDropStandardSession={onDropStandardSession}
    />
  );
}

// ───────── Week view ─────────
function WeekView({
  days,
  selectedId,
  onSelectSession,
  onDropSession,
  onDropStandardSession,
}: {
  days: CalendarDay[];
  selectedId: string | null;
  onSelectSession: (session: WorkbenchSession) => void;
  onDropSession?: (sessionId: string, dateIso: string) => void;
  onDropStandardSession?: (malId: string, dateIso: string) => void;
}) {
  return (
    <section className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="grid shrink-0 grid-cols-[56px_repeat(5,1fr)] border-b border-border bg-card">
        <div className="h-12" />
        {days.map((d) => (
          <div key={d.dow} className="flex flex-col items-center justify-center py-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {d.dow}
            </span>
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold",
                d.today ? "bg-primary text-primary-foreground" : "text-foreground",
              )}
            >
              {d.date}
            </span>
            {d.sub && <span className="text-[9px] text-muted-foreground">{d.sub}</span>}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="grid grid-cols-[56px_repeat(5,1fr)]" style={{ height: `${GRID_H}px` }}>
          {/* Time gutter */}
          <div className="relative border-r border-border bg-card">
            {HOURS.map((h, i) => (
              <div key={h} className="absolute w-full text-right pr-2" style={{ top: `${i * ROW_H}px` }}>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(h).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, idx) => (
            <DayColumn
              key={day.dow}
              day={day}
              dayIndex={idx}
              selectedId={selectedId}
              onSelectSession={onSelectSession}
              onDropSession={onDropSession}
              onDropStandardSession={onDropStandardSession}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DayColumn({
  day,
  dayIndex,
  selectedId,
  onSelectSession,
  onDropSession,
  onDropStandardSession,
}: {
  day: CalendarDay;
  dayIndex: number;
  selectedId: string | null;
  onSelectSession: (session: WorkbenchSession) => void;
  onDropSession?: (sessionId: string, dateIso: string) => void;
  onDropStandardSession?: (malId: string, dateIso: string) => void;
}) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData("sessionId");
    const malId = e.dataTransfer.getData("standardSessionId");
    const start = new Date();
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + dayIndex);
    start.setHours(12, 0, 0, 0);
    const dateIso = start.toISOString();
    if (sessionId && onDropSession) {
      onDropSession(sessionId, dateIso);
    } else if (malId && onDropStandardSession) {
      onDropStandardSession(malId, dateIso);
    }
  };

  return (
    <div
      className={cn(
        "relative border-r border-border last:border-r-0",
        day.today && "bg-primary/[0.03]",
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {HOURS.slice(1).map((_, i) => (
        <div
          key={i}
          className="absolute inset-x-0 border-b border-border/60"
          style={{ top: `${(i + 1) * ROW_H}px` }}
        />
      ))}
      {day.events.map((ev) => (
        <SessionCard
          key={ev.id}
          event={ev}
          selected={selectedId === ev.id}
          onClick={onSelectSession}
        />
      ))}
    </div>
  );
}

// ───────── Day view ─────────
function DayView({
  day,
  selectedId,
  onSelectSession,
}: {
  day: CalendarDay;
  selectedId: string | null;
  onSelectSession: (session: WorkbenchSession) => void;
}) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {day.dow} {day.date}. {day.sub}
        </div>
        <div className="mt-1 font-display text-xl font-bold text-foreground">
          {day.events.length} økter
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {day.events.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <span className="mb-1 grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
              <ListTodo className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </span>
            <div className="font-display text-base font-bold text-foreground">Ingen økter</div>
            <p className="text-sm text-muted-foreground">Det er ingen planlagte økter denne dagen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {day.events.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => onSelectSession(ev.session)}
                className={cn(
                  "w-full rounded-xl border border-border border-l-4 bg-card p-4 text-left transition hover:bg-secondary/30",
                  selectedId === ev.id && "ring-2 ring-primary ring-offset-1",
                  ev.pyramidArea === "FYS" && "border-l-[var(--pyr-fys)]",
                  ev.pyramidArea === "TEK" && "border-l-[var(--pyr-tek)]",
                  ev.pyramidArea === "SLAG" && "border-l-[var(--pyr-slag)]",
                  ev.pyramidArea === "SPILL" && "border-l-[var(--pyr-spill)]",
                  ev.pyramidArea === "TURN" && "border-l-[var(--pyr-turn)]",
                )}
              >
                <div className="font-mono text-xs font-semibold text-muted-foreground">
                  {String(ev.hour).padStart(2, "0")}:{String(ev.minute).padStart(2, "0")} ·{" "}
                  {ev.durationMin} min
                </div>
                <div className="mt-1 font-display text-base font-bold text-foreground">
                  {ev.title}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {ev.environment} {ev.drillCount > 0 && `· ${ev.drillCount} drills`}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ───────── List view ─────────
function ListView({
  sessions,
  selectedId,
  onSelectSession,
}: {
  sessions: WorkbenchSession[];
  selectedId: string | null;
  onSelectSession: (session: WorkbenchSession) => void;
}) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <span className="mb-1 grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
          <ListTodo className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="font-display text-lg font-bold text-foreground">Ingen økter</div>
        <p className="text-sm text-muted-foreground">Det er ingen planlagte økter i denne perioden.</p>
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <div className="font-display text-lg font-bold text-foreground">Kommende økter</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {sorted.map((s) => {
            const d = new Date(s.scheduledAt);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSession(s)}
                className={cn(
                  "w-full rounded-xl border border-border border-l-4 bg-card p-4 text-left transition hover:bg-secondary/30",
                  selectedId === s.id && "ring-2 ring-primary ring-offset-1",
                  s.pyramidArea === "FYS" && "border-l-[var(--pyr-fys)]",
                  s.pyramidArea === "TEK" && "border-l-[var(--pyr-tek)]",
                  s.pyramidArea === "SLAG" && "border-l-[var(--pyr-slag)]",
                  s.pyramidArea === "SPILL" && "border-l-[var(--pyr-spill)]",
                  s.pyramidArea === "TURN" && "border-l-[var(--pyr-turn)]",
                )}
              >
                <div className="font-mono text-xs font-semibold text-muted-foreground">
                  {DOW[(d.getDay() + 6) % 7]} {d.getDate()}. {MND_SHORT[d.getMonth()]} ·{" "}
                  {String(d.getHours()).padStart(2, "0")}:{String(d.getMinutes()).padStart(2, "0")}
                </div>
                <div className="mt-1 font-display text-base font-bold text-foreground">{s.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {s.durationMin} min{s.environment && ` · ${s.environment}`}
                  {s.drillCount > 0 && ` · ${s.drillCount} drills`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ───────── Helpers ─────────
function sessionToEvent(session: WorkbenchSession, dayIndex: number): CalendarEvent {
  const d = new Date(session.scheduledAt);
  return {
    id: session.id,
    dayIndex,
    hour: d.getHours(),
    minute: d.getMinutes(),
    durationMin: session.durationMin,
    title: session.title,
    pyramidArea: session.pyramidArea,
    environment: session.environment,
    drillCount: session.drillCount,
    status: session.status,
    session,
  };
}
