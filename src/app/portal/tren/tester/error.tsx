"use client";

import { useEffect } from "react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[tester/error]", error.digest, error);
  }, [error]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <SdFeil tittel="Testene kunne ikke hentes" tekst="Resultatene dine er trygge. Prøv igjen om litt." reset={reset} />
    </PlayerHQSkall>
  );
}
