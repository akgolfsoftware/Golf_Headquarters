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

// Måned-index som regnes som "nå" (juni) — gir lime-markering i etikettraden.
const CURRENT_MONTH_IDX = 5;

type ArsplanViewProps = {
  phases: SeasonPhase[];
  /** prosent-høyder (0–100) per måned for belastningskurven */
  load: number[];
  /** turnerings/test-markører per måned-index: [label, farge] */
  markers: Record<number, [string, string]>;
  onPhaseClick: (index: number) => void;
};

export function ArsplanView({ phases, load, markers, onPhaseClick }: ArsplanViewProps): ReactElement {
  const phaseCount = phases.length;

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
              color: i === CURRENT_MONTH_IDX ? WB.lime : "#5f7d70",
            }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* periode-bånd */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
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

      {/* belastningskurve */}
      <div style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5f7d70", marginBottom: 8 }}>
        Planlagt treningsbelastning
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12,1fr)",
          gap: 4,
          alignItems: "flex-end",
          height: 120,
          marginBottom: 18,
          padding: 10,
          background: WB.railBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 12,
        }}
      >
        {load.map((v, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div
              style={{
                width: "60%",
                height: `${v}%`,
                borderRadius: "3px 3px 0 0",
                background: i === CURRENT_MONTH_IDX ? WB.lime : "#2f5446",
              }}
            />
          </div>
        ))}
      </div>

      {/* turneringer & tester */}
      <div style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5f7d70", marginBottom: 8 }}>
        Turneringer &amp; tester
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 4 }}>
        {MONTH_SHORT.map((m, i) => {
          const mk = markers[i];
          return (
            <div key={m} style={{ minHeight: 46 }}>
              {mk && (
                <div style={{ background: WB.cardBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 8, padding: 8 }}>
                  <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: mk[1], marginBottom: 4 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: WB.text, lineHeight: 1.2 }}>{mk[0]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
