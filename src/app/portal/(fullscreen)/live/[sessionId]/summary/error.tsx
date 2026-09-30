"use client";

import { CloudOff } from "lucide-react";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

/** PH-07 feil: oppsummeringen kunne ikke hentes (Claude Design 7d7c2994). */
export default function SummaryFeil({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="pa-root" data-theme="night" data-design="precision-athletics" style={{ minHeight: "100dvh", background: "var(--surface-page)", padding: 16 }}>
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <FeilTilstand icon={CloudOff} title="Oppsummeringen kunne ikke lastes" text="Sjekk nettet og prøv igjen. Økta er lagret." code="FEIL · OPPSUMMERING"
        retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
    </div>
  </div>;
}
