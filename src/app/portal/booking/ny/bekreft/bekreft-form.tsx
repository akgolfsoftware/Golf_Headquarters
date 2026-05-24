"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCreditBooking } from "@/lib/booking/credit-booking";

type Props = {
  serviceTypeId: string;
  coachId: string;
  start: string; // ISO
};

export function BekreftForm({ serviceTypeId, coachId, start }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await createCreditBooking({
          serviceTypeId,
          coachId,
          start,
          notes: notes.trim() || undefined,
        });
        router.push(`/portal/booking/bekreftet?bookingId=${result.bookingId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <div>
        <label
          htmlFor="notes"
          className="block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
        >
          Notater til coachen (valgfritt)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Hva vil du jobbe med? Spesielle ønsker?"
          className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Bekrefter …" : "Bekreft booking (bruk 1 credit)"}
      </button>
    </form>
  );
}
