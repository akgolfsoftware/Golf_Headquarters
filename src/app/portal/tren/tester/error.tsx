"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[tester/error]", error.digest, error);
  }, [error]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
        <FeilTilstand
          icon={TriangleAlert}
          title="Klarte ikke å hente testene"
          text="Resultatlageret svarte ikke innen 30 sekunder. Loggede resultater er trygge — også de som alt er sendt til talentprofilen din."
          retry={<Knapp variant="secondary" icon={RotateCw} data-od-id="tester-retry" onClick={reset}>Prøv igjen</Knapp>}
        />
      </div>
    </PlayerHQSkall>
  );
}
