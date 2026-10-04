"use client";

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
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
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <FeilTilstand
          icon={CircleAlert}
          title="Fikk ikke lastet uken"
          text="Sjekk nettet og prøv igjen. Ingenting er endret i planen."
          code={error.digest ? `FEIL · PLAN · ${error.digest}` : "FEIL · PLAN"}
          retry={<Knapp variant="secondary" icon={RotateCw} onClick={reset}>Prøv igjen</Knapp>}
        />
      </div>
    </PlayerHQSkall>
  );
}
