"use client";
import { useState, useTransition } from "react";
import { Knapp } from "@/components/precision/pa";
import { oppdaterCoachingEpostUtkast } from "@/lib/email/coaching-oppfolging-actions";

export function CoachingEpostOppdater() {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState(false);
  return <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
    <div><Knapp variant="secondary" loading={pending} loadingText="Sjekker oppfølging …" onClick={() => start(async () => {
      try { const result = await oppdaterCoachingEpostUtkast(); setStatus(result.tekst); setError(false); }
      catch { setStatus("Utkastene kunne ikke oppdateres. Prøv igjen."); setError(true); }
    })}>Oppdater e-postutkast etter coaching</Knapp></div>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }} role={error ? "alert" : "status"}>{status ?? "Takk-utkast kommer fra faktisk fullføring. Senere oppfølging klargjøres her etter 14 dager når ingen ny booking eller PlayerHQ er registrert. Ingenting sendes automatisk."}</p>
  </div>;
}
