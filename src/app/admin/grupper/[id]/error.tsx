"use client";

/* AG-16a har eget feil-uttrykk. Årsplan og skoledata er ikke portert og
   beholder V2Feil. Logger error.digest som før. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { UsersRound } from "lucide-react";
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

  if (/^\/admin\/grupper\/[^/]+(\/timeplan)?$/.test(sti)) {
    const timeplan = sti.endsWith("/timeplan");
    return (
      <AgencyOSSkall navn="">
        <div className="pa-side">
          <FeilTilstand icon={UsersRound} title={timeplan ? "Timeplanen kunne ikke hentes" : "Gruppen kunne ikke hentes"} text={timeplan ? "Ingen tider er endret. Prøv igjen." : "Ingen medlemskap er endret. Prøv igjen."} code={error.digest} retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
        </div>
      </AgencyOSSkall>
    );
  }
  return <V2Feil reset={reset} tilbakeHref="/admin/agencyos" />;
}
