"use client";

import { Clock, Dumbbell, CalendarCheck, Flag } from "lucide-react";
import { AthleticCard } from "@/components/athletic";
import type { StatsSnapshot as StatsSnapshotType } from "@/app/portal/actions";

type StatsSnapshotProps = {
  stats: StatsSnapshotType;
  className?: string;
};

function formatMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}t` : `${h}t ${m}m`;
}

export function StatsSnapshot({ stats, className }: StatsSnapshotProps) {
  const items = [
    { label: "Økter i dag", value: String(stats.sessionsToday), icon: CalendarCheck },
    { label: "Reps i dag", value: String(stats.repsToday), icon: Dumbbell },
    { label: "Treningstid uke", value: formatMin(stats.timeThisWeekMin), icon: Clock },
    { label: "Runder uke", value: String(stats.roundsThisWeek), icon: Flag },
  ];

  return (
    <AthleticCard label="Dagens tall" className={className}>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon size={16} />
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em]">{item.label}</span>
              </div>
              <span className="font-mono text-2xl font-bold tracking-[-0.02em] tabular-nums text-foreground">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </AthleticCard>
  );
}
