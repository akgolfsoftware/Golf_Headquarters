"use client";

/* PH-TP-01: feil-tilstand i Precision Athletics. Registreringer som allerede
   er sendt, er lagret — det er bare visningen som mangler. */

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[teknisk-plan/error]", error.digest, error);
  }, [error]);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <FeilTilstand icon={CircleAlert} title="Planen kunne ikke hentes"
          text="Repetisjoner du allerede har registrert, er lagret. Prøv igjen."
          code={error.digest ? `FEIL · ${error.digest}` : "FEIL · TEKNISK PLAN"}
          retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
      </div>
    </PlayerHQSkall>
  );
}
