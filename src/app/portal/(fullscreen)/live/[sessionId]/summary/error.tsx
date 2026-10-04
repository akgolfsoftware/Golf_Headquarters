"use client";

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import { reportClientError } from "@/lib/report-client-error";
import "@/styles/precision-athletics.css";

export default function SummaryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "portal-live-summary-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <div className="pa-root ph07-feilside" data-theme="night">
      <FeilTilstand
        icon={CircleAlert}
        title="Oppsummeringen kunne ikke hentes"
        text="Tallene i økta er ikke endret. Prøv igjen."
        code={error.digest ? `FEIL · ETTER · ${error.digest}` : "FEIL · ETTER"}
        retry={<Knapp variant="secondary" icon={RotateCw} onClick={reset}>Prøv igjen</Knapp>}
      />
    </div>
  );
}
