"use client";

/* Tynn error.tsx (fase 6, SPOR R2) — logger error.digest, rendrer V2Feil.
   Endre visuelt uttrykk i src/components/v2/feil-laste.tsx, ikke her.
   Tekst: Fasit: designsystem/train-lock/GAP-1 Tilstander.dc.html (KA-01,
   PX-7 2026-08-29). MERK — siden fasitens "Viser sist lagrede uke" ikke
   stemmer her (page.tsx er force-dynamic uten cache, feil = ingen data i
   det hele tatt), er meldingen justert til å ikke love noe siden ikke
   leverer. */

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
      melding="Kalenderen kunne ikke hentes. Prøv igjen om litt."
    />
  );
}
