"use client";

import { PHRunderFeilside } from "@/components/portal/precision/PHRunderFeilside";

export default function Feil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PHRunderFeilside error={error} reset={reset} kontekst="portal-runde-logg-error" tittel="Banene kunne ikke hentes" tekst="Ingenting er lagret ennå. Prøv igjen om litt." skall={false} />;
}
