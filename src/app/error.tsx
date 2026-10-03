"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";

/**
 * Segment-feilside (500). Rapportering og reset() er beholdt.
 * Tegningens faste referanse «7F3A-26» er ikke innført.
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
      tekst="Dette er ikke din feil, og ingenting du har registrert har gått tapt. Feilen er logget, og vi jobber med å løse det."
      kode={error.digest ? `Feil 500 · ${error.digest}` : "Feil 500"}
      primarKnapp={{ label: "Prøv igjen", onClick: reset }}
      sekundar={{ label: "Til hjem", href: "/" }}
    />
  );
}
