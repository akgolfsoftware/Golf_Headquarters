"use client";

/* PH-TP-01: feiltilstand i nytt design. Repetisjoner som allerede er registrert, er lagret. */
import { OvFeil } from "@/components/portal/precision/PH13Feil";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <OvFeil error={error} reset={reset} kontekst="portal-teknisk-plan-error" tittel="Den tekniske planen kunne ikke hentes"
    tekst="Repetisjoner du allerede har registrert, er lagret. Prøv igjen." />;
}
