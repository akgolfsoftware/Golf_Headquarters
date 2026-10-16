"use client";

import { PHKommunikasjonFeil } from "@/components/portal/precision/PHKommunikasjonFeil";

export default function Feil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PHKommunikasjonFeil error={error} reset={reset} kontekst="portal-coach-tilbakemelding-error"
    tittel="Tilbakemeldingen kunne ikke hentes" tekst="Ingenting er endret. Prøv igjen om litt." />;
}
