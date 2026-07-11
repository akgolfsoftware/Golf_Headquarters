"use client";

/**
 * Bekreft/Avvis-knapper for ventende bookinger (fasit BookingsScreen-raden).
 * Kaller server-actions; raden re-rendres via revalidatePath.
 */

import { useTransition } from "react";
import { Check } from "lucide-react";

import { agBtnClass } from "@/components/admin/agencyos/ui";
import { avvisBooking, bekreftBooking } from "./actions";

export function BekreftAvvis({ bookingId }: { bookingId: string }) {
  const [pending, start] = useTransition();
  return (
    <span className={`inline-flex justify-end gap-[6px] ${pending ? "opacity-50" : ""}`}>
      <button
        type="button"
        disabled={pending}
        className={agBtnClass("primary", "sm")}
        onClick={() => start(() => bekreftBooking(bookingId))}
      >
        <Check size={13} strokeWidth={1.5} /> Bekreft
      </button>
      <button
        type="button"
        disabled={pending}
        className={agBtnClass("ghost", "sm")}
        onClick={() => start(() => avvisBooking(bookingId))}
      >
        Avvis
      </button>
    </span>
  );
}
