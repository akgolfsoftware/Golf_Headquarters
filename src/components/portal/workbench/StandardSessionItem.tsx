"use client";

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkbenchStandardSession } from "./types";

type StandardSessionItemProps = {
  session: WorkbenchStandardSession;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
};

export function StandardSessionItem({ session, onDragStart }: StandardSessionItemProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("standardSessionId", session.id);
    e.dataTransfer.effectAllowed = "copy";
    onDragStart?.(e);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group flex cursor-grab items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition hover:border-primary/30 hover:bg-secondary/50 active:cursor-grabbing"
    >
      <GripVertical
        size={14}
        className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground"
        aria-hidden
      />
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          session.pyramidArea === "FYS" && "bg-[var(--pyr-fys)]",
          session.pyramidArea === "TEK" && "bg-[var(--pyr-tek)]",
          session.pyramidArea === "SLAG" && "bg-[var(--pyr-slag)]",
          session.pyramidArea === "SPILL" && "bg-[var(--pyr-spill)]",
          session.pyramidArea === "TURN" && "bg-[var(--pyr-turn)]",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-foreground">{session.name}</div>
        <div className="text-[10px] text-muted-foreground">
          {session.drillCount} drills · {session.durationMinutes} min
        </div>
      </div>
      <span className="shrink-0 font-mono text-[10px] font-semibold text-muted-foreground">
        {session.durationMinutes} m
      </span>
    </div>
  );
}
