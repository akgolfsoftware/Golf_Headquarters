"use client";

/* Rute-error.tsx for /admin/workbench/[playerId] (AG-11, Precision Athletics).
   Logger til feillogg via reportClientError, som før. */

import { useEffect } from "react";
import { CalendarX } from "lucide-react";
import { reportClientError } from "@/lib/report-client-error";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function WorkbenchUkeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "admin-workbench-uke-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <AgencyOSSkall navn="">
      <div className="pa-side">
        <FeilTilstand icon={CalendarX} title="Workbench kunne ikke lastes" text="Ingen økter er endret. Prøv igjen, eller gå tilbake til stallen." code={error.digest}
          retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
      </div>
    </AgencyOSSkall>
  );
}
