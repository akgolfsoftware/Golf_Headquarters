"use client";

import { CloudOff, RotateCw } from "lucide-react";
import { FeilTilstand, Knapp } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

export default function FireukerssjekkFeil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const dato = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
  return <div className="pa-root pa-side">
    <FeilTilstand icon={CloudOff} title="Fireukerssjekken kunne ikke hentes" text="Ingen svar er endret. Prøv igjen."
      code={`FEIL 503 · IUP · ${dato}${error.digest ? ` · ${error.digest}` : ""}`}
      retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>} />
  </div>;
}
