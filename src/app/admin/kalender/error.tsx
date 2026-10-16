"use client";

/* AG-05 i Precision Athletics har eget feil-uttrykk. Undersidene er ikke
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

  if (sti === "/admin/kalender") {
    return (
      <AgencyOSSkall navn="">
        <div className="pa-side">
          <FeilTilstand icon={CalendarX} title="Kalenderen kunne ikke hentes" text="Ingen hendelser er endret. Bookinger fra spillere tas vare på." code={error.digest} retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
        </div>
      </AgencyOSSkall>
    );
  }
  return (
    <V2Feil
      reset={reset}
      tilbakeHref="/admin/agencyos"
      tittel="Ingen forbindelse"
      melding="Kalenderen kunne ikke hentes. Viser sist lagrede uke."
    />
  );
}
