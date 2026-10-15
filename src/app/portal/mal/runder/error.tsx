"use client";

import { PHRunderFeilside } from "@/components/portal/precision/PHRunderFeilside";

export default function Feil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PHRunderFeilside error={error} reset={reset} kontekst="portal-runder-error" tittel="Rundene kunne ikke hentes" tekst="Ingen runder er slettet. Prøv igjen om litt." />;
}
