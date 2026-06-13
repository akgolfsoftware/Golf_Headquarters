"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent, WorkbenchSession } from "./types";

type SessionCardProps = {
  event: CalendarEvent;
  selected?: boolean;
  onClick?: (session: WorkbenchSession) => void;
};

const ROW_H = 48;

export function SessionCard({ event, selected, onClick }: SessionCardProps) {
  const top = ((event.hour - 6) * 60 + event.minute) * (ROW_H / 60);
  const height = Math.max(event.durationMin * (ROW_H / 60), 28);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData("sessionId", event.session.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <button
      type="button"
      onClick={() => onClick?.(event.session)}
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "absolute inset-x-1 cursor-grab rounded-md border-l-4 px-2 py-1 text-left transition active:cursor-grabbing",
        "bg-card shadow-sm hover:shadow-md hover:brightness-[1.02]",
        selected && "ring-2 ring-primary ring-offset-1",
        event.pyramidArea === "FYS" && "border-l-[var(--pyr-fys)]",
        event.pyramidArea === "TEK" && "border-l-[var(--pyr-tek)]",
        event.pyramidArea === "SLAG" && "border-l-[var(--pyr-slag)]",
        event.pyramidArea === "SPILL" && "border-l-[var(--pyr-spill)]",
        event.pyramidArea === "TURN" && "border-l-[var(--pyr-turn)]",
      )}
      style={{ top: `${top}px`, height: `${height}px` }}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            event.pyramidArea === "FYS" && "bg-[var(--pyr-fys)]",
            event.pyramidArea === "TEK" && "bg-[var(--pyr-tek)]",
            event.pyramidArea === "SLAG" && "bg-[var(--pyr-slag)]",
            event.pyramidArea === "SPILL" && "bg-[var(--pyr-spill)]",
            event.pyramidArea === "TURN" && "bg-[var(--pyr-turn)]",
          )}
        />
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          {String(event.hour).padStart(2, "0")}:{String(event.minute).padStart(2, "0")}
        </span>
      </div>
      <div className="mt-0.5 truncate text-xs font-semibold text-foreground">
        {event.title}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        {event.environment && <span>{event.environment}</span>}
        {event.drillCount > 0 && <span>{event.drillCount} drills</span>}
      </div>
    </button>
  );
}
