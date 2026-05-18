"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type SchedulerSlot = {
  key: string;
  date: Date;
  hour: number;
  duration: number;
  available: boolean;
  coachName?: string;
  facility?: string;
};

type SessionSchedulerProps = {
  slots: SchedulerSlot[];
  selectedKey?: string;
  onSelect?: (slot: SchedulerSlot) => void;
  daysToShow?: number;
  startDate?: Date;
  weekdayShort?: string[];
  className?: string;
};

const defaultWeekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export function SessionScheduler({
  slots,
  selectedKey,
  onSelect,
  daysToShow = 7,
  startDate,
  weekdayShort = defaultWeekdays,
  className,
}: SessionSchedulerProps) {
  const baseDate = startDate ?? new Date();
  const [internalSelected, setInternalSelected] = useState<string | undefined>(selectedKey);

  const days = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const slotsByDate = new Map<string, SchedulerSlot[]>();
  slots.forEach((s) => {
    const k = s.date.toDateString();
    const list = slotsByDate.get(k) ?? [];
    list.push(s);
    slotsByDate.set(k, list);
  });

  const handle = (slot: SchedulerSlot) => {
    setInternalSelected(slot.key);
    onSelect?.(slot);
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 md:p-5", className)}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-[-0.015em]">Velg tidspunkt</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {slots.filter((s) => s.available).length} ledige
        </span>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${daysToShow}, minmax(0, 1fr))` }}>
        {days.map((d, i) => {
          const daySlots = (slotsByDate.get(d.toDateString()) ?? []).sort((a, b) => a.hour - b.hour);
          return (
            <div key={i} className="flex min-w-0 flex-col gap-2">
              <div className="text-center">
                <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {weekdayShort[(d.getDay() + 6) % 7]}
                </div>
                <div className="font-display text-base font-bold leading-none">
                  {d.getDate()}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {daySlots.length === 0 && (
                  <span className="rounded-md bg-muted/40 py-2 text-center font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    —
                  </span>
                )}
                {daySlots.map((s) => {
                  const sel = internalSelected === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      disabled={!s.available}
                      onClick={() => handle(s)}
                      className={cn(
                        "rounded-md border px-2 py-2 text-center font-mono text-[11px] font-semibold transition",
                        sel
                          ? "border-accent bg-accent text-accent-foreground shadow-[0_0_0_2px_rgba(209,248,67,0.3)]"
                          : s.available
                            ? "border-border bg-background hover:border-primary"
                            : "border-border bg-muted/40 text-muted-foreground opacity-50",
                      )}
                    >
                      {String(s.hour).padStart(2, "0")}:00
                      <span className="block font-mono text-[9px] font-medium opacity-70">
                        {s.duration}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
