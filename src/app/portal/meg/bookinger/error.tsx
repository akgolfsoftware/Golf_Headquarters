"use client";

/* Feil-tilstand for /portal/meg/bookinger og flytt time (Precision Athletics PH-23). */

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp, KnappLenke } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[bookinger/error]", error.digest, error);
  }, [error]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <Side max={720}>
        <SideHode kicker="Meg · Booking" title="Mine bookinger" />
        <FeilTilstand
          icon={CircleAlert}
          title="Bookingene kunne ikke hentes"
          text="Ingen timer er endret. Prøv igjen."
          code="FEIL 502 · BOOKING"
          retry={<><Knapp onClick={reset}>Prøv igjen</Knapp><KnappLenke variant="ghost" href="/portal/meg">Til Meg</KnappLenke></>}
        />
      </Side>
    </PlayerHQSkall>
  );
}
