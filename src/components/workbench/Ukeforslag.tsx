"use client";

/** Bevarer spillerens ukeforslag i Precision Workbench med eksisterende tilgangsvakter. */
import { useRef, useState } from "react";
import { Knapp } from "@/components/precision/pa";
import { Ark } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { applySuggestedWeek, suggestWeekWithCaddie } from "@/app/portal/planlegge/workbench/actions";
import type { WeekSuggestion } from "@/lib/ai-plan/week-suggest";
import { mondayOf } from "@/lib/domain/workbench/operations";
import { osloIdag } from "./WeekGrid";

const NAVN = { konservativ: "Konservativ", standard: "Standard", aggressiv: "Aggressiv" };
const DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

export function Ukeforslag({ weekStart, onLagret }: {
  weekStart: string;
  onLagret: () => Promise<void>;
}) {
  const opptatt = useRef(false);
  const [laster, setLaster] = useState(false);
  const [forslag, setForslag] = useState<{ suggestions: WeekSuggestion[]; usedAi: boolean } | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  // Begge er norske mandagsdatoer. UTC-differansen påvirkes ikke av sommertid.
  const weekOffset = Math.round((Date.parse(weekStart) - Date.parse(mondayOf(osloIdag()))) / 604_800_000);

  async function hent() {
    if (opptatt.current) return;
    opptatt.current = true;
    setLaster(true);
    setFeil(null);
    setMelding(null);
    try {
      const res = await suggestWeekWithCaddie(weekOffset);
      if (res.ok && res.suggestions?.length) setForslag({ suggestions: res.suggestions, usedAi: res.usedAi ?? false });
      else setFeil(res.message ?? "Kunne ikke lage ukeforslag.");
    } catch {
      setFeil("Kunne ikke hente ukeforslag. Prøv igjen.");
    } finally {
      opptatt.current = false;
      setLaster(false);
    }
  }

  async function bruk(variant: WeekSuggestion) {
    if (opptatt.current) return;
    opptatt.current = true;
    setLaster(true);
    setFeil(null);
    try {
      const res = await applySuggestedWeek(variant, weekOffset);
      if (!res.ok) { setFeil(res.error ?? "Kunne ikke lagre forslaget."); return; }
      setForslag(null);
      setMelding(`${res.count ?? 0} økter lagt inn i uka.`);
      await onLagret();
    } catch {
      setFeil("Lagringen kunne ikke bekreftes. Last inn uka før du prøver igjen.");
    } finally {
      opptatt.current = false;
      setLaster(false);
    }
  }

  return <>
    <Knapp variant="secondary" size="sm" disabled={laster} onClick={() => void hent()}>{laster ? "Arbeider…" : "Foreslå uke"}</Knapp>
    {melding && <span role="status">{melding}</span>}
    {feil && !forslag && <InlineVarsel tone="warn" tittel="Ukeforslag">{feil}</InlineVarsel>}
    {forslag && <Ark open title="Forslag til uka" onClose={() => { if (!opptatt.current) setForslag(null); }}>
      <p>{forslag.usedAi ? "Tre varianter basert på planen din. Velg den som passer uka." : "Standardforslag (uten AI) — tre varianter du kan bruke som utgangspunkt."}</p>
      {forslag.suggestions.map((s) => <section key={s.variant} className="pa-card a9-kort" aria-label={NAVN[s.variant]}>
        <h3>{NAVN[s.variant]}</h3>
        <p>{s.totalSessions} økter · {s.focusBlend}</p>
        <ul>{s.sessions.map((okt, i) => <li key={i}>{DAGER[okt.day]} · {okt.pyramidArea} · {okt.title} · {okt.durationMin} min</li>)}</ul>
        <Knapp variant="secondary" disabled={laster} onClick={() => void bruk(s)}>Bruk forslag</Knapp>
      </section>)}
      {feil && <InlineVarsel tone="warn" tittel="Ukeforslag">{feil}</InlineVarsel>}
    </Ark>}
  </>;
}
