"use client";

/* AG-06 i Precision Athletics har eget feil-uttrykk. Undersidene er ikke
   portert og beholder V2Feil. Logger error.digest som før. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CalendarX } from "lucide-react";
import { V2Feil } from "@/components/v2/feil-laste";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const sti = usePathname();
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);

  if (sti === "/admin/bookinger") {
    return (
      <AgencyOSSkall navn="">
        <div className="pa-side">
          <FeilTilstand icon={CalendarX} title="Bookingene kunne ikke hentes" text="Ingen bookinger er endret. Spillerne ser fortsatt sine bekreftede timer." code={error.digest} retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
        </div>
      </AgencyOSSkall>
    );
  }
  return <V2Feil reset={reset} tilbakeHref="/admin/agencyos" />;
}
