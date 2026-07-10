"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createCreditBooking } from "@/lib/booking/credit-booking";

type Props = {
  serviceTypeId: string;
  coachId: string;
  start: string; // ISO
  backHref: string;
};

export function BekreftForm({
  serviceTypeId,
  coachId,
  start,
  backHref,
}: Props) {
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
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(10,31,23,0.05)]">
        <label
          htmlFor="notes"
          className="block font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
        >
          Notater til coachen (valgfritt)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Hva vil du jobbe med? Spesielle ønsker?"
          className="mt-2.5 w-full rounded-[14px] border border-input bg-secondary px-3.5 py-2.5 font-sans text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-primary disabled:opacity-50"
      >
        {pending ? "Bekrefter …" : "Bekreft booking"}
      </button>

      <Link
        href={backHref}
        className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border-[1.5px] border-border bg-transparent px-6 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Endre valg
      </Link>
    </form>
  );
}
