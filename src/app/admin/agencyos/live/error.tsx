"use client";

import { useEffect } from "react";
import { RadioTower } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[agencyos/live/error]", error.digest, error);
  }, [error]);

  return (
    <AgencyOSSkall navn="Coach">
      <div className="pa-side">
        <FeilTilstand
          icon={RadioTower}
          title="Mistet kontakten med live-økter"
          text="Øktene fortsetter hos spillerne og lagres der. Tavla kobler til igjen når du prøver."
          code={error.digest ? `FEIL · ${error.digest}` : undefined}
          retry={<Knapp onClick={reset}>Prøv igjen</Knapp>}
        />
      </div>
    </AgencyOSSkall>
  );
}
