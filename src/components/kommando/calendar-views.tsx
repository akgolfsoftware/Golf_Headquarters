"use client";

// Kalender-visning for Kommando. Tar ferdig-bygde celler/hendelser fra serveren
// og veksler mellom måned (alle hendelser) og uke (tidssatte bookinger).

import { useState } from "react";
import { cn } from "@/lib/utils";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import {
  MonthGrid,
  WeekGrid,
  type MonthDayCell,
  type WeekEvent,
} from "@/components/athletic/calendars";

type View = "month" | "week";

export function CalendarViews({
  year,
  month,
  monthName,
  monthCells,
  weekStart,
  weekEvents,
  todayIndex,
}: {
  year: number;
  month: number;
  monthName: string;
  monthCells: MonthDayCell[];
  weekStart: Date;
  weekEvents: WeekEvent[];
  todayIndex?: number;
}) {
  const [view, setView] = useState<View>("month");

  return (
    <div>
      <div className="mb-4 flex gap-1.5">
        {(["month", "week"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.05em] transition-colors",
              view === v
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {v === "month" ? "Måned" : "Uke"}
          </button>
        ))}
      </div>

      {view === "month" ? (
        <MonthGrid year={year} month={month} monthName={monthName} cells={monthCells} />
      ) : (
        <>
          <WeekGrid weekStart={weekStart} events={weekEvents} todayIndex={todayIndex} />
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            Uke-visningen viser tidssatte bookinger. Oppgaver med frist vises i måneds-visningen.
          </p>
        </>
      )}
    </div>
  );
}
