"use client";

/* AG-04 Innboks i Precision Athletics: feil-tilstanden i samme skall.
   Logger error.digest som før. */

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

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
          icon={TriangleAlert}
          title="Innboksen kunne ikke hentes"
          text="E-post og meldinger hentes på nytt når du prøver igjen. Ingenting er sendt."
          code={error.digest}
          retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>}
        />
      </div>
    </AgencyOSSkall>
  );
}
