"use client";

/* Fanger uventede feil i /portal-treet. Fungerer også som fallback for
   underruter uten egen error.tsx (Next.js nærmeste-ancestor-mønster).
   Logger til feillogg via reportClientError. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PH01Error } from "@/components/portal/v2/idag/IDagSelected";
import { V2Feil } from "@/components/v2/feil-laste";
import { reportClientError } from "@/lib/report-client-error";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
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

  if (pathname === "/portal") return <PH01Error reset={reset} />;
  return (
    <V2Feil
      reset={reset}
      tilbakeHref="/portal"
      tittel="Fikk ikke lastet dagen din"
      melding="Sjekk nettet og prøv igjen. Planen ligger trygt hos Anders."
    />
  );
}
