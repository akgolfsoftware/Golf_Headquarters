"use client";

/* Feil-tilstand for /portal/tren/tester — Precision Athletics PH-14.
   Dekker også [testId]-, ny- og team-norway-rutene under. */

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { FeilTilstand } from "@/components/precision/pa";

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
    <div className="pa-root" data-design="precision-athletics">
      <div className="pa-side" style={{ maxWidth: 1320 }}>
        <FeilTilstand
          icon={CircleAlert}
          title="Testene kunne ikke hentes"
          text="Resultatene dine er ikke slettet. Prøv igjen."
          code={error.digest ? `FEIL · ${error.digest}` : undefined}
          retry={<button type="button" className="pa-btn pa-btn--secondary" onClick={reset}>Prøv igjen</button>}
        />
      </div>
    </div>
  );
}
