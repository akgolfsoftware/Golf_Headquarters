"use client";

/* Tynn error.tsx (fase 6, SPOR R2) — logger error.digest, rendrer V2Feil.
   Endre visuelt uttrykk i src/components/v2/feil-laste.tsx, ikke her.
   Tekst: Fasit: designsystem/train-lock/GAP-1 Tilstander.dc.html (S3-01,
   PX-7 2026-08-29). Alle undersider (tester/fremgang/analyse/plan/
   workbench) har egen error.tsx — denne dekker kun 360-siden selv. */

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
      melding="Kunne ikke hente SG og tester. Prøv igjen om litt."
    />
  );
}
