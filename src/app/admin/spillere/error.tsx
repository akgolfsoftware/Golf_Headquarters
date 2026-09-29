"use client";

/* AG-07 Stall viser Precision-feil; underruter uten egen error.tsx beholder V2Feil. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CircleAlert, RotateCw } from "lucide-react";
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
  const pathname = usePathname();
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);

  if (pathname === "/admin/spillere") return <AgencyOSSkall navn="Coach"><div className="pa-side">
    <FeilTilstand icon={CircleAlert} title="Stallen kunne ikke hentes" text="Ingen spillere er endret. Prøv igjen."
      retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
  </div></AgencyOSSkall>;
  return <V2Feil reset={reset} tilbakeHref="/admin/agencyos" />;
}
