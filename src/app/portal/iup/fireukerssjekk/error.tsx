"use client";

import { PHIupFeil } from "@/components/portal/precision/PHIupTilstand";

export default function FireukerssjekkFeil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const dato = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
  return <PHIupFeil tittel="Fireukerssjekken kunne ikke hentes" tekst="Ingen svar er endret. Prøv igjen."
    kode={`Feil 503 · IUP · ${dato}${error.digest ? ` · ${error.digest}` : ""}`} onProvIgjen={reset} />;
}
