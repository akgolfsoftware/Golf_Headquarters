"use client";

import { Card } from "@/components/athletic/golfdata";
import { Clock, Dumbbell, CalendarCheck, Flag } from "lucide-react";
import type { StatsSnapshot } from "@/app/portal/actions";

export type KpiGridProps = {
  stats: StatsSnapshot;
  className?: string;
};

function formatMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}t` : `${h}t ${m}m`;
}

export function KpiGrid({ stats, className }: KpiGridProps) {
  const items = [
    { label: "Økter i dag", value: String(stats.sessionsToday), icon: CalendarCheck },
    { label: "Reps i dag", value: String(stats.repsToday), icon: Dumbbell },
    { label: "Treningstid uke", value: formatMin(stats.timeThisWeekMin), icon: Clock },
    { label: "Runder uke", value: String(stats.roundsThisWeek), icon: Flag },
  ];

  return (
    <Card eyebrow="Dagens tall" className={className}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon size={16} strokeWidth={1.5} />
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em]">{item.label}</span>
              </div>
              <span className="font-mono text-2xl font-bold tracking-[-0.02em] tabular-nums text-foreground">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
