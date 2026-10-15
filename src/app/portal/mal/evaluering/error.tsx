"use client";

import { PHIupFeil } from "@/components/portal/precision/PHIupTilstand";

export default function EvalueringFeil({ reset }: { reset: () => void }) {
  return <PHIupFeil tittel="Evalueringen kunne ikke hentes"
    tekst="Prøv igjen. Hvis du var i ferd med å lagre, kontroller siste lagrede revisjon før du fortsetter." onProvIgjen={reset} />;
}
