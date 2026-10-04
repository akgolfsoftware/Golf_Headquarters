"use client";

/* Precision-feil (AG-16b, skoledata). Logger digest, viser ingen intern feiltekst. */
import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[ag16b/skoledata/error]", error.digest);
  }, [error]);
  return <AgencyOSSkall navn="Coach"><div className="pa-side">
    <FeilTilstand icon={CircleAlert} title="Skjemaet kunne ikke åpnes" text="Ingen skoledata er endret. Prøv igjen."
      retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
  </div></AgencyOSSkall>;
}
