"use client";

/* AG-10: feil-tilstand i Precision Athletics. Logger error.digest som før. */

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);
  return (
    <AgencyOSSkall navn="">
      <div className="pa-side">
        <FeilTilstand icon={CircleAlert} title="Teknisk plan kunne ikke hentes" text="Ingen oppgaver er endret. Prøv igjen."
          code={error.digest ? `FEIL · ${error.digest}` : "FEIL · TEKNISK PLAN"}
          retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
      </div>
    </AgencyOSSkall>
  );
}
