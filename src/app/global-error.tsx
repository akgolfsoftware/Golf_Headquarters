"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client-error";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";

/**
 * SY-01 500 når selve rotlayouten feiler. Egen html og body, ellers samme flate som error.tsx.
 * Rotlayoutens fonter finnes ikke her; flater-ny.css faller tilbake til IBM Plex og systemfont.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    reportClientError({
      context: "global-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <html lang="nb">
      <body style={{ margin: 0 }}>
        <PrecisionTilstand
          kicker="500"
          tittel="Noe gikk galt hos oss"
          tekst="Siden kunne ikke vises. Det du lagret før, er ikke borte. Vi har fått beskjed automatisk."
          kode={error.digest ? `Referanse: ${error.digest} · oppgi den hvis du kontakter post@akgolf.no` : undefined}
          primar={{ label: "Til forsiden", href: "/" }}
        />
      </body>
    </html>
  );
}
