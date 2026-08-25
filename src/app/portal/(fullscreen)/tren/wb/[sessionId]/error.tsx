"use client";

import { useEffect } from "react";
import { V2Feil } from "@/components/v2";

export default function Feil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error.digest ?? error.message);
  }, [error]);

  return <V2Feil reset={reset} tilbakeHref="/portal" tittel="Kunne ikke åpne økten" />;
}
