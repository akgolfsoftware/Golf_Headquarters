"use client";

import { useEffect } from "react";
import { ClipboardX } from "lucide-react";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[ag15/error]", error.digest, error);
  }, [error]);
  return <div className="pa-side">
    <FeilTilstand icon={ClipboardX} title="Testene kunne ikke hentes" text="Ingenting er endret. Prøv igjen." code={error.digest ? `FEIL · ${error.digest}` : undefined}
      retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
  </div>;
}
