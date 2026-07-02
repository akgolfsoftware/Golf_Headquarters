"use client";

import type { ReactElement } from "react";
import { CAT_COLORS, FONT, WB, type Cat } from "./theme";
import { durLabel } from "./helpers";
import type { WorkbenchFokus } from "@/lib/workbench/fokus";

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
  /** plan-adherence ("78 %") — null = ingen forfalte økter denne uka → "—" */
  adherence: string | null;
  /** strokes gained (ingen datamodell ennå — null = ærlig tomtilstand "—") */
  sg: string | null;
  /** aktivt fokus (coach-valgt eller beregnet SG-gap) — null = ingen kilde */
  fokus: WorkbenchFokus | null;
  onOpen: (key: KpiKey) => void;
};

/**
 * KPI-stripa øverst i senterområdet (over alle zoom-visninger). Mono-etiketter +
 * stat/bar-kort. Volum + pyramide-balanse er avledet av ekte uke-data
 * (totals/grand). Adherence og SG har ingen datamodell ennå → vises som ærlig
 * tomtilstand ("—") når propen er null, aldri oppdiktede tall.
 */
export function KpiStrip({ totals, grand, sessionCount, adherence, sg, fokus, onOpen }: KpiStripProps): ReactElement {
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

      {/* Fokus (chip) — coachens periode-fokus, ellers beregnet SG-gap. Rangerer paletten. */}
      <KpiCard label="Fokus" dot={WB.lime}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span
            style={{
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "-0.01em",
              color: fokus ? WB.text : WB.muted3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 180,
            }}
          >
            {fokus?.label ?? "—"}
          </span>
        </div>
        <div style={subStyle}>
          {fokus ? (fokus.kilde === "coach" ? "coachens periodefokus" : "størst SG-gap") : "ingen fokus-kilde"}
        </div>
      </KpiCard>

      {/* Plan-adherence (stat) — % gjennomførte minutter av forfalte økter denne uka */}
      <KpiCard label="Plan-adherence" dot="#56C59A" onClick={() => onOpen("adherence")}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={statValue(adherence ? WB.ok : WB.muted3)}>{adherence ?? "—"}</span>
        </div>
        <div style={subStyle}>{adherence ? "planlagt vs gjennomført" : "ingen forfalte økter"}</div>
      </KpiCard>

      {/* Strokes Gained (stat) — ingen datamodell ennå → ærlig "—" */}
      <KpiCard label="Strokes Gained" dot="#56C59A" onClick={() => onOpen("sg")}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={statValue(sg ? WB.ok : WB.muted3)}>{sg ?? "—"}</span>
          {sg && <span style={{ fontSize: 10.5, fontWeight: 600, color: WB.ok }}>▲ siste 5</span>}
        </div>
        <div style={subStyle}>{sg ? "vs A1-benchmark" : "ingen data ennå"}</div>
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
  /** Uten onClick rendres kortet som ren info-chip (ingen detalj-modal). */
  onClick?: () => void;
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
        cursor: onClick ? "pointer" : "default",
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
