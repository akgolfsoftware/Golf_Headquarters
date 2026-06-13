"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticCard } from "@/components/athletic";
import type { RecentActivityItem } from "@/app/portal/actions";

function timeAgo(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "nå";
  if (diffMin < 60) return `${diffMin} min siden`;
  if (diffHour < 24) return `${diffHour} t siden`;
  if (diffDay < 7) return `${diffDay} d siden`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
}

type RecentActivityProps = {
  items: RecentActivityItem[];
  className?: string;
};

export function RecentActivity({ items, className }: RecentActivityProps) {
  return (
    <AthleticCard
      label="Siste aktivitet"
      action={
        <Link href="/portal/analysere" className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
          Se alt →
        </Link>
      }
      className={className}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-muted">
            <Dumbbell size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Ingen registrert aktivitet ennå.</p>
        </div>
      ) : (
        <ul className="space-y-0">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-4 py-4",
                idx < items.length - 1 && "border-b border-border",
              )}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10">
                <Dumbbell size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={item.href} className="block truncate text-sm font-semibold text-foreground hover:text-primary">
                  {item.drillName}
                </Link>
                <p className="truncate font-mono text-[10px] text-muted-foreground">{item.sessionTitle}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-xs font-semibold tabular-nums text-foreground">{item.repsTotal} reps</p>
                <p className="font-mono text-[10px] text-muted-foreground">{timeAgo(item.loggedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AthleticCard>
  );
}
