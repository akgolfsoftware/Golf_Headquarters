"use client";

/**
 * AiPlanPanel — genererer et AI-planforslag for én spiller direkte i Workbench.
 * Kaller /api/admin/ai-plan, viser lasting → plan-sammendrag → link til godkjenningskø.
 */

import { type ReactElement, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, CheckCircle, Loader2, X, ExternalLink, RefreshCw } from "lucide-react";
import { WB, FONT } from "./theme";

type PlanForslagOkt = {
  uke: number;
  dag: string;
  type: string;
  varighetMin: number;
  fokus: string;
  skillArea: string;
  environment: string;
  lPhase: string;
  drills: unknown[];
};

type PlanForslag = {
  navn: string;
  beskrivelse: string;
  periodeUker: number;
  fokusOmrader: string[];
  okter: PlanForslagOkt[];
};

type ApiResponse = {
  generationId?: string;
  forslag?: PlanForslag;
  error?: string;
};

export type AiPlanPanelProps = {
  playerId: string;
  playerName: string;
  onClose: () => void;
};

const eyebrow: React.CSSProperties = {
  fontFamily: FONT.mono,
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: WB.muted,
};

const card: React.CSSProperties = {
  background: WB.cardBg,
  border: `1px solid ${WB.panelBorder}`,
  borderRadius: 12,
  padding: "14px 16px",
};

const TYPE_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const ENV_LABEL: Record<string, string> = {
  RANGE: "Range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjemme",
  SIMULATOR: "Simulator",
};

const LAC_LABEL: Record<string, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesial",
  TURNERING: "Turnering",
};

const PYR_COLOR: Record<string, string> = {
  FYS: "var(--axis-fys)",
  TEK: "var(--axis-tek)",
  SLAG: "var(--axis-slag)",
  SPILL: "var(--axis-spill)",
  TURN: "var(--axis-turn)",
};
const PYR_SOFT: Record<string, string> = {
  FYS: "var(--axis-fys-soft)",
  TEK: "var(--axis-tek-soft)",
  SLAG: "var(--axis-slag-soft)",
  SPILL: "var(--axis-spill-soft)",
  TURN: "var(--axis-turn-soft)",
};
const PYR_TEXT: Record<string, string> = {
  FYS: "var(--axis-fys-text)",
  TEK: "var(--axis-tek-text)",
  SLAG: "var(--axis-slag-text)",
  SPILL: "var(--axis-spill-text)",
  TURN: "var(--axis-turn-text)",
};

