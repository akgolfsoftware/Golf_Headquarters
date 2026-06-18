"use client";

import type { ReactElement } from "react";
import { CAT_COLORS, FONT, WB, type Cat } from "./theme";
import type { SeasonPhase, SeasonPhaseType } from "./types";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

const PHASE_COLOR: Record<SeasonPhaseType, string> = {
  GRUNN: "#56C59A",
  SPESIALISERING: "#84A9FF",
  TURNERING: "#D1F843",
  EVALUERING: "#E8A33D",
  FERIE: "#5f7d70",
};

// Fasit-fordelinger (demo): turneringsmånedene (jun–aug) vekter slag/spill/turn,
// resten vekter fys/tek. Brøkene er andel av baren.
const DIST_TOUR: [Cat, number][] = [["SLAG", 0.34], ["SPILL", 0.26], ["TURN", 0.22], ["TEK", 0.18]];
const DIST_BASE: [Cat, number][] = [["FYS", 0.32], ["TEK", 0.3], ["SLAG", 0.24], ["SPILL", 0.14]];

/** Bygg en periode-per-måned-liste fra periodenes month-spenn (sekvensielt). */
function phaseByMonth(phases: SeasonPhase[]): SeasonPhaseType[] {
  const out: SeasonPhaseType[] = [];
  phases.forEach((ph) => {
    for (let j = 0; j < ph.months; j++) out.push(ph.type);
  });
  return out;
}

type ArViewProps = {
  phases: SeasonPhase[];
  /** antall økter per måned (demo) */
  counts: number[];
  onMonthClick: (index: number) => void;
};

export function ArView({ phases, counts, onMonthClick }: ArViewProps): ReactElement {
  const months = phaseByMonth(phases);

  return (
    <div className="wb-scroll" style={{ flex: 1, padding: 18, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>
          2026 · alle måneder
        </span>
        <span style={{ fontSize: 12, color: WB.muted }}>klikk en måned for å åpne den</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {MONTH_SHORT.map((nm, i) => {
          const ph = months[i] ?? "GRUNN";
          const pc = PHASE_COLOR[ph];
          const dist = i >= 5 && i <= 7 ? DIST_TOUR : DIST_BASE;
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
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: WB.text }}>{nm}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 11, color: WB.muted }}>{counts[i] ?? 0} økt</span>
              </div>
              <div style={{ display: "flex", height: 7, borderRadius: 9999, overflow: "hidden", background: WB.railBg, marginBottom: 10 }}>
                {dist.map(([c, w]) => (
                  <span key={c} style={{ width: `${w * 100}%`, height: "100%", background: CAT_COLORS[c] }} />
                ))}
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: pc }}>
                {ph}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
