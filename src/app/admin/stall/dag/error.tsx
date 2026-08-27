"use client";

/* Rute-error.tsx for /admin/stall/dag (C2). Logger til feillogg via
   reportClientError. Visuelt: V2Feil. */

import { useEffect } from "react";
import { V2Feil } from "@/components/v2/feil-laste";
import { reportClientError } from "@/lib/report-client-error";

export default function StallDagError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "admin-stall-dag-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return <V2Feil reset={reset} tilbakeHref="/admin/spillere" tittel="Kunne ikke laste Stall · dag" />;
}
