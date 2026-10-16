"use client";

/* PH-12 Velg treningsplan: feiltilstand i nytt design. Ingenting er lagret når planene ikke lastes. */
import { OvFeil } from "@/components/portal/precision/PH13Feil";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <OvFeil error={error} reset={reset} kontekst="portal-velg-plan-error" tittel="Standardplanene kunne ikke hentes"
    tekst="Ingenting er lagret. Du kan bygge uka selv i Workbench så lenge." />;
}
