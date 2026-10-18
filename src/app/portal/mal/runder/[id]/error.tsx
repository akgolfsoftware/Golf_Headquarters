"use client";

import { PHRunderFeilside } from "@/components/portal/precision/PHRunderFeilside";

export default function Feil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PHRunderFeilside error={error} reset={reset} kontekst="portal-runde-error" tittel="Runden kunne ikke hentes" tekst="Runden er ikke endret. Prøv igjen om litt." />;
}
