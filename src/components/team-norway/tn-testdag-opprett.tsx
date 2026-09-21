"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { opprettTestdag } from "@/app/team-norway/tn-testdag-actions";
import { TnKnapp, TnInput } from "./core";
import { TN } from "@/lib/v2/team-norway";

export type TnOpprettSpiller = { id: string; navn: string };
export type TnOpprettProtokoll = { id: string; navn: string };

/**
 * TN-03 — opprett testdag: tittel, sted, tidspunkt, protokoll og deltakere.
 * Etter opprettelse navigeres det direkte til DENNE dagens kø (`?dag=<id>`)
 * — aldri til «nyeste», som review 14.09 påpekte ville vært feil ved flere
 * dager samtidig.
 */
export function TnOpprettTestdag({ spillere, protokoller }: { spillere: TnOpprettSpiller[]; protokoller: TnOpprettProtokoll[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [protocolId, setProtocolId] = useState(protokoller[0]?.id ?? "");
  const [valgte, setValgte] = useState<Set<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setFeil(null);
        // <input type="datetime-local"> er en NAIV streng uten tidssone —
        // tolket forskjellig på en Mac i Oslo vs. en server i UTC. new Date()
        // på en streng UTEN tidssone-suffiks tolkes av nettleseren i BRUKERENS
        // lokale tid (riktig her — coachen skriver inn Oslo-klokketid), og
        // .toISOString() gjør den om til et eksakt, tidssoneuavhengig
        // tidspunkt før den sendes til serveren.
        const lokalDato = new Date(scheduledAt);
        if (Number.isNaN(lokalDato.getTime())) {
          setFeil("Ugyldig tidspunkt.");
          return;
        }
        start(async () => {
          try {
            const resultat = await opprettTestdag({
              title,
              location: location || undefined,
              scheduledAt: lokalDato.toISOString(),
              protocolId,
              spillerIder: [...valgte],
            });
            if (!resultat.ok) {
              setFeil(resultat.error);
              return;
            }
            router.push(`/team-norway/fellestesting?dag=${resultat.testDayId}`);
          } catch {
            setFeil("Kunne ikke opprette testdagen (nettverksfeil). Prøv igjen.");
          }
        });
      }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <TnInput label="Navn på testdagen" value={title} onChange={setTitle} placeholder="F.eks. Fellestesting putting — september" required />
      <TnInput label="Sted (valgfritt)" value={location} onChange={setLocation} placeholder="F.eks. Fredrikstad Golfklubb" />
      <TnInput label="Tidspunkt" type="datetime-local" value={scheduledAt} onChange={setScheduledAt} required />

      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>
        Protokoll
        <select
          value={protocolId}
          onChange={(e) => setProtocolId(e.target.value)}
          style={{ minHeight: 44, borderRadius: TN.radius.md, border: `1px solid ${TN.borderSubtle}`, padding: "0 12px", fontSize: TN.text.sm }}
        >
          {protokoller.map((p) => (
            <option key={p.id} value={p.id}>{p.navn}</option>
          ))}
        </select>
      </label>

      <fieldset style={{ border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.md, padding: 14 }}>
        <legend style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900, padding: "0 4px" }}>
          Deltakere ({valgte.size} valgt)
        </legend>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
          {spillere.map((spiller) => (
            <label key={spiller.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, fontSize: TN.text.sm, color: TN.navy900 }}>
              <input
                type="checkbox"
                checked={valgte.has(spiller.id)}
                onChange={(e) => {
                  const neste = new Set(valgte);
                  if (e.target.checked) neste.add(spiller.id);
                  else neste.delete(spiller.id);
                  setValgte(neste);
                }}
              />
              {spiller.navn}
            </label>
          ))}
          {spillere.length === 0 && <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm }}>Ingen aktive spillere i gruppen.</p>}
        </div>
      </fieldset>

      {feil && <p role="alert" style={{ margin: 0, color: TN.red600, fontSize: TN.text.sm }}>{feil}</p>}
      <TnKnapp type="submit" variant="primaer" disabled={venter || valgte.size === 0 || !title.trim() || !scheduledAt}>
        {venter ? "Starter testdag …" : "Start testdag"}
      </TnKnapp>
    </form>
  );
}
