"use client";

import { useEffect } from "react";
import { CalendarX, RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import { reportClientError } from "@/lib/report-client-error";

export default function WorkbenchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "portal-workbench-error",
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <FeilTilstand
          icon={CalendarX}
          title="Workbench kunne ikke lastes"
          text="Planen din er ikke endret. Prøv igjen."
          code={error.digest ? `FEIL · WORKBENCH · ${error.digest}` : "FEIL · WORKBENCH"}
          retry={<Knapp variant="secondary" icon={RotateCw} onClick={reset}>Prøv igjen</Knapp>}
        />
      </div>
    </PlayerHQSkall>
  );
}
