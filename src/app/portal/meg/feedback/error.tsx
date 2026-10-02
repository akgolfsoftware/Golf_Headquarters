"use client";

/* Feilside for /portal/meg/feedback i Precision Athletics (PH-25). */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Feil } from "@/components/portal/precision/PH25Abonnement";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Feil
        reset={reset}
        kicker="Meg · Tilbakemelding"
        title="Tilbakemelding"
        tittel="Siden kunne ikke hentes"
        tekst="Ingenting er sendt. Prøv igjen."
        kode="FEIL 502 · TILBAKEMELDING"
        tilbake={{ href: "/portal/meg", tekst: "Til Meg" }}
      />
    </PlayerHQSkall>
  );
}
