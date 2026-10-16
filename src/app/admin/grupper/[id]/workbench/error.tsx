"use client";

/* AG-11-GRUPPE i Precision Athletics: feil-tilstand. Logger error.digest. */

import { useEffect } from "react";
import { CalendarX } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);
  return (
    <AgencyOSSkall navn="">
      <div className="pa-side">
        <FeilTilstand icon={CalendarX} title="Gruppas Workbench kunne ikke hentes" text="Ingen perioder er endret." code={error.digest}
          retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
      </div>
    </AgencyOSSkall>
  );
}
