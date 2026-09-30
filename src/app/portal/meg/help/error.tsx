"use client";

/* Feilside for /portal/meg/help i Precision Athletics (PH-25). */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Feil } from "@/components/portal/precision/PH25Abonnement";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Feil
        reset={reset}
        kicker="Meg · Hjelp"
        title="Hjelpesenter"
        tittel="Hjelpesenteret kunne ikke hentes"
        tekst="Prøv igjen, eller skriv til support@akgolf.no."
        kode="FEIL 502 · HJELP"
        tilbake={{ href: "/portal/meg", tekst: "Til Meg" }}
      />
    </PlayerHQSkall>
  );
}
