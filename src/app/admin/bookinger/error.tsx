"use client";

/* AG-06 i Precision Athletics: feil-uttrykket gjelder også undersidene
   (ny og [id]), som er portert 29.09.2026. Logger error.digest som før. */

import { useEffect } from "react";
import { CalendarX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp, KnappLenke } from "@/components/precision/pa";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);

  return (
    <AgencyOSSkall navn="">
      <div className="pa-side">
        <FeilTilstand
          icon={CalendarX}
          title="Bookingene kunne ikke hentes"
          text="Ingen bookinger er endret. Spillerne ser fortsatt sine bekreftede timer."
          code={error.digest}
          retry={<><Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp><KnappLenke href="/admin/agencyos" variant="ghost">Til Cockpit</KnappLenke></>}
        />
      </div>
    </AgencyOSSkall>
  );
}
