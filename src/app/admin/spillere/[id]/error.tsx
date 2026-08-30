"use client";

/* Tynn error.tsx (fase 6, SPOR R2) — logger error.digest, rendrer V2Feil.
   Endre visuelt uttrykk i src/components/v2/feil-laste.tsx, ikke her.
   Kopi: GAP-1 Tilstander.dc.html · S3-01 Spiller 360 feil (PX-7, 29.08.2026). */

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
      tilbakeHref="/admin/spillere"
      tittel="Ingen forbindelse"
      melding="Kunne ikke hente SG og tester. Plan vises fra siste synk."
    />
  );
}
