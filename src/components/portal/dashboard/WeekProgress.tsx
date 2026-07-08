"use client";

import { cn } from "@/lib/utils";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticCard } from "@/components/athletic";
import type { WeekPlanProgress } from "@/app/portal/actions";

const AXES = [
  { key: "FYS", label: "FYS" },
  { key: "TEK", label: "TEK" },
  { key: "SLAG", label: "SLAG" },
  { key: "SPILL", label: "SPILL" },
  { key: "TURN", label: "TURN" },
] as const;

const PYRAMID_BG: Record<string, string> = {
  FYS: "bg-[var(--pyr-fys)]",
  TEK: "bg-[var(--pyr-tek)]",
  SLAG: "bg-[var(--pyr-slag)]",
  SPILL: "bg-[var(--pyr-spill)]",
  TURN: "bg-[var(--pyr-turn)]",
};

function formatMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}t` : `${h}t ${m}m`;
}

export type WeekProgressProps = {
  progress: WeekPlanProgress;
  weekNumber: number;
  className?: string;
};

export function WeekProgress({ progress, weekNumber, className }: WeekProgressProps) {
  const pct = progress.plannedMin > 0 ? Math.round((progress.completedMin / progress.plannedMin) * 100) : 0;

  return (
    <AthleticCard label={`Uke ${weekNumber} · progresjon`} className={className}>
      <div className="space-y-5">
        {/* Total bar */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2 text-xs">
            <span className="font-mono uppercase tracking-[0.06em] text-muted-foreground">Timer fullført</span>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {formatMin(progress.completedMin)} / {formatMin(progress.plannedMin)}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
            {pct}% av ukens planlagte tid
          </p>
        </div>

        {/* Pyramid axis bars */}
        <div className="space-y-3">
          {AXES.map((axis) => {
            const planned = progress.plannedByAxis[axis.key] ?? 0;
            const completed = progress.completedByAxis[axis.key] ?? 0;
            const axisPct = planned > 0 ? Math.round((completed / planned) * 100) : 0;
            return (
              <div key={axis.key} className="flex items-center gap-3">
                <span className="w-8 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {axis.label}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="font-mono tabular-nums text-foreground">{formatMin(completed)}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">/ {formatMin(planned)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", PYRAMID_BG[axis.key])}
                      style={{ width: `${Math.min(100, axisPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AthleticCard>
  );
}
