"use client";

/* Deles av /portal/meg og alle undersider (abonnement, dokumenter,
   feedback, foreldre, help, helse, innstillinger, profil, sikkerhet,
   utstyrsbag) som ikke har egen error.tsx. Nytt design: PH24MegFeil. */

import { useEffect } from "react";
import { PH24MegFeil } from "@/components/portal/precision/PH24MegTilstand";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[meg/error]", error.digest, error);
  }, [error]);

  return (
    <PH24MegFeil
      tittel="Siden kunne ikke hentes"
      handling={<button type="button" className="phn-knapp sek" onClick={reset} style={{ justifySelf: "start" }}>Prøv igjen</button>}
    />
  );
}
