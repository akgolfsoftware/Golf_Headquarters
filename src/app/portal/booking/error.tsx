"use client";

/* Feil-tilstand for booking (Precision Athletics PH-23: «Ledige tider kunne ikke hentes»). Dekker alle ruter under /portal/booking. */

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FeilTilstand, Knapp, KnappLenke } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[booking/error]", error.digest, error);
  }, [error]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <Side max={720}>
        <SideHode kicker="Meg · Booking" title="Book time" />
        <FeilTilstand
          icon={CircleAlert}
          title="Ledige tider kunne ikke hentes"
          text="Ingen timer er booket eller endret. Prøv igjen."
          code="FEIL 502 · BOOKING"
          retry={<><Knapp onClick={reset}>Prøv igjen</Knapp><KnappLenke variant="ghost" href="/portal">Til I dag</KnappLenke></>}
        />
      </Side>
    </PlayerHQSkall>
  );
}
