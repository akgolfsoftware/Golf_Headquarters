"use client";

import { cn } from "@/lib/utils";

export type MonthDayCell = {
  date: Date;
  sessions?: number;
  load?: number;
  highlight?: "today" | "selected" | "rest" | "tournament";
  events?: { key: string; label: string; tone?: "primary" | "accent" | "muted" | "destructive" }[];
};

type MonthGridProps = {
  year: number;
  month: number;
  cells: MonthDayCell[];
  weekdayNames?: string[];
  monthName?: string;
  weekStartsOn?: 0 | 1;
  onDayClick?: (date: Date) => void;
  className?: string;
};

const defaultWeekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const eventTone: Record<NonNullable<NonNullable<MonthDayCell["events"]>[number]["tone"]>, string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

export function MonthGrid({
  year,
  month,
  cells,
  weekdayNames = defaultWeekdays,
  monthName,
  weekStartsOn = 1,
  onDayClick,
  className,
}: MonthGridProps) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const offsetRaw = firstOfMonth.getDay() - weekStartsOn;
  const offset = offsetRaw < 0 ? offsetRaw + 7 : offsetRaw;

  const cellsByDate = new Map<string, MonthDayCell>();
  cells.forEach((c) => cellsByDate.set(c.date.toDateString(), c));

  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-6", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">
          {monthName ?? `${defaultMonthName(month)} ${year}`}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {cells.reduce((acc, c) => acc + (c.sessions ?? 0), 0)} økter
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekdayNames.map((d) => (
          <div
            key={d}
            className="pb-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {Array.from({ length: totalCells }).map((_, idx) => {
          const dayNum = idx - offset + 1;
          const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
          const date = inMonth ? new Date(year, month - 1, dayNum) : null;
          const cell = date ? cellsByDate.get(date.toDateString()) : undefined;
          const isToday = cell?.highlight === "today";
          const isSelected = cell?.highlight === "selected";
          const isRest = cell?.highlight === "rest";

          return (
            <button
              key={idx}
              type="button"
              disabled={!inMonth}
              onClick={() => date && onDayClick?.(date)}
              className={cn(
                "relative aspect-square rounded-md border text-left transition disabled:cursor-default",
                inMonth ? "bg-background" : "bg-muted/40",
                isToday && "border-primary ring-1 ring-primary",
                isSelected && "border-accent bg-accent/15",
                isRest && "bg-muted/60",
                !isToday && !isSelected && "border-border hover:border-primary/50",
                "p-1.5",
              )}
            >
              {inMonth && (
                <>
                  <span
                    className={cn(
                      "font-mono text-[11px] font-semibold",
                      isToday ? "text-primary" : "text-foreground",
                    )}
                  >
                    {dayNum}
                  </span>
                  {cell?.events && cell.events.length > 0 && (
                    <span className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                      {cell.events.slice(0, 3).map((ev) => (
                        <span
                          key={ev.key}
                          className={cn(
                            "h-1 w-1 rounded-full",
                            eventTone[ev.tone ?? "primary"].split(" ")[0],
                          )}
                          title={ev.label}
                        />
                      ))}
                    </span>
                  )}
                  {typeof cell?.load === "number" && (
                    <span className="absolute right-1 top-1 font-mono text-[8px] text-muted-foreground">
                      {cell.load}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function defaultMonthName(m: number): string {
  return ["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"][m - 1];
}
