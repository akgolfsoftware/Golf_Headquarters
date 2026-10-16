"use client";

import { PHIupFeil } from "@/components/portal/precision/PHIupTilstand";

export default function GameplanFeil({ reset }: { reset: () => void }) {
  return <PHIupFeil tittel="Banen kunne ikke hentes" tekst="Gameplanene dine er ikke endret. Prøv igjen." onProvIgjen={reset} />;
}
