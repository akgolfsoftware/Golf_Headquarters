"use client";

/* Tynn error.tsx (W4 rest-detaljer, 2026-08-13) — logger error.digest, rendrer V2Feil.
   Endre visuelt uttrykk i src/components/v2/feil-laste.tsx, ikke her. */

import { useEffect } from "react";
import { V2Feil } from "@/components/v2/feil-laste";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);

  return <V2Feil reset={reset} tilbakeHref="/admin/agencyos" />;
}
