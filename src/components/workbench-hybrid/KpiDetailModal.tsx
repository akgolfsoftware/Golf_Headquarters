"use client";

import type { ReactElement } from "react";
import { X } from "lucide-react";
import { CAT_COLORS, FONT, WB, type Cat } from "./theme";
import { durLabel } from "./helpers";
import type { KpiKey } from "./KpiStrip";

const CAT_ORDER: Cat[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const AREA_LABEL: Record<Cat, string> = {
  FYS: "Fysisk", TEK: "Teknisk", SLAG: "Golfslag", SPILL: "Spill", TURN: "Turnering",
};

type DetailRow = { label: string; value: string; pct: number; color: string };
type Detail = { title: string; sub: string; rows: DetailRow[]; note: string };

/**
 * Bygg detalj-innholdet per KPI (fasit `kpiDetailVals`). Volum + pyramide bruker
 * ekte uke-totaler; adherence + SG har ingen datamodell ennå → fasit-demo-tall.
 */
function buildDetail(key: KpiKey, totals: Record<Cat, number>, grand: number): Detail {
  const distRows: DetailRow[] = CAT_ORDER.map((c) => {
    const pct = Math.round(((totals[c] || 0) / (grand || 1)) * 100);
    return { label: AREA_LABEL[c], value: `${durLabel(totals[c] || 0)}  ·  ${pct}%`, pct, color: CAT_COLORS[c] };
  });

  switch (key) {
    case "volum":
      return {
        title: "Planlagt volum denne uka",
        sub: `${durLabel(grand)} totalt · mål 4t–8t`,
        rows: distRows,
        note: "Volum vist per pyramide-område. Klikk en økt for å justere.",
      };
    case "pyramide":
      return {
        title: "Pyramide-balanse",
        sub: "Fordeling av all planlagt trening",
        rows: distRows,
        note: "Sammenlignes mot idealfordelingen for turneringsperioden.",
      };
    case "adherence":
      return {
        title: "Plan-adherence",
        sub: "82% gjennomført siste 4 uker · demo-tall",
        rows: [
          { label: "Gjennomført som planlagt", value: "82%", pct: 82, color: WB.ok },
          { label: "Endret underveis", value: "11%", pct: 11, color: WB.warn },
          { label: "Ikke gjennomført", value: "7%", pct: 7, color: WB.err },
        ],
        note: "Ikke-gjennomførte økter flagges automatisk og varsler coach. (Demo — adherence har ingen datamodell ennå.)",
      };
    case "sg":
    default:
      return {
        title: "Strokes Gained",
        sub: "+1.8 siste 5 runder vs A1 · demo-tall",
        rows: [
          { label: "SG-OTT", value: "+0.6", pct: 60, color: WB.ok },
          { label: "SG-APP", value: "+0.9", pct: 90, color: WB.ok },
          { label: "SG-ARG", value: "−0.2", pct: 20, color: WB.err },
          { label: "SG-PUTT", value: "+0.5", pct: 50, color: WB.ok },
        ],
        note: "Svakeste kategori styrer treningsforslagene. (Demo — SG-tall er ikke koblet til runde-data her.)",
      };
  }
}

type KpiDetailModalProps = {
  kpiKey: KpiKey;
  totals: Record<Cat, number>;
  grand: number;
  onClose: () => void;
};

export function KpiDetailModal({ kpiKey, totals, grand, onClose }: KpiDetailModalProps): ReactElement {
  const detail = buildDetail(kpiKey, totals, grand);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(7,16,12,0.74)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460,
          maxWidth: "100%",
          maxHeight: "80%",
          display: "flex",
          flexDirection: "column",
          background: WB.panelBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "18px 20px", borderBottom: `1px solid ${WB.innerBorderSoft}` }}>
          <div>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>{detail.title}</div>
            <div style={{ fontSize: 12, color: WB.muted, marginTop: 3 }}>{detail.sub}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 9, border: "none", background: WB.cardBg, color: WB.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="wb-scroll" style={{ padding: "18px 20px", overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {detail.rows.map((r) => (
              <div key={r.label}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: WB.muted2 }}>{r.label}</span>
                  <span style={{ fontFamily: FONT.mono, fontSize: 11.5, fontWeight: 700, color: WB.text }}>{r.value}</span>
                </div>
                <div style={{ height: 8, borderRadius: 9999, background: WB.railBg, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${r.pct}%`, background: r.color, borderRadius: 9999 }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: "16px 0 0", fontSize: 12, lineHeight: 1.55, color: "#7c8a82", background: "#0d2218", border: `1px solid ${WB.hairlineSoft}`, borderRadius: 10, padding: "11px 13px" }}>
            {detail.note}
          </p>
        </div>
      </div>
    </div>
  );
}
