"use client";

import { useEffect } from "react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHIupFeil } from "@/components/portal/precision/PHIupTilstand";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[gameplan/error]", error.digest, error);
  }, [error]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PHIupFeil tittel="Banekartet kunne ikke hentes" tekst="Slagene og gameplanene dine er ikke endret. Prøv igjen." onProvIgjen={reset} />
    </PlayerHQSkall>
  );
}
