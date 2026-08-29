"use client";

/* Tynn error.tsx (fase 6, SPOR R2) — logger error.digest, rendrer V2Feil.
   Endre visuelt uttrykk i src/components/v2/feil-laste.tsx, ikke her.
   Kopi: GAP-1 Tilstander.dc.html · KA-01 Kalender feil (PX-7, 29.08.2026). */

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
      tilbakeHref="/admin/agencyos"
      tittel="Ingen forbindelse"
      melding="Kalenderen kunne ikke hentes. Viser sist lagrede uke."
    />
  );
}
