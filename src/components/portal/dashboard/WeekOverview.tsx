"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AthleticCard } from "@/components/athletic";
import type { WeekDay } from "@/app/portal/actions";

const PYRAMID_DOT: Record<string, string> = {
  FYS: "bg-[var(--pyr-fys)]",
  TEK: "bg-[var(--pyr-tek)]",
  SLAG: "bg-[var(--pyr-slag)]",
  SPILL: "bg-[var(--pyr-spill)]",
  TURN: "bg-[var(--pyr-turn)]",
};

type WeekOverviewProps = {
  days: WeekDay[];
  className?: string;
};

export function WeekOverview({ days, className }: WeekOverviewProps) {
  return (
    <AthleticCard
      label="Ukeoversikt"
      action={
        <Link href="/portal/planlegge" className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
          Åpne Workbench →
        </Link>
      }
      className={className}
    >
      <div className="flex justify-between gap-2 overflow-x-auto pb-1">
        {days.map((day) => (
          <Link
            key={day.date.toISOString()}
            href="/portal/planlegge"
            className={cn(
              "flex min-w-[44px] flex-1 flex-col items-center gap-2 rounded-lg border py-4 transition-colors",
              day.isToday
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-secondary",
            )}
          >
            <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.10em]", day.isToday ? "text-primary" : "text-muted-foreground")}>
              {day.dayLabel}
            </span>
            <span className={cn("font-display text-base font-bold leading-none tabular-nums", day.isToday ? "text-primary" : "text-foreground")}>
              {day.dayNumber}
            </span>
            <div className="mt-0.5 flex flex-wrap justify-center gap-1 px-1">
              {day.sessions.slice(0, 3).map((s) => (
                <span
                  key={s.id}
                  className={cn("h-1.5 w-1.5 rounded-full", PYRAMID_DOT[s.pyramidArea] ?? "bg-muted-foreground")}
                  title={s.title}
                />
              ))}
              {day.sessions.length === 0 && <span className="h-1.5 w-1.5 rounded-full bg-transparent" />}
            </div>
          </Link>
        ))}
      </div>

      {days.some((d) => d.sessions.length > 0) ? (
        <div className="mt-4 space-y-2">
          {days
            .filter((d) => d.sessions.length > 0)
            .slice(0, 3)
            .flatMap((d) => d.sessions.slice(0, 1))
            .map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"
              >
                <span className={cn("h-8 w-1 rounded-full", PYRAMID_DOT[s.pyramidArea] ?? "bg-muted-foreground")} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {s.startTime.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" })} · {" "}
                    {Math.max(0, Math.round((s.endTime.getTime() - s.startTime.getTime()) / 60_000))} min
                  </p>
                </div>
              </Link>
            ))}
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-muted-foreground">Ingen økter denne uken.</p>
      )}
    </AthleticCard>
  );
}
