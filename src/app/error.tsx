"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";

/**
 * SY-01 500 i nytt design (gfgk-system.html). Rapportering og reset() er beholdt.
 * Referansen er Next sin digest; tegningens faste referanse er demodata og vises ikke.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "segment-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Feilrapportering skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <PrecisionTilstand
      kicker="500"
      tittel="Noe gikk galt hos oss"
      tekst="Siden kunne ikke vises. Det du lagret før, er ikke borte."
      kode={error.digest ? `Referanse: ${error.digest} · oppgi den hvis du kontakter post@akgolf.no` : undefined}
      primarKnapp={{ label: "Prøv igjen", onClick: reset }}
      sekundar={{ label: "Til forsiden", href: "/" }}
    />
  );
}
