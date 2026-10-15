"use client";

import { PHKommunikasjonFeil } from "@/components/portal/precision/PHKommunikasjonFeil";

export default function BookingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PHKommunikasjonFeil error={error} reset={reset} kontekst="portal-booking-error"
    tittel="Bookingsystemet svarer ikke" tekst="Ingen timer er booket eller endret. Prøv igjen om litt." />;
}
