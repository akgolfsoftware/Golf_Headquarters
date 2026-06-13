"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkbenchPyramidRow } from "./types";

type WorkbenchStatusbarProps = {
  weekNumber: number;
  sessionCount: number;
  plannedHours: number;
  axisHours: WorkbenchPyramidRow[];
  pendingAdjustments: number;
};

export function WorkbenchStatusbar({
  weekNumber,
  sessionCount,
  plannedHours,
  axisHours,
  pendingAdjustments,
}: WorkbenchStatusbarProps) {
  const fmt = (n: number) => n.toString().replace(".", ",");

  return (
    <footer className="flex h-12 shrink-0 items-center gap-4 border-t border-border bg-[var(--color-player-sidebar)] px-4 text-white">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/80">
        Uke {weekNumber}
      </span>
      <span className="h-4 w-px bg-white/10" />
      <span className="text-sm text-white/80">
        <strong className="text-white">{sessionCount}</strong> økter
      </span>
      <span className="h-4 w-px bg-white/10" />
      <span className="text-sm text-white/80">
        <strong className="text-white">{fmt(plannedHours)} t</strong> planlagt
      </span>
      <span className="h-4 w-px bg-white/10" />
      <div className="hidden items-center gap-3 md:flex">
        {axisHours.map((a) => (
          <span key={a.ax} className="flex items-center gap-1.5 text-sm text-white/80">
            <span className={cn("h-2 w-2 rounded-full", pyrDot(a.ax))} />
            {a.lbl} {fmt(a.hours)} t
          </span>
        ))}
      </div>
      <span className="hidden h-4 w-px bg-white/10 md:block" />
      <span className="hidden text-sm text-white/60 md:block">
        Balanse: <span className="text-warning">−3 pp SPILL</span>
      </span>

      <div className="flex-1" />

      {pendingAdjustments > 0 && (
        <div className="flex items-center gap-2 rounded-full bg-destructive/30 px-3 py-2 text-destructive-foreground">
          <AlertCircle size={14} strokeWidth={1.5} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
            {pendingAdjustments} endringer venter godkjenning
          </span>
        </div>
      )}
    </footer>
  );
}

function pyrDot(ax: string): string {
  switch (ax) {
    case "fys":
      return "bg-[var(--pyr-fys)]";
    case "tek":
      return "bg-[var(--pyr-tek)]";
    case "slag":
      return "bg-[var(--pyr-slag)]";
    case "spill":
      return "bg-[var(--pyr-spill)]";
    case "turn":
      return "bg-[var(--pyr-turn)]";
    default:
      return "bg-white/40";
  }
}
