"use client";

/**
 * WORKBENCH · COLDSTART — første fasit-ombygging (G7), portet 1:1 fra
 * docs/redesign-v2/fasit-agencyos-workbench/workbench-coldstart.jsx
 * («Ingen plan for {spiller} ennå» → guidet start, aldri blindgate).
 *
 * Ærlighet: fasitens mål/horisont/dager-chips styrer ingenting ekte ennå og
 * er BEVISST utelatt til motoren tar imot dem (W2.2/Å1 — se
 * workbench-fasit-analyse). Det som vises er ekte: spillerens neste
 * turnering, godkjente planmaler (med «Bruk mal» som faktisk legger inn
 * mal-uke 1), og AI-ukeforslag der actions.suggestWeek finnes.
 */

import { useState } from "react";
import { T, Kort, Knapp, Icon, TomTilstand } from "@/components/v2";
import type { WorkbenchData, WorkbenchPlanTemplate } from "@/lib/workbench/load-workbench";
import { LPHASE_LABEL } from "./WorkbenchV2";

export function WorkbenchColdstart({
  data,
  playerName,
  onBrukMal,
  onForeslaaUke,
  foreslarUke,
  onAarsplan,
}: {
  data: WorkbenchData;
  playerName: string;
  /** Legger inn mal-uke 1 for spilleren (ekte apply-action). Uten = skjul. */
  onBrukMal?: (templateId: string) => Promise<{ ok: boolean; error?: string }>;
  /** AI-ukeforslag (spillerflaten). Uten = skjul primær-CTA. */
  onForeslaaUke?: () => void;
  foreslarUke?: boolean;
  /** 8c.2: års-først-flyten — hopp til årsplan-canvaset og legg periodiseringen først. */
  onAarsplan?: () => void;
}) {
  const [valgtMal, setValgtMal] = useState<string | null>(null);
  const [brukerMal, setBrukerMal] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const maler: WorkbenchPlanTemplate[] = data.planTemplates ?? [];
  const nesteTurnering = data.tournaments?.[0] ?? null;
  const fornavn = playerName.split(" ")[0] || playerName;

  const brukMal = async () => {
    if (!onBrukMal || !valgtMal || brukerMal) return;
    setBrukerMal(true);
    setFeil(null);
    const res = await onBrukMal(valgtMal);
    setBrukerMal(false);
    if (!res.ok) setFeil(res.error ?? "Kunne ikke legge inn malen.");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: 540, maxWidth: "100%" }}>
        {/* Hode — 1:1 fra fasit: ikon-badge + tittel + undertekst */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 58, height: 58, borderRadius: 15, background: `color-mix(in srgb, ${T.lime} 14%, ${T.panel})`, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="calendar" size={26} style={{ color: T.lime }} />
          </div>
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.fg }}>
              Ingen plan for {fornavn} ennå
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.mut, lineHeight: 1.55, margin: "7px auto 0", maxWidth: 380 }}>
              Start fra en godkjent planmal — så finjusterer du uken rett på tidslinja etterpå.
            </p>
          </div>
        </div>

        <Kort pad="20px" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Turnerings-kontekst — EKTE data når den finnes */}
          {nesteTurnering && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}` }}>
              <Icon name="trophy" size={14} style={{ color: T.lime, flex: "none" }} />
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, lineHeight: 1.5 }}>
                Neste turnering: <span style={{ color: T.fg2, fontWeight: 700 }}>{nesteTurnering.tn}</span> · {nesteTurnering.td} — planen bør toppe mot den.
              </span>
            </div>
          )}

          {/* Mal-velger — ekte godkjente maler, fase-merket */}
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut, marginBottom: 9 }}>
              Planmal
            </div>
            {maler.length === 0 ? (
              <TomTilstand icon="layers" title="Ingen godkjente maler" sub="Lag en mal under Plan-maler først." />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {maler.slice(0, 6).map((m) => {
                  const on = valgtMal === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setValgtMal(on ? null : m.id)}
                      disabled={brukerMal}
                      className="v2-press v2-focus"
                      style={{
                        appearance: "none", textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                        background: on ? `color-mix(in srgb, ${T.lime} 12%, ${T.panel2})` : T.panel2,
                        border: `1px solid ${on ? T.lime : T.border}`,
                        transition: "all 120ms",
                      }}
                    >
                      <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: on ? T.lime : T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                      <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 2 }}>
                        {LPHASE_LABEL[m.lPhase] ?? m.lPhase} · {m.sessionCount} økter · {m.varighetUker} uker
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {feil && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</span>}

          {onBrukMal && maler.length > 0 && (
            <Knapp icon="layers" full disabled={!valgtMal || brukerMal} onClick={brukMal}>
              {brukerMal ? "Legger inn…" : "Legg inn første uke fra malen"}
            </Knapp>
          )}

          {onForeslaaUke && (
            <button
              type="button"
              onClick={onForeslaaUke}
              disabled={foreslarUke}
              className="v2-press v2-focus"
              style={{ appearance: "none", height: 36, borderRadius: 10, background: "transparent", border: `1px dashed ${T.borderS}`, color: T.fg2, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: foreslarUke ? 0.6 : 1 }}
            >
              <Icon name="sparkles" size={14} style={{ color: T.lime }} />
              {foreslarUke ? "Foreslår…" : "Eller: la AI-Caddie foreslå uka"}
            </button>
          )}

          {onAarsplan && (
            <button
              type="button"
              onClick={onAarsplan}
              className="v2-press v2-focus"
              style={{ appearance: "none", height: 36, borderRadius: 10, background: "transparent", border: `1px dashed ${T.borderS}`, color: T.fg2, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Icon name="calendar-range" size={14} style={{ color: T.lime }} />
              Eller: legg årsplanen først — perioder, testuker og ferie
            </button>
          )}

          <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut, textAlign: "center" }}>
            Alltid en anbefaling — du kan endre alt på tidslinja etterpå.
          </span>
        </Kort>

        {/* Fasit-note: mål/horisont/dager-feltene fra designet aktiveres når
            planmotoren tar imot dem (se workbench-fasit-analyse G7). */}
      </div>
    </div>
  );
}
