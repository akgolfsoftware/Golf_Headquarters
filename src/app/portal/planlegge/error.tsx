"use client";

/* PH-10 Plan: feil-tilstand i Precision Athletics. Øktene dine er ikke endret;
   det er bare visningen som mangler. */

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import { reportClientError } from "@/lib/report-client-error";

export default function PlanleggeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError({ context: "portal-planlegge-error", message: error.message, stack: error.stack, digest: error.digest })
      .catch(() => { /* Varsling skal aldri krasje feilsiden selv */ });
  }, [error]);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <FeilTilstand icon={CircleAlert} title="Planen kunne ikke hentes"
          text="Øktene dine er ikke endret. Prøv igjen."
          code={error.digest ? `FEIL · ${error.digest}` : "FEIL · PLAN"}
          retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
      </div>
    </PlayerHQSkall>
  );
}
