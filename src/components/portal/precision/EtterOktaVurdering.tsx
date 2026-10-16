"use client";

/**
 * Vurderingen etter økta (PH-07, pakke 2 Treningsøkta). Fasit: utkast-playerhq/treningsokt.html, `slider()`.
 * Golføkt: Belastning og Fokus 1–10. Fysisk økt: «Hvor tungt» 1–10.
 * Ingen forhåndsvalgt verdi: tallet står som «—» til spilleren har valgt.
 */

import { useId, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Ikon } from "@/components/precision/pa";
import type { OktType } from "@/lib/workbench/etter-okta";

export type VurderingLagre = (input: { belastning: number; fokus: number | null }) => Promise<{ ok: boolean; error?: string }>;

export function EtterOktaVurdering({
  type,
  belastning: lagretBelastning,
  fokus: lagretFokus,
  onLagre,
  knappTekst = "Lagre vurderingen",
}: {
  type: OktType;
  belastning: number | null;
  fokus: number | null;
  onLagre: VurderingLagre;
  knappTekst?: string;
}) {
  const golf = type === "golf";
  const [belastning, setBelastning] = useState<number | null>(lagretBelastning);
  const [fokus, setFokus] = useState<number | null>(lagretFokus);
  const [lagret, setLagret] = useState(lagretBelastning != null && (!golf || lagretFokus != null));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const klar = belastning != null && (!golf || fokus != null);

  function lagre() {
    if (!klar || pending) return;
    setFeil(null);
    start(async () => {
      try {
        const res = await onLagre({ belastning: belastning!, fokus: golf ? fokus : null });
        if (!res.ok) { setFeil(res.error ?? "Vurderingen ble ikke lagret. Prøv igjen."); return; }
        setLagret(true);
      } catch {
        setFeil("Vurderingen ble ikke lagret. Prøv igjen.");
      }
    });
  }

  return <section className="phn-kort phn-vurdering-kort" aria-label="Hvordan var økta">
    <Glider tittel={golf ? "Belastning" : "Hvor tungt"} lav="svært lett" hoy="maks" verdi={belastning} hjelp={golf ? "Hvor tung økta føltes." : null}
      laast={lagret || pending} onChange={setBelastning} />
    {golf && <Glider tittel="Fokus" lav="ukonsentrert" hoy="helt til stede i hvert slag" verdi={fokus} hjelp={null}
      laast={lagret || pending} onChange={setFokus} />}
    {feil && <p className="phn-feil" role="alert">{feil}</p>}
    {lagret
      ? <p className="phn-pille ok" role="status" style={{ justifySelf: "start" }}><Ikon icon={Check} size={16} name="check" />Vurderingen er lagret</p>
      : <div className="phn-knapper"><button type="button" className="phn-knapp pri stor" onClick={lagre} disabled={!klar || pending}>
        <Ikon icon={Check} size={20} name="check" />{pending ? "Lagrer …" : knappTekst}</button></div>}
    {!lagret && !klar && <p className="sub">Velg {golf ? "begge tallene" : "et tall"} for å lagre.</p>}
  </section>;
}

function Glider({ tittel, lav, hoy, verdi, hjelp, laast, onChange }: {
  tittel: string; lav: string; hoy: string; verdi: number | null; hjelp: string | null; laast: boolean; onChange: (v: number) => void;
}) {
  const id = useId();
  return <div className="vurdering">
    <div className="topp-rad"><label htmlFor={id}>{tittel}</label><span className="verdi">{verdi ?? "—"}<small>av 10</small></span></div>
    <input type="range" id={id} min={1} max={10} step={1} value={verdi ?? 5} disabled={laast}
      data-uvalgt={verdi == null ? "" : undefined} aria-valuetext={verdi == null ? "Ikke valgt" : `${verdi} av 10`}
      onChange={(e) => onChange(Number(e.target.value))} onClick={(e) => onChange(Number((e.target as HTMLInputElement).value))} />
    <div className="skala-rad"><span>1 · {lav}</span><span>10 · {hoy}</span></div>
    {hjelp && <span className="sub">{hjelp}</span>}
  </div>;
}
