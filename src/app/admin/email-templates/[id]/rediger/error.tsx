"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp } from "@/components/precision/pa";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[email-template-editor]", error.digest ?? "load-failed");
  }, [error]);
  return (
    <AgencyOSSkall navn="">
      <div className="pa-side">
        <FeilTilstand icon={TriangleAlert} title="Malen kunne ikke hentes" text="Forrige handling kan ha blitt fullført. Last siden på nytt for å kontrollere status." code={error.digest} retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
      </div>
    </AgencyOSSkall>
  );
}
