"use client";

/* Precision-feil (AG-16b). Logger digest, viser ingen intern feiltekst. */
import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[ag16b/error]", error.digest);
  }, [error]);
  return <AgencyOSSkall navn="Coach"><div className="pa-side">
    <FeilTilstand icon={CircleAlert} title="AK-stigen kunne ikke hentes" text="Ingenting er endret. Prøv igjen."
      retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
  </div></AgencyOSSkall>;
}