export function AiPlanPanel({ playerId, playerName, onClose }: AiPlanPanelProps): ReactElement {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [forslag, setForslag] = useState<PlanForslag | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);
  /** Increment to trigger a new fetch without resetting playerId dependency. */
  const [triggerKey, setTriggerKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let cancelled = false;

    fetch("/api/admin/ai-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
      signal: ctrl.signal,
    })
      .then((res) => res.json() as Promise<ApiResponse>)
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setForslag(data.forslag ?? null);
        setGenerationId(data.generationId ?? null);
        setStatus("ok");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if ((e as Error).name === "AbortError") return;
        setFeilmelding(e instanceof Error ? e.message : "Ukjent feil");
        setStatus("error");
      });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [playerId, triggerKey]);

  const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: WB.scrim,
    padding: 24,
  };

  const panel: React.CSSProperties = {
    background: WB.panelBg,
    border: `1px solid ${WB.panelBorder}`,
    borderRadius: 18,
    width: "100%",
    maxWidth: 680,
    maxHeight: "90dvh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const header: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderBottom: `1px solid ${WB.panelBorder}`,
    padding: "16px 20px",
    flexShrink: 0,
  };

  const body: React.CSSProperties = {
    flex: 1,
    overflowY: "auto" as const,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };

  const footer: React.CSSProperties = {
    borderTop: `1px solid ${WB.panelBorder}`,
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: WB.lime,
    color: WB.limeDark,
    border: "none",
    borderRadius: 9999,
    padding: "9px 18px",
    cursor: "pointer",
    fontFamily: FONT.mono,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    textDecoration: "none",
  };

  const btnGhost: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    color: WB.muted,
    border: `1px solid ${WB.panelBorder}`,
    borderRadius: 9999,
    padding: "9px 14px",
    cursor: "pointer",
    fontFamily: FONT.mono,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  };

  // Group sessions by week
  const byUke = forslag
    ? forslag.okter.reduce<Record<number, PlanForslagOkt[]>>((acc, o) => {
        (acc[o.uke] ??= []).push(o);
        return acc;
      }, {})
    : {};

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={panel}>
        {/* Header */}
        <div style={header}>
          <Bot size={18} strokeWidth={1.5} style={{ color: WB.lime }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: WB.text }}>
              AI-plan for {playerName}
            </div>
            <div style={{ ...eyebrow, marginTop: 2 }}>
              {status === "loading" ? "Genererer…" : status === "ok" ? "Forslag klart" : "Feil"}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ ...btnGhost, padding: "6px 10px", border: "none" }}>
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div style={body}>
          {status === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px 0" }}>
              <Loader2 size={32} strokeWidth={1.5} style={{ color: WB.lime, animation: "spin 1s linear infinite" }} />
              <div style={{ fontFamily: FONT.display, fontSize: 16, color: WB.muted }}>
                Analyserer spillerdata og genererer plan…
              </div>
              <div style={{ ...eyebrow }}>Tar vanligvis 10–20 sekunder</div>
              <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
            </div>
          )}

          {status === "error" && (
            <div style={{ ...card, borderColor: WB.err, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontFamily: FONT.display, fontWeight: 700, color: WB.err, fontSize: 14 }}>
                Generering feilet
              </div>
              <div style={{ fontSize: 13, color: WB.muted, lineHeight: 1.5 }}>{feilmelding}</div>
              <button
                type="button"
                onClick={() => { setStatus("loading"); setFeilmelding(null); setTriggerKey((k) => k + 1); }}
                style={{ ...btnGhost, alignSelf: "flex-start" }}
              >
                <RefreshCw size={13} strokeWidth={1.5} /> Prøv igjen
              </button>
            </div>
          )}

          {status === "ok" && forslag && (
            <>
              {/* Plan-header */}
              <div style={{ ...card, borderLeft: `3px solid ${WB.lime}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: WB.text, marginBottom: 6 }}>
                      {forslag.navn}
                    </div>
                    <div style={{ fontSize: 13, color: WB.muted, lineHeight: 1.6 }}>{forslag.beskrivelse}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ ...eyebrow, marginBottom: 4 }}>Varighet</div>
                    <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 22, color: WB.text }}>
                      {forslag.periodeUker} uker
                    </div>
                  </div>
                </div>

                {forslag.fokusOmrader.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 12 }}>
                    {forslag.fokusOmrader.map((o) => (
                      <span
                        key={o}
                        style={{
                          fontFamily: FONT.mono,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "4px 9px",
                          borderRadius: 6,
                          background: WB.limeSoft,
                          color: WB.lime,
                          border: `1px solid ${WB.limeBorder}`,
                        }}
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ukeoversikt */}
              {Object.entries(byUke).map(([uke, okter]) => (
                <div key={uke}>
                  <div style={{ ...eyebrow, marginBottom: 8 }}>Uke {uke}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {okter.map((o, i) => (
                      <div
                        key={i}
                        style={{
                          ...card,
                          padding: "11px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONT.mono,
                            fontSize: 9.5,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: PYR_SOFT[o.type] ?? WB.mutedSoft,
                            color: PYR_TEXT[o.type] ?? WB.muted,
                            border: `1px solid ${PYR_COLOR[o.type] ?? WB.muted3}`,
                            flexShrink: 0,
                          }}
                        >
                          {TYPE_LABEL[o.type] ?? o.type}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 13, color: WB.text }}>
                            {o.dag} · {o.fokus}
                          </div>
                          <div style={{ ...eyebrow, marginTop: 3 }}>
                            {o.varighetMin} min · {ENV_LABEL[o.environment] ?? o.environment} · {LAC_LABEL[o.lPhase] ?? o.lPhase}
                          </div>
                        </div>
                        <div style={{ ...eyebrow, textAlign: "right", flexShrink: 0 }}>
                          {o.drills.length} drills
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {generationId && (
                <div style={{ ...card, display: "flex", alignItems: "center", gap: 8, background: WB.limeFaint, borderColor: WB.limeBorder }}>
                  <CheckCircle size={15} strokeWidth={1.5} style={{ color: WB.lime }} />
                  <div style={{ fontSize: 12, color: WB.muted, flex: 1 }}>
                    Forslaget er lagret i godkjenningskøen og kan aktiveres derfra.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={footer}>
          <button
            type="button"
            onClick={() => { setStatus("loading"); setForslag(null); setFeilmelding(null); setTriggerKey((k) => k + 1); }}
            style={btnGhost}
            disabled={status === "loading"}
          >
            <RefreshCw size={13} strokeWidth={1.5} /> Generer på nytt
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onClose} style={btnGhost}>
              Lukk
            </button>
            {status === "ok" && (
              <Link href="/admin/approvals" style={btnPrimary}>
                Se godkjenningskø <ExternalLink size={12} strokeWidth={2} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
