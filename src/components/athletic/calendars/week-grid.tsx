"use client";

import { cn } from "@/lib/utils";

export type WeekEvent = {
  key: string;
  dayIndex: number;
  startHour: number;
  endHour: number;
  title: string;
  category?: string;
  tone?: "primary" | "accent" | "moss" | "destructive" | "muted";
};

type WeekGridProps = {
  weekStart: Date;
  startHour?: number;
  endHour?: number;
  events: WeekEvent[];
  hourHeight?: number;
  todayIndex?: number;
  weekdayNames?: string[];
  onSlotClick?: (dayIndex: number, hour: number) => void;
  className?: string;
};

const defaultWeekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const toneClass: Record<NonNullable<WeekEvent["tone"]>, string> = {
  primary: "bg-primary/95 text-primary-foreground border-primary",
  accent: "bg-accent text-accent-foreground border-accent",
  moss: "bg-emerald-700 text-white border-emerald-700",
  destructive: "bg-destructive/90 text-destructive-foreground border-destructive",
  muted: "bg-muted text-muted-foreground border-border",
};

export function WeekGrid({
  weekStart,
  startHour = 7,
  endHour = 20,
  events,
  hourHeight = 36,
  todayIndex,
  weekdayNames = defaultWeekdays,
  onSlotClick,
  className,
}: WeekGridProps) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      <div className="grid border-b border-border bg-muted/30" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
        <div className="border-r border-border py-2 text-center font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
          Uke {getWeek(weekStart)}
        </div>
        {dayDates.map((d, i) => (
          <div
            key={i}
            className={cn(
              "border-r border-border py-2 text-center last:border-r-0",
              todayIndex === i && "bg-primary/10",
            )}
          >
            <div
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.08em]",
                todayIndex === i ? "text-primary font-semibold" : "text-muted-foreground",
              )}
            >
              {weekdayNames[i]}
            </div>
            <div
              className={cn(
                "font-mono text-base font-semibold leading-none mt-0.5",
                todayIndex === i ? "text-primary" : "text-foreground",
              )}
            >
              {d.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
          {hours.map((h) => (
            <div key={h} className="contents">
              <div
                className="border-r border-t border-border text-right pr-1.5 font-mono text-[9px] text-muted-foreground"
                style={{ height: hourHeight, paddingTop: 4 }}
              >
                {String(h).padStart(2, "0")}
              </div>
              {Array.from({ length: 7 }).map((_, di) => (
                <button
                  key={di}
                  type="button"
                  onClick={() => onSlotClick?.(di, h)}
                  className={cn(
                    "border-r border-t border-border last:border-r-0 transition hover:bg-primary/5",
                    todayIndex === di && "bg-primary/5",
                  )}
                  style={{ height: hourHeight }}
                  aria-label={`${weekdayNames[di]} ${h}:00`}
                />
              ))}
            </div>
          ))}

          {events.map((ev) => {
            const top = (ev.startHour - startHour) * hourHeight;
            const height = Math.max(20, (ev.endHour - ev.startHour) * hourHeight - 2);
            const leftPct = 48 + ((ev.dayIndex) * (100 - 48 / 8)) / 7;
            return (
              <div
                key={ev.key}
                className={cn(
                  "absolute rounded-md border-l-[3px] px-1.5 py-1 text-[10px] font-medium shadow-sm overflow-hidden",
                  toneClass[ev.tone ?? "primary"],
                )}
                style={{
                  top,
                  height,
                  left: `calc(48px + (100% - 48px) * ${ev.dayIndex} / 7 + 2px)`,
                  width: `calc((100% - 48px) / 7 - 4px)`,
                }}
              >
                <div className="truncate font-semibold">{ev.title}</div>
                {ev.category && (
                  <div className="truncate font-mono text-[8px] uppercase tracking-[0.05em] opacity-70">
                    {ev.category}
                  </div>
                )}
                {/* avoid unused suppressor */}
                <span className="hidden">{leftPct}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
