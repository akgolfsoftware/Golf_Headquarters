"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "./actions";

export function CancelButton({
  bookingId,
  canRefund,
}: {
  bookingId: string;
  canRefund: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function avbestille() {
    const tekst = canRefund
      ? "Avbestille bookingen? Du får full refusjon (3–10 dager)."
      : "Avbestille bookingen? Mindre enn 24 timer igjen — ingen refusjon.";
    if (!confirm(tekst)) return;
    setFeil(null);
    startTransition(async () => {
      try {
        await cancelBooking(bookingId);
        router.refresh();
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke avbestille.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={avbestille}
        disabled={pending}
        className="rounded-md border border-destructive/30 bg-destructive/5 min-h-11 px-4 text-sm font-medium text-destructive hover:border-destructive/50 disabled:opacity-60"
      >
        {pending ? "Avbestiller…" : canRefund ? "Avbestill (refusjon)" : "Avbestill"}
      </button>
      {feil && (
        <p role="alert" className="text-xs text-destructive">
          {feil}
        </p>
      )}
    </div>
  );
}
