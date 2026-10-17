"use client";

/* AG-A03: /admin/analyse viser Precision-feil; underrutene beholder V2Feil. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CircleAlert, RotateCw } from "lucide-react";
import { V2Feil } from "@/components/v2/feil-laste";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import { AnalyseTopp } from "@/components/admin/precision/AGA03Analyse";

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

  if (pathname === "/admin/analyse") return <AgencyOSSkall navn="Coach"><div className="pa-side">
    <AnalyseTopp fane={null} />
    <FeilTilstand icon={CircleAlert} title="Innsikten kunne ikke hentes" text="Ingen planer er endret. Prøv igjen om litt."
      code={`FEIL · INNSIKT · AG-A03${error.digest ? ` · ${error.digest}` : ""}`}
      retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
  </div></AgencyOSSkall>;
  return <V2Feil reset={reset} tilbakeHref="/admin/agencyos" />;
}
