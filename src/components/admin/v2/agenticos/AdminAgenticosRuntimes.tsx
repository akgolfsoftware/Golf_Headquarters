"use client";

/**
 * AO-02 Runtimes + AO-10 Ollama. Status er ærlig: bare Claude er koblet i appen.
 * Hvit prikk = på. Ok-grønn brukes ikke.
 *
 * Fasit: designsystem/train-lock/AO-02 Runtimes og Ollama.dc.html,
 * AO-00 LOCK Run Skills Tilstander.dc.html (§AO-11 runtime nede).
 */

import { TL } from "@/lib/v2/train-lock";
import { AGENTICOS_RUNTIMES } from "@/lib/agencyos/agenticos-ia";
import { AoCaps, AoKort, AoPrikk, AoToggle, AoTittel } from "./tl-agenticos";

export function AdminAgenticosRuntimes({ kjoringerIdag }: { kjoringerIdag: number }) {
  const paa = AGENTICOS_RUNTIMES.filter((r) => r.koblet).length;
  const av = AGENTICOS_RUNTIMES.length - paa;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div data-screen-label="AO-02 Runtimes" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <AoTittel size={20}>Runtimes</AoTittel>
          <span style={{ fontSize: 12, color: TL.mute }}>
            {paa} på · {av} av
          </span>
        </div>
        <div>
          {AGENTICOS_RUNTIMES.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 0",
                borderTop: `1px solid ${TL.hair}`,
                borderBottom: i === AGENTICOS_RUNTIMES.length - 1 ? `1px solid ${TL.hair}` : undefined,
                opacity: r.koblet ? 1 : 0.45,
                minWidth: 0,
              }}
            >
              <AoPrikk color={r.koblet ? TL.text : TL.mute} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: TL.text, minWidth: 0 }}>{r.navn}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: r.kind === "LOKAL" ? TL.text : TL.mute,
                  width: 46,
                  flexShrink: 0,
                }}
              >
                {r.kind}
              </span>
              <span style={{ fontSize: 10, color: TL.mute, width: 132, flexShrink: 0 }} className="hidden min-[700px]:block">
                {r.startRegel}
              </span>
              <span style={{ fontSize: 11, color: TL.mute }} className="hidden min-[900px]:block">
                {r.meta}
              </span>
              <span style={{ fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums", flex: "none" }}>
                {r.koblet ? (kjoringerIdag === 0 ? "Klar" : `${kjoringerIdag} kjøringer i dag`) : "Av"}
              </span>
              <AoToggle paa={r.koblet} />
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 11, color: TL.mute, lineHeight: 1.6 }}>
          Skru av en runtime, og tasks tildelt den blir stående som Klar til du velger en annen. Ingenting kjøres om.
          Bryterne her er visning — de lagrer ikke.
        </p>
      </div>

      <div data-screen-label="AO-10 Ollama" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AoPrikk color={TL.mute} />
          <AoTittel size={20}>Ollama · lokal</AoTittel>
        </div>
        <AoKort pad="12px 14px" radius={14} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" stroke={TL.text} strokeWidth="2" />
            <path d="M8 11 V7 a4 4 0 0 1 8 0 V11" stroke={TL.text} strokeWidth="2" fill="none" />
          </svg>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: TL.text }}>
            Data forlater ikke maskinen når Ollama kjører. Den lever på Mac Mini — ikke i denne sky-appen, derfor av
            her.
          </span>
        </AoKort>
        <AoCaps>Modeller</AoCaps>
        <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
          Ingen modeller lastet her. Helsesjekk og modell-lasting skjer på maskinen der Ollama kjører, ikke fra
          AgencyOS.
        </p>
      </div>
    </div>
  );
}
