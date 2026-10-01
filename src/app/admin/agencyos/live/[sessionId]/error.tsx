"use client";

import { useEffect } from "react";
import { RadioTower } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[agencyos/live/sessionId/error]", error.digest, error);
  }, [error]);

  return (
    <AgencyOSSkall navn="Coach" natt>
      <div className="pa-side">
        <FeilTilstand
          icon={RadioTower}
          title="Fikk ikke hentet denne økta"
          text="Prøv igjen. Skjer det flere ganger, sjekk at lenken er riktig."
          code={error.digest ? `FEIL · ${error.digest}` : undefined}
          retry={<Knapp onClick={reset}>Prøv igjen</Knapp>}
        />
      </div>
    </AgencyOSSkall>
  );
}
