"use client";

import { useState, useTransition, type CSSProperties } from "react";
import type { TnAvsluttResultat, TnLeggTilResultat, TnTrenerRolle } from "@/lib/domain/tn-tilgang";
import { TN } from "@/lib/v2/team-norway";

/**
 * TN-19: handlingene på Trenere og tilgang.
 * Avslutt tilgang er grafitt i et kort med rød kant — aldri en rød knapp.
 */

const knapp = (fylt: boolean): CSSProperties => ({
  minHeight: 44,
  padding: "0 16px",
  borderRadius: TN.radius.sm,
  border: `1px solid ${TN.navy900}`,
  background: fylt ? TN.navy900 : TN.white,
  color: fylt ? TN.white : TN.navy900,
  fontFamily: TN.font.display,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  cursor: "pointer",
});

const grafitt: CSSProperties = { ...knapp(true), background: TN.ink900, borderColor: TN.ink900 };

export function TnAvsluttTilgang({ navn, avslutt }: { navn: string; avslutt: () => Promise<TnAvsluttResultat> }) {
  const [apen, setApen] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();

  if (!apen) {
    return <button type="button" onClick={() => setApen(true)} style={knapp(false)}>Avslutt tilgang</button>;
  }
  return (
    <div role="group" aria-label={`Avslutt tilgang for ${navn}`} style={{ flexBasis: "100%", border: `1px solid ${TN.red600}`, borderRadius: TN.radius.sm, padding: 16, background: TN.white }}>
      <div style={{ fontSize: 15, fontWeight: 700 }}>Avslutt tilgang for {navn}?</div>
      <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.6, color: TN.textSecondary }}>{navn} mister tilgangen til gruppen med en gang. Innlegg, økter og testresultater som er registrert, blir liggende.</p>
      {feil ? <p role="alert" style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6 }}>{feil}</p> : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <button
          type="button"
          disabled={venter}
          style={grafitt}
          onClick={() =>
            start(async () => {
              try {
                const r = await avslutt();
                if (!r.ok) setFeil(`${navn} er siste trener i ${r.gruppeNavn}. Gi en annen person trenerrollen først, ellers står ${r.antallSpillere} spillere uten trener.`);
              } catch {
                setFeil("Tilgangen ble ikke avsluttet. Prøv igjen.");
              }
            })
          }
        >
          {venter ? "Avslutter …" : "Avslutt tilgang"}
        </button>
        <button type="button" onClick={() => { setApen(false); setFeil(null); }} style={knapp(false)}>Avbryt</button>
      </div>
    </div>
  );
}

const FEILTEKST: Record<Exclude<TnLeggTilResultat, { ok: true }>["reason"], string> = {
  "ingen-konto": "Ingen AK Golf-konto har denne e-posten. Personen må opprette en konto først.",
  "er-spiller": "Personen er spiller i gruppen. En spiller gjøres ikke om til trener her.",
  "har-tilgang": "Personen har allerede tilgang til gruppen.",
};

export function TnLeggTilTrener({ leggTil }: { leggTil: (epost: string, rolle: TnTrenerRolle) => Promise<TnLeggTilResultat> }) {
  const [epost, setEpost] = useState("");
  const [rolle, setRolle] = useState<TnTrenerRolle>("ASSISTANT");
  const [melding, setMelding] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [venter, start] = useTransition();

  const felt: CSSProperties = { width: "100%", minHeight: 44, padding: "0 12px", border: `1px solid ${TN.navy300}`, borderRadius: TN.radius.sm, background: TN.white, fontFamily: TN.font.body, fontSize: 15, color: TN.textPrimary };
  const etikett: CSSProperties = { display: "block", fontFamily: TN.font.display, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: TN.textSecondary, marginBottom: 6 };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(epost.trim())) {
          setMelding({ ok: false, tekst: "Skriv en gyldig e-postadresse." });
          return;
        }
        start(async () => {
          try {
            const r = await leggTil(epost.trim(), rolle);
            if (r.ok) {
              setMelding({ ok: true, tekst: `${r.navn} har fått tilgang som ${rolle === "COACH" ? "Trener" : "Assist Coach"}.` });
              setEpost("");
            } else setMelding({ ok: false, tekst: FEILTEKST[r.reason] });
          } catch {
            setMelding({ ok: false, tekst: "Tilgangen ble ikke lagret. Prøv igjen." });
          }
        });
      }}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 14, alignItems: "end", marginTop: 16 }}
    >
      <label style={{ minWidth: 0 }}>
        <span style={etikett}>E-post</span>
        <input type="email" required value={epost} onChange={(e) => { setEpost(e.target.value); setMelding(null); }} placeholder="navn@golfforbundet.no" style={felt} />
      </label>
      <label style={{ minWidth: 0 }}>
        <span style={etikett}>Rolle</span>
        <select value={rolle} onChange={(e) => setRolle(e.target.value as TnTrenerRolle)} style={felt}>
          <option value="ASSISTANT">Assist Coach</option>
          <option value="COACH">Trener</option>
        </select>
      </label>
      <button type="submit" disabled={venter} style={knapp(true)}>{venter ? "Lagrer …" : "Gi tilgang"}</button>
      {melding ? <p role={melding.ok ? "status" : "alert"} style={{ gridColumn: "1 / -1", margin: 0, fontSize: 14, lineHeight: 1.6, color: TN.textPrimary }}>{melding.tekst}</p> : null}
    </form>
  );
}
