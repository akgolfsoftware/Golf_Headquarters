"use client";

/* PH-13 Øvelsesbank: feiltilstand i nytt design. Dekker også øvelsen og break-tabellen. */
import { OvFeil } from "@/components/portal/precision/PH13Feil";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <OvFeil error={error} reset={reset} kontekst="portal-drills-error" tittel="Øvelsene kunne ikke hentes"
    tekst="Ingen øvelser er slettet. Øvelsene i planlagte økter ligger i selve økta og virker som før." />;
}
