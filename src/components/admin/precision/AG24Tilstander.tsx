"use client";

/** Laster- og feiluttrykk for AG-24 Drift. Brukes av loading.tsx og error.tsx i de fire rutene. */
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { FeilTilstand, Knapp, LasterTilstand } from "@/components/precision/pa";
import "@/styles/precision-a24.css";

export function AG24Laster({ text }: { text: string }) {
  return <AgencyOSSkall navn=""><div className="pa-side pa-a24-side"><LasterTilstand text={text} /></div></AgencyOSSkall>;
}

export function AG24Feil({ title, error, reset }: { title: string; error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);
  return <AgencyOSSkall navn="">
    <div className="pa-side pa-a24-side">
      <FeilTilstand icon={TriangleAlert} title={title} text="Ingenting er endret. Prøv igjen om litt." code={error.digest} retry={<Knapp variant="secondary" onClick={reset}>Prøv igjen</Knapp>} />
    </div>
  </AgencyOSSkall>;
}
