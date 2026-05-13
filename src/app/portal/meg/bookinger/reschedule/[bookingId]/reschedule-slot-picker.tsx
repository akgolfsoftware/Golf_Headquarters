"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rescheduleBooking } from "@/app/portal/meg/bookinger/actions";

type Slot = {
  start: string; // ISO
  coachId: string;
  coachName: string;
};

type Props = {
  bookingId: string;
  slots: Slot[];
};

export function RescheduleSlotPicker({ bookingId, slots }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [valgt, setValgt] = useState<Slot | null>(null);

  function bekreft() {
    if (!valgt) return;
    setError(null);
    startTransition(async () => {
      try {
        await rescheduleBooking({
          bookingId,
          newStartIso: valgt.start,
          newCoachId: valgt.coachId,
        });
        router.push("/portal/meg/bookinger?ny=1");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt.");
      }
    });
  }

  // Grupper slots per coach
  const perCoach = new Map<string, Slot[]>();
  for (const s of slots) {
    const arr = perCoach.get(s.coachId);
    if (arr) arr.push(s);
    else perCoach.set(s.coachId, [s]);
  }

  return (
    <div className="space-y-4">
      {Array.from(perCoach.entries()).map(([coachId, coachSlots]) => (
        <div key={coachId}>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {coachSlots[0].coachName}
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {coachSlots.map((s) => {
              const aktiv = valgt?.start === s.start;
              const klokke = new Date(s.start).toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <button
                  key={s.start}
                  type="button"
                  onClick={() => setValgt(s)}
                  className={`rounded-md border px-3 py-2 text-center font-mono text-sm tabular-nums transition-colors ${
                    aktiv
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary"
                  }`}
                >
                  {klokke}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {valgt
            ? `Valgt: ${new Date(valgt.start).toLocaleString("nb-NO", { dateStyle: "medium", timeStyle: "short" })} (${valgt.coachName})`
            : "Velg en tid over for å bekrefte byttet."}
        </p>
        <button
          type="button"
          onClick={bekreft}
          disabled={!valgt || pending}
          className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Bytter …" : "Bekreft bytte"}
        </button>
      </div>
    </div>
  );
}
