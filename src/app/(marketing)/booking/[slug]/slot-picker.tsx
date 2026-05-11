"use client";

import Link from "next/link";

type SerializedSlot = {
  start: string;
  end: string;
  coachId: string;
  coachName: string;
};

export function SlotPicker({
  slug,
  slots,
}: {
  slug: string;
  slots: SerializedSlot[];
}) {
  // Grupper slots per coach
  const grouped = slots.reduce<Record<string, { coachName: string; slots: SerializedSlot[] }>>(
    (acc, s) => {
      if (!acc[s.coachId]) {
        acc[s.coachId] = { coachName: s.coachName, slots: [] };
      }
      acc[s.coachId].slots.push(s);
      return acc;
    },
    {},
  );

  return (
    <div className="mt-4 space-y-6">
      {Object.entries(grouped).map(([coachId, group]) => (
        <div key={coachId}>
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {group.coachName}
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {group.slots.map((slot) => {
              const tid = new Date(slot.start).toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const params = new URLSearchParams({
                start: slot.start,
                coach: slot.coachId,
              });
              return (
                <Link
                  key={slot.start + slot.coachId}
                  href={`/booking/${slug}/bekreft?${params.toString()}`}
                  className="rounded-md border border-input bg-card px-3 py-2 text-center font-mono text-sm tabular-nums transition-colors hover:border-primary hover:text-primary"
                >
                  {tid}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
