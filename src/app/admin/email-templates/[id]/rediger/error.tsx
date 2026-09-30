"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);
  return (
    <AgencyOSSkall navn="">
      <div className="pa-side">
        <FeilTilstand icon={TriangleAlert} title="Malen kunne ikke hentes" text="Ingenting er endret eller sendt. Prøv igjen." code={error.digest} retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
      </div>
    </AgencyOSSkall>
  );
}
