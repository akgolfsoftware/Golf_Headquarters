"use client";

import { Knapp } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

export default function EvalueringFeil({ reset }: { reset: () => void }) {
  return <div className="pa-root pa-side"><section className="pa-state pa-state--error" role="alert"><h1 className="pa-state__title">Evalueringen kunne ikke hentes</h1><p>Prøv igjen. Hvis du var i ferd med å lagre, kontroller siste lagrede revisjon før du fortsetter.</p><Knapp type="button" onClick={reset}>Prøv igjen</Knapp></section></div>;
}
