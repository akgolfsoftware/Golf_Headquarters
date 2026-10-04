"use client";

/* PH-12: feil-tilstand i Precision Athletics. Ingenting er lagret når malene ikke lastes. */

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[planlegge/bygger/error]", error.digest, error);
  }, [error]);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <FeilTilstand icon={CircleAlert} title="Planbyggeren kunne ikke starte"
          text="Malene kunne ikke hentes. Ingenting er lagret."
          code={error.digest ? `FEIL ${error.digest} · MALER` : "FEIL 500 · MALER"}
          retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
      </div>
    </PlayerHQSkall>
  );
}
