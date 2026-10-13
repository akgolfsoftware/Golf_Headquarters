"use client";
import { useState, useTransition } from "react";
import { Knapp } from "@/components/precision/pa";
import { slettHendelse } from "@/lib/kalender-hendelse/actions";
export function SlettKnapp({ id }: { id: string }) {
  const [bekreft, setBekreft] = useState(false);
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
    {!bekreft ? <Knapp variant="ghost" onClick={() => setBekreft(true)}>Slett hendelse</Knapp> : <>
      <p>Vil du slette denne hendelsen fra kalenderen?</p>
      <Knapp variant="ghost" onClick={() => { setBekreft(false); setFeil(null); }} disabled={pending}>Avbryt</Knapp>
      <Knapp loading={pending} loadingText="Sletter …" onClick={() => start(async () => {
        setFeil(null); try { await slettHendelse(id); } catch (err) {
          if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) return;
          setFeil("Hendelsen kunne ikke slettes. Prøv igjen.");
        }
      })}>Slett hendelse</Knapp>
    </>}{feil && <p role="alert">{feil}</p>}
  </div>;
}
