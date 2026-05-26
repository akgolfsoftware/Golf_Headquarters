/**
 * CalendarDayView — dag-timeline for /admin/calendar?view=day.
 * Speilet etter wireframe/design-package/project/04-dagsplan.html.
 *
 * Server-rendret. Mottar ferdig-beregnede events og rendrer
 * absolute-positioned blokker over time-grid 06–22.
 */

import { Clock, MapPin, Users } from "lucide-react";

const TIMES = [
  "06", "07", "08", "09", "10", "11", "12", "13",
  "14", "15", "16", "17", "18", "19", "20", "21", "22",
];
const SLOT_PX = 64;
const GRID_START_HOUR = 6;

export type DayEv = {
  startHour: number; // f.eks. 9.5 for 09:30
  endHour: number;
  title: string;
  type: string; // serviceType-navn
  location: string;
  kind: "booking" | "group";
};

function topFor(h: number): number {
  return (h - GRID_START_HOUR) * SLOT_PX;
}

function heightFor(s: number, e: number): number {
  return Math.max(48, (e - s) * SLOT_PX);
}

function fmtHour(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function CalendarDayView({
  events,
  dato,
  nowHour,
  erIdag,
}: {
  events: DayEv[];
  dato: Date;
  nowHour: number;
  erIdag: boolean;
}) {
  const dagFormat = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dato);

  const totalHeight = TIMES.length * SLOT_PX;
  const visNowLine =
    erIdag && nowHour >= GRID_START_HOUR && nowHour <= GRID_START_HOUR + TIMES.length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_304px]">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              <em className="font-normal italic">{capitalize(dagFormat)}</em>
            </h2>
            <div className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              {events.length} {events.length === 1 ? "økt" : "økter"} planlagt
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-[70px_1fr]" style={{ height: totalHeight }}>
          {/* Time-rail */}
          <div className="border-r border-border">
            {TIMES.map((t) => (
              <div
                key={t}
                className="border-b border-border/60 px-4 py-1.5 text-right font-mono text-[11px] text-muted-foreground"
                style={{ height: SLOT_PX }}
              >
                {t}:00
              </div>
            ))}
          </div>

          {/* Events lane */}
          <div className="relative">
            {TIMES.map((t) => (
              <div
                key={t}
                className="border-b border-border/40"
                style={{ height: SLOT_PX }}
              />
            ))}

            {events.map((ev, i) => {
              const sH = Math.max(ev.startHour, GRID_START_HOUR);
              const eH = Math.min(ev.endHour, GRID_START_HOUR + TIMES.length);
              if (eH <= sH) return null;
              const top = topFor(sH);
              const height = heightFor(sH, eH);
              const isGroup = ev.kind === "group";
              return (
                <div
                  key={i}
                  className={
                    isGroup
                      ? "absolute left-4 right-4 overflow-hidden rounded-md border border-primary/30 bg-primary/10 p-4 text-foreground shadow-sm"
                      : "absolute left-4 right-4 overflow-hidden rounded-md border border-accent/40 bg-accent/15 p-4 text-foreground shadow-sm"
                  }
                  style={{ top, height }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
                        {fmtHour(ev.startHour)} – {fmtHour(ev.endHour)}
                      </div>
                      <div className="mt-1 truncate font-display text-base font-semibold tracking-tight">
                        {ev.title}
                      </div>
                      <div className="mt-1 flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" strokeWidth={1.75} />
                          {ev.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          {isGroup ? (
                            <Users className="h-3 w-3" strokeWidth={1.75} />
                          ) : (
                            <Clock className="h-3 w-3" strokeWidth={1.75} />
                          )}
                          {ev.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Nå-linje */}
            {visNowLine && (
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 z-10 h-px bg-accent shadow-[0_0_8px_rgba(209,248,67,0.6)]"
                style={{ top: topFor(nowHour) }}
              >
                <span className="absolute -left-16 -top-2 rounded-sm border border-accent bg-foreground px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-accent">
                  Nå
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar — summer for dagen */}
      <aside className="sticky top-6 hidden flex-col gap-4 lg:flex">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Sammendrag
          </div>
          <SummRow
            label="Bookinger"
            value={events.filter((e) => e.kind === "booking").length}
          />
          <SummRow
            label="Gruppe-økter"
            value={events.filter((e) => e.kind === "group").length}
          />
          <SummRow label="Totalt" value={events.length} />
        </div>
      </aside>
    </div>
  );
}

function SummRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between border-t border-border/60 py-2 text-[13px] first:border-t-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium tabular-nums">{value}</span>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
