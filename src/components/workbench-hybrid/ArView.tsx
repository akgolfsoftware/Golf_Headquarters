"use client";

import type { ReactElement } from "react";
import { FONT, WB } from "./theme";
import type { SeasonPhase, SeasonPhaseType } from "./types";

const PHASE_COLOR: Record<SeasonPhaseType, string> = {
  GRUNN: "#56C59A",
  SPESIALISERING: "#84A9FF",
  TURNERING: "#D1F843",
  EVALUERING: "#E8A33D",
  FERIE: "#5f7d70",
};

const PHASE_LABEL: Record<SeasonPhaseType, string> = {
  GRUNN: "GRUNN",
  SPESIALISERING: "SPESIAL.",
  TURNERING: "TURNERING",
  EVALUERING: "EVAL.",
  FERIE: "FERIE",
};

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

/** Bygg en periode-per-måned-liste fra periodenes month-spenn (sekvensielt). */
function phaseByMonth(phases: SeasonPhase[]): (SeasonPhaseType | null)[] {
  const out: SeasonPhaseType[] = [];
  phases.forEach((ph) => {
    for (let j = 0; j < ph.months; j++) out.push(ph.type);
  });
  // Fyll opp til 12 med null der det ikke finnes periode-data (ingen oppdiktet periode).
  return Array.from({ length: 12 }, (_, i) => out[i] ?? null);
}

type ArViewProps = {
  phases: SeasonPhase[];
  onMonthClick: (index: number) => void;
};

export function ArView({ phases, onMonthClick }: ArViewProps): ReactElement {
  const months = phaseByMonth(phases);
  const year = new Date().getFullYear();

  return (
    <div className="wb-scroll" style={{ flex: 1, padding: 18, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>
          {year} · alle måneder
        </span>
        <span style={{ fontSize: 12, color: WB.muted }}>klikk en måned for å åpne den</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {MONTH_SHORT.map((nm, i) => {
          const ph = months[i];
          const pc = ph ? PHASE_COLOR[ph] : WB.panelBorder;
          return (
            <button
              key={nm}
              type="button"
              onClick={() => onMonthClick(i)}
              style={{
                background: WB.cardBg,
                border: `1px solid ${WB.panelBorder}`,
                borderTop: `3px solid ${pc}`,
                borderRadius: 14,
                padding: 15,
                cursor: "pointer",
                textAlign: "left",
                display: "block",
                width: "100%",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: WB.text }}>{nm}</span>
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: ph ? pc : WB.muted3 }}>
                {ph ? PHASE_LABEL[ph] : "Ingen periode"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
