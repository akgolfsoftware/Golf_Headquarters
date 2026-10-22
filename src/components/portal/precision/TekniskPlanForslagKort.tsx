"use client";

/**
 * A2: forslag fra Team Norway-treneren til den tekniske planen. Spilleren bestemmer: planen endres først
 * når spilleren trykker «Godta». Skjules når det ikke finnes ubesvarte forslag.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { svarPaTekniskPlanForslag } from "@/lib/teknisk-plan/trener-forslag-actions";
import type { TekniskPlanForslagRad } from "@/lib/teknisk-plan/trener-forslag-les";

export function TekniskPlanForslagKort({ forslag }: { forslag: TekniskPlanForslagRad[] }) {
  const router = useRouter();
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  if (forslag.length === 0) return null;

  function svar(actionId: string, beslutning: "ACCEPTED" | "REJECTED") {
    setFeil(null);
    start(async () => {
      const res = await svarPaTekniskPlanForslag({ actionId, beslutning });
      if (!res.ok) setFeil(res.feil);
      router.refresh();
    });
  }

  return (
    <section className="phn-kort" aria-label="Forslag fra treneren" style={{ minWidth: 0 }}>
      <b className="phn-ov-under">Forslag fra treneren</b>
      <p className="phn-forklar">Planen din endres først når du godtar.</p>
      {feil && <p className="phn-forklar" role="alert">{feil}</p>}
      {forslag.map((f) => (
        <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          <p className="phn-forklar" style={{ margin: 0 }}><b>{f.trener}</b> foreslår: {f.tekst}.</p>
          <div className="phn-knapper">
            <button type="button" className="phn-knapp pri" disabled={venter} onClick={() => svar(f.id, "ACCEPTED")}>Godta</button>
            <button type="button" className="phn-knapp sek" disabled={venter} onClick={() => svar(f.id, "REJECTED")}>Avslå</button>
          </div>
        </div>
      ))}
    </section>
  );
}
