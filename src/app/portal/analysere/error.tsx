"use client";

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import { reportClientError } from "@/lib/report-client-error";

export default function AnalysereError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      context: "portal-analysere-error",
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
          title="Fikk ikke hentet SG"
          text="Tallene dine er trygge. Prøv igjen om litt."
          code={error.digest ? `FEIL · ANALYSE · ${error.digest}` : "FEIL · ANALYSE"}
          retry={<Knapp variant="secondary" icon={RotateCw} onClick={reset}>Prøv igjen</Knapp>}
        />
      </div>
    </PlayerHQSkall>
  );
}
