"use client";

/* Fanger uventede feil i /portal/planlegge (Plan-fanen, B1 «Plan feil»).
   Manglet egen error.tsx før PX-7 — falt tilbake på generisk /portal/error.tsx-
   tekst («Fikk ikke lastet dagen din»), feil for denne fanen. */

import { useEffect } from "react";
import { V2Feil } from "@/components/v2/feil-laste";
import { reportClientError } from "@/lib/report-client-error";

export default function PlanleggeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "portal-planlegge-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <V2Feil
      reset={reset}
      tilbakeHref="/portal"
      tittel="Fikk ikke lastet uken"
      melding="Sjekk nettet og prøv igjen."
    />
  );
}
