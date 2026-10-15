"use client";

import { PHRunderFeilside } from "@/components/portal/precision/PHRunderFeilside";

export default function Feil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PHRunderFeilside error={error} reset={reset} kontekst="portal-runde-live-error" tittel="Runden kunne ikke hentes" tekst="Slagene du har ført, er lagret på telefonen. Prøv igjen." skall={false} />;
}
