"use client";

import { CloudOff } from "lucide-react";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

/** PH-04 feil: økta kunne ikke lastes (Claude Design 7d7c2994). */
export default function BriefFeil({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="pa-root" data-theme="night" data-design="precision-athletics" style={{ minHeight: "100dvh", background: "var(--surface-page)", padding: 16 }}>
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <FeilTilstand icon={CloudOff} title="Økta kunne ikke lastes" text="Sjekk nettet og prøv igjen. Økta kan startes når nettet er tilbake."
        retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
    </div>
  </div>;
}
