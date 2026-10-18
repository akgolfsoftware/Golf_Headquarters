"use client";

import { useEffect } from "react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { SdFeil } from "@/components/portal/precision/PHStatsDybdeFelles";
import { reportClientError } from "@/lib/report-client-error";

export default function OmradeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError({ context: "portal-omrade-error", message: error.message, stack: error.stack, digest: error.digest }).catch(() => {
      // Varsling skal aldri krasje feilsiden selv
    });
  }, [error]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <SdFeil tittel="Området kunne ikke hentes" tekst="Rundene og øktene dine er trygge. Prøv igjen om litt." reset={reset} />
    </PlayerHQSkall>
  );
}
