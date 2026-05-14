"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cancelBooking } from "@/app/portal/meg/bookinger/actions";

/**
 * Admin/coach kan avbestille en booking uansett tid. Refusjon trigges via
 * Stripe hvis booking har en `stripePaymentIntentId`. Spilleren får e-post.
 */
export function AdminCancelAction({
  bookingId,
  status,
  startAt,
  playerName,
}: {
  bookingId: string;
  status: string;
  startAt: Date;
  playerName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (status === "CANCELLED" || status === "COMPLETED") {
    return <span className="text-muted-foreground">—</span>;
  }

  const tidTilStart = new Date(startAt).getTime() - Date.now();
  const before24t = tidTilStart > 24 * 60 * 60 * 1000;

  function bekreft() {
    startTransition(async () => {
      try {
        await cancelBooking(bookingId);
        setOpen(false);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Kunne ikke avbestille.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1 text-[11px] font-medium text-destructive hover:border-destructive/50"
      >
        <X size={12} strokeWidth={1.75} />
        Avbestill
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Avbestille booking?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Du er i ferd med å avbestille bookingen til{" "}
              <span className="font-medium text-foreground">{playerName}</span>.
              Spilleren får e-post om avbestillingen.
            </p>
            <p className="mt-4 rounded-md border border-border/50 bg-secondary/40 p-4 text-xs text-muted-foreground">
              {before24t
                ? "Over 24 timer igjen — full refusjon utløses automatisk hvis booking ble betalt via Stripe."
                : "Mindre enn 24 timer igjen — spillere har normalt ikke krav på refusjon, men som coach/admin trigges refusjon likevel hvis booking ble betalt via Stripe."}
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-md border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={bekreft}
                disabled={pending}
                className="rounded-md bg-destructive px-4 py-1.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Avbestiller…" : "Ja, avbestill"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
