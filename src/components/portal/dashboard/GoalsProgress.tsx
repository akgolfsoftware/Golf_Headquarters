"use client";

import Link from "next/link";
import { Target, Plus } from "lucide-react";
import { AthleticCard } from "@/components/athletic";
import type { GoalItem } from "@/app/portal/actions";

const AXIS_BAR_COLOR: Record<string, string> = {
  OUTCOME: "var(--pyr-turn)",
  PROCESS: "var(--pyr-fys)",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktiv",
  ACHIEVED: "Oppnådd",
  ABANDONED: "Avsluttet",
};

type GoalsProgressProps = {
  goals: GoalItem[];
  className?: string;
};

export function GoalsProgress({ goals, className }: GoalsProgressProps) {
  return (
    <AthleticCard
      label="Aktive mål"
      action={
        <Link href="/portal/mal" className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
          Alle mål →
        </Link>
      }
      className={className}
    >
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-muted">
            <Target size={20} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Ingen aktive mål.</p>
          <Link href="/portal/mal/bygger">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:opacity-80">
              <Plus size={14} /> Nytt mål
            </span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              href={goal.href}
              className="group block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                  {goal.title}
                </h3>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    background: goal.status === "ACHIEVED" ? "var(--color-chip-ok-bg)" : "var(--color-chip-req-bg)",
                    color: goal.status === "ACHIEVED" ? "var(--color-chip-ok-fg)" : "var(--pyr-slag)",
                  }}
                >
                  {STATUS_LABEL[goal.status] ?? goal.status}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono text-xs font-bold tabular-nums text-foreground">{goal.progress}%</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {goal.daysLeft != null
                    ? goal.daysLeft < 0
                      ? `${Math.abs(goal.daysLeft)} dager over`
                      : `${goal.daysLeft} dager igjen`
                    : "Ingen frist"}
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, goal.progress))}%`, background: AXIS_BAR_COLOR[goal.category] ?? "var(--primary)" }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AthleticCard>
  );
}
