"use client";

/* Deles av /portal/meg og alle undersider (abonnement, dokumenter,
   feedback, foreldre, help, helse, innstillinger, profil, sikkerhet,
   utstyrsbag) som ikke har egen error.tsx. */

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

  return <V2Feil reset={reset} tilbakeHref="/portal/meg" />;
}
