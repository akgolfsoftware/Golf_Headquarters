"use client";

/* Feil-uttrykk for /admin/availability i Precision Athletics. Logger error.digest som før. */

import { useEffect } from "react";
import { CalendarX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[availability/error]", error.digest, error);
  }, [error]);

  return (
    <AgencyOSSkall navn="">
      <div className="pa-side">
        <FeilTilstand
          icon={CalendarX}
          title="Tilgjengeligheten kunne ikke hentes"
          text="Ingen tidsvinduer er endret. Bookinger fra spillere tas vare på."
          code={error.digest}
          retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>}
        />
      </div>
    </AgencyOSSkall>
  );
}
