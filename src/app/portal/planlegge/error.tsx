"use client";

/* Fanger feil i /portal/planlegge-treet (dekker også /bygger uten egen
   error.tsx). B1-teksten er spesifikk for uke-lastingen, ikke den generiske
   /portal-teksten. Logger til feillogg via reportClientError. */

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
