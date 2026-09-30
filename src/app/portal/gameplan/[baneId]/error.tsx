"use client";

import { useEffect } from "react";
import { RotateCw, CircleAlert } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp, KnappLenke } from "@/components/precision/pa";
import { reportClientError } from "@/lib/report-client-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({ context: "portal-gameplan-bane-error", message: error.message, stack: error.stack, digest: error.digest }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}><div className="pa-side">
    <FeilTilstand icon={CircleAlert} title="Banekartet kunne ikke lastes" text="Gameplanene dine er lagret. Prøv igjen om litt."
      code="FEIL 500 · GAMEPLAN"
      retry={<><Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp><KnappLenke variant="secondary" href="/portal/gameplan">Alle baner</KnappLenke></>} />
  </div></PlayerHQSkall>;
}
