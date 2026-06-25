"use client";

import type { ReactElement } from "react";
import { FONT, WB } from "./theme";
import type { SeasonPhase, SeasonPhaseType } from "./types";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

// Periode-bånd-farger + korte etiketter (fasit phaseColorMap / phaseShort).
const PHASE_COLOR: Record<SeasonPhaseType, string> = {
  GRUNN: "#56C59A",
  SPESIALISERING: "#84A9FF",
  TURNERING: "#D1F843",
  EVALUERING: "#E8A33D",
  FERIE: "#5f7d70",
};
const PHASE_SHORT: Record<SeasonPhaseType, string> = {
  GRUNN: "GRUNN",
  SPESIALISERING: "SPESIAL.",
  TURNERING: "TURNERING",
  EVALUERING: "EVAL.",
  FERIE: "FERIE",
};

const FOCUS_ROWS = ["Nærspill", "Putting", "Utslag", "Innspill", "FYS"] as const;

function monthPhaseTypes(phases: SeasonPhase[]): SeasonPhaseType[] {
  const out: SeasonPhaseType[] = [];
  for (const ph of phases) {
    for (let i = 0; i < ph.months; i++) out.push(ph.type);
  }
  while (out.length < 12) out.push("FERIE");
  return out.slice(0, 12);
}

type ArsplanViewProps = {
  phases: SeasonPhase[];
  onPhaseClick: (index: number) => void;
};

export function ArsplanView({ phases, onPhaseClick }: ArsplanViewProps): ReactElement {
  const phaseCount = phases.length;
  // Inneværende måned brukes til lime-markering i etikettraden (lazy — ingen render-side-effekt).
  const currentMonthIdx = new Date().getMonth();

  if (phaseCount === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 17, color: WB.text, marginBottom: 8 }}>
            Ingen sesongplan ennå
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: WB.muted, margin: 0 }}>
            Sesong-periodisering med perioder, belastningskurve og turneringer er ikke satt opp ennå. Den vises her når
            planen er lagt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wb-scroll" style={{ flex: 1, padding: 18, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>
          Sesong 2026 · periodisering
        </span>
        <span style={{ fontSize: 12, color: WB.muted }}>
          {phaseCount} perioder · 12 måneder
        </span>
      </div>

      {/* måned-etiketter */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 4, marginBottom: 7 }}>
        {MONTH_SHORT.map((m, i) => (
          <div
            key={m}
            style={{
              textAlign: "center",
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 600,
              color: i === currentMonthIdx ? WB.lime : "#5f7d70",
            }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* periode-bånd */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {phases.map((ph, i) => (
          <button
            key={`${ph.type}-${i}`}
            type="button"
            onClick={() => onPhaseClick(i)}
            style={{
              flex: ph.months,
              minWidth: 0,
              background: PHASE_COLOR[ph.type],
              border: "none",
              borderRadius: 8,
              padding: "11px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: WB.limeDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {PHASE_SHORT[ph.type]}
            </span>
            <span style={{ fontSize: 10, color: WB.limeDark, opacity: 0.7 }}>{ph.span}</span>
          </button>
        ))}
      </div>

      {/* fokusområde-rader — horisontalt måneds-grid (fasit wb-08) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {FOCUS_ROWS.map((row) => {
          const months = monthPhaseTypes(phases);
          return (
            <div key={row} style={{ display: "grid", gridTemplateColumns: "92px repeat(12, 1fr)", gap: 4, alignItems: "stretch" }}>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: WB.muted,
                  paddingTop: 8,
                }}
              >
                {row}
              </span>
              {months.map((type, mi) => (
                <div
                  key={`${row}-${mi}`}
                  style={{
                    minHeight: 22,
                    borderRadius: 5,
                    background: `${PHASE_COLOR[type]}55`,
                    border: `1px solid ${PHASE_COLOR[type]}88`,
                  }}
                />
              ))}
            </div>
          );
        })}
        <div style={{ display: "grid", gridTemplateColumns: "92px repeat(12, 1fr)", gap: 4, alignItems: "center", marginTop: 4 }}>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: WB.lime,
            }}
          >
            Turneringer
          </span>
          {monthPhaseTypes(phases).map((type, mi) => (
            <div
              key={`turn-${mi}`}
              style={{
                minHeight: 18,
                borderRadius: 5,
                background: type === "TURNERING" ? `${PHASE_COLOR.TURNERING}66` : "transparent",
                border: type === "TURNERING" ? `1px solid ${PHASE_COLOR.TURNERING}` : `1px dashed ${WB.panelBorder}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
