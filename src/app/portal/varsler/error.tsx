"use client";

import { PHKommunikasjonFeil } from "@/components/portal/precision/PHKommunikasjonFeil";

export default function VarslerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PHKommunikasjonFeil error={error} reset={reset} kontekst="portal-innboks-error"
    tittel="Fikk ikke hentet innboksen" tekst="Sjekk nettet og prøv igjen. Ingen forslag er besvart." />;
}
