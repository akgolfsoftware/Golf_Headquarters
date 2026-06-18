"use client";

import type { ReactElement } from "react";
import { CAT_COLORS, FONT, WB, type Cat } from "./theme";
import { durLabel } from "./helpers";

/** KPI-nøkler — styrer hvilken detalj-modal som åpnes. */
export type KpiKey = "volum" | "pyramide" | "adherence" | "sg";

const CAT_ORDER: Cat[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const dotStyle = (c: string): React.CSSProperties => ({
  width: 7,
  height: 7,
  borderRadius: 2,
  background: c,
  flexShrink: 0,
  display: "inline-block",
});

type KpiStripProps = {
  totals: Record<Cat, number>;
  grand: number;
  /** antall planlagte økter (ekte når data finnes) */
  sessionCount: number;
  /** plan-adherence (fasit-demo — ingen modell ennå) */
  adherence: string;
  /** strokes gained (fasit-demo — ingen modell ennå) */
  sg: string;
  onOpen: (key: KpiKey) => void;
};

/**
 * KPI-stripa øverst i senterområdet (over alle zoom-visninger). Mono-etiketter +
 * stat/bar-kort, 1:1 fra fasitens `kpis`. Volum + pyramide-balanse er avledet av
 * ekte uke-data (totals/grand). Adherence og SG har ingen datamodell ennå →
 * fasit-demo-verdier (markert i propene fra shell-en).
 */
export function KpiStrip({ totals, grand, sessionCount, adherence, sg, onOpen }: KpiStripProps): ReactElement {
  const pyrTotal = grand || 1;
  const segs = CAT_ORDER.map((cat) => ({
    cat,
    pct: Math.round((totals[cat] / pyrTotal) * 100),
    color: CAT_COLORS[cat],
  }));

  return (
    <div
      className="wb-scroll"
      style={{ display: "flex", gap: 8, padding: "12px 18px 4px", overflowX: "auto", flexShrink: 0 }}
    >
      {/* Volum uke (stat) — ekte */}
      <KpiCard label="Volum uke" dot="#D1F843" onClick={() => onOpen("volum")}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={statValue(WB.text)}>{durLabel(grand)}</span>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: WB.muted }}>/ 8t mål</span>
        </div>
        <div style={subStyle}>{sessionCount} økter planlagt</div>
      </KpiCard>

      {/* Pyramide-balanse (bar) — ekte */}
      <KpiCard label="Pyramide-balanse" dot="#84A9FF" onClick={() => onOpen("pyramide")}>
        <div style={{ display: "flex", height: 9, borderRadius: 9999, overflow: "hidden", background: WB.railBg, marginBottom: 5 }}>
          {segs.map((sg2) => (
            <span key={sg2.cat} style={{ width: `${sg2.pct}%`, background: sg2.color }} />
          ))}
        </div>
        <div style={subStyle}>FYS·TEK·SLAG·SPILL·TURN</div>
      </KpiCard>

      {/* Plan-adherence (stat) — fasit-demo */}
      <KpiCard label="Plan-adherence" dot="#56C59A" onClick={() => onOpen("adherence")}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={statValue(WB.ok)}>{adherence}</span>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: WB.ok }}>▲</span>
        </div>
        <div style={subStyle}>planlagt vs gjennomført</div>
      </KpiCard>

      {/* Strokes Gained (stat) — fasit-demo */}
      <KpiCard label="Strokes Gained" dot="#56C59A" onClick={() => onOpen("sg")}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={statValue(WB.ok)}>{sg}</span>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: WB.ok }}>▲ siste 5</span>
        </div>
        <div style={subStyle}>vs A1-benchmark</div>
      </KpiCard>
    </div>
  );
}

function KpiCard({
  label,
  dot,
  onClick,
  children,
}: {
  label: string;
  dot: string;
  onClick: () => void;
  children: React.ReactNode;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: "0 0 auto",
        minWidth: 118,
        textAlign: "left",
        background: WB.cardBg,
        border: `1px solid ${WB.panelBorder}`,
        borderRadius: 12,
        padding: "10px 12px",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        <span style={dotStyle(dot)} />
        <span style={{ fontFamily: FONT.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: WB.muted }}>
          {label}
        </span>
      </div>
      {children}
    </button>
  );
}

const statValue = (color: string): React.CSSProperties => ({
  fontFamily: FONT.display,
  fontWeight: 800,
  fontSize: 20,
  letterSpacing: "-0.01em",
  color,
});

const subStyle: React.CSSProperties = { fontSize: 10, color: WB.muted, marginTop: 2 };
