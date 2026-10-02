"use client";

/* Spiller 360 (AG-08) og de porterte undersidene viser Precision-feil; resten beholder V2Feil. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CircleAlert, RotateCw } from "lucide-react";
import { V2Feil } from "@/components/v2/feil-laste";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

const PORTERT = /^\/admin\/spillere\/[^/]+(\/(turnering-kobling|plan\/[^/]+\/for-og-na))?$/;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() ?? "";
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);

  if (PORTERT.test(pathname)) return <AgencyOSSkall navn="Coach"><div className="pa-side">
    <FeilTilstand icon={CircleAlert} title="Spilleren kunne ikke hentes" text="Ingen felt er endret. Prøv igjen."
      retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
  </div></AgencyOSSkall>;
  return (
    <V2Feil
      reset={reset}
      tilbakeHref="/admin/spillere"
      tittel="Ingen forbindelse"
      melding="Kunne ikke hente SG og tester. Plan vises fra siste synk."
    />
  );
}
