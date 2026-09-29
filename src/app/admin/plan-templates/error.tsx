"use client";

/* Planmaler (AG-14) viser Precision-feil: detalj, ny og editor er alle portert. */

import { useEffect } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp, KnappLenke } from "@/components/precision/pa";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);

  return <AgencyOSSkall navn="Coach"><div className="pa-side">
    <FeilTilstand icon={CircleAlert} title="Planmalen kunne ikke hentes" text="Ingenting i malen er endret. Prøv igjen, eller gå tilbake til Plan-hub."
      retry={<div className="a10-knapperad" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>
        <KnappLenke variant="ghost" href="/admin/plan">Plan-hub</KnappLenke>
      </div>} />
  </div></AgencyOSSkall>;
}
