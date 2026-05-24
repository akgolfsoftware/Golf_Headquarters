"use client";

import Link from "next/link";
import type { Slot } from "@/lib/booking/availability";

type Props = {
  slots: Array<Omit<Slot, "start" | "end"> & { start: string; end: string }> | Slot[];
  serviceSlug: string;
};

export function SlotGrid({ slots, serviceSlug }: Props) {
  // Server passes Date-objekter; serialize trygt
  const normalisert = slots.map((s) => ({
    start: s.start instanceof Date ? s.start : new Date(s.start),
    coachId: s.coachId,
    coachName: s.coachName,
  }));

  // Grupper etter coach
  const perCoach = new Map<
    string,
    { coachName: string; slots: { start: Date }[] }
  >();
  for (const s of normalisert) {
    const eksisterende = perCoach.get(s.coachId);
    if (eksisterende) {
      eksisterende.slots.push({ start: s.start });
    } else {
      perCoach.set(s.coachId, {
        coachName: s.coachName,
        slots: [{ start: s.start }],
      });
    }
  }

  return (
    <div className="space-y-6">
      {Array.from(perCoach.entries()).map(([coachId, { coachName, slots }]) => (
        <div key={coachId}>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {coachName}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {slots.map((s) => {
              const iso = s.start.toISOString();
              const klokke = s.start.toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Link
                  key={iso}
                  href={`/portal/booking/ny/bekreft?service=${serviceSlug}&start=${encodeURIComponent(
                    iso,
                  )}&coach=${coachId}`}
                  className="flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 py-3 text-center font-mono text-sm tabular-nums text-foreground transition-colors hover:border-primary hover:bg-primary/5"
                >
                  {klokke}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
