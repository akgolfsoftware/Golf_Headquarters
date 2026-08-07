"use client";

/* Fanger uventede feil i /portal-treet. Fungerer også som fallback for
   underruter uten egen error.tsx (Next.js nærmeste-ancestor-mønster).
   Logger til feillogg via reportClientError. */

import { useEffect } from "react";
import { V2Feil } from "@/components/v2/feil-laste";
import { reportClientError } from "@/lib/report-client-error";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "portal-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return <V2Feil reset={reset} tilbakeHref="/portal" />;
}
