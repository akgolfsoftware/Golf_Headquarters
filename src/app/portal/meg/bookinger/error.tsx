"use client";

import { PHKommunikasjonFeil } from "@/components/portal/precision/PHKommunikasjonFeil";

export default function MineBookingerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PHKommunikasjonFeil error={error} reset={reset} kontekst="portal-mine-bookinger-error"
    tittel="Fikk ikke hentet bookingene" tekst="Ingen timer er endret. Sjekk nettet og prøv igjen." />;
}
