"use client";

/* AG-23 Profil: feil-tilstand i Precision Athletics, inne i AgencyOSSkall (Hurtigknappen består). */

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
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
    console.error("[ag23/error]", error.digest, error);
  }, [error]);

  return (
    <AgencyOSSkall navn="Coach">
      <div className="pa-side">
        <FeilTilstand icon={CircleAlert} title="Profilen kunne ikke hentes" text="Ingenting er endret. Prøv igjen."
          retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
      </div>
    </AgencyOSSkall>
  );
}
