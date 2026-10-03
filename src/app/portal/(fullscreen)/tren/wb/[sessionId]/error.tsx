"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import { reportClientError } from "@/lib/report-client-error";

export default function Feil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError({
      context: "portal-wb-okt-error",
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
          icon={TriangleAlert}
          title="Kunne ikke åpne økten"
          text="Prøv igjen. Økten er ikke endret."
          retry={<Knapp variant="secondary" icon={RotateCw} onClick={reset}>Prøv igjen</Knapp>}
        />
      </div>
    </PlayerHQSkall>
  );
}
