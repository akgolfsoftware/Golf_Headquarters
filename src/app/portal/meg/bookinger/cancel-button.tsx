"use client";

import { useTransition } from "react";
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

  function avbestille() {
    const tekst = canRefund
      ? "Avbestille bookingen? Du får full refusjon (3–10 dager)."
      : "Avbestille bookingen? Mindre enn 24 timer igjen — ingen refusjon.";
    if (!confirm(tekst)) return;
    startTransition(async () => {
      try {
        await cancelBooking(bookingId);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Kunne ikke avbestille.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={avbestille}
      disabled={pending}
      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:border-destructive/50 disabled:opacity-60"
    >
      {pending ? "Avbestiller…" : canRefund ? "Avbestill (refusjon)" : "Avbestill"}
    </button>
  );
}
