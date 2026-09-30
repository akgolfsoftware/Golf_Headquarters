"use client";

/* Feilside for /portal/meg/innstillinger i Precision Athletics (PH-25). */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Feil } from "@/components/portal/precision/PH25Abonnement";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Feil
        reset={reset}
        kicker="Meg · Innstillinger"
        title="Innstillinger"
        tittel="Innstillingene kunne ikke hentes"
        tekst="Ingenting er endret. Prøv igjen."
        kode="FEIL 502 · INNSTILLINGER"
        tilbake={{ href: "/portal/meg", tekst: "Til Meg" }}
      />
    </PlayerHQSkall>
  );
}
