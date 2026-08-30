"use client";

/* Kopi: GAP-1 Tilstander.dc.html · BO-01 Booking feil (PX-7, 29.08.2026). */

import { useEffect } from "react";
import { V2Feil } from "@/components/v2/feil-laste";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);

  return (
    <V2Feil
      reset={reset}
      tilbakeHref="/portal"
      tittel="Ingen forbindelse"
      melding="Bookingsystemet svarer ikke. Ingen luker reservert."
    />
  );
}
