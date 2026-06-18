"use client";

import type { ReactElement } from "react";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel } from "./helpers";
import type { Cat } from "./theme";

const ORDER: Cat[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

// PLASSHOLDER volumtak — FYS-formelen er IKKE låst (CLAUDE.md). Disse er bevisst
// midlertidige referansetall for turneringsperioden og må ikke tolkes som fasit.
const VOL_MIN_PLACEHOLDER = 240;
const VOL_MAX_PLACEHOLDER = 480;

type StatusbarProps = {
  /** minutter per kategori */
  totals: Record<Cat, number>;
  grand: number;
  weekLabel: string;
};

export function Statusbar({ totals, grand, weekLabel }: StatusbarProps): ReactElement {
  const volPct = Math.min(100, Math.round((grand / VOL_MAX_PLACEHOLDER) * 100));
  const inBand = grand >= VOL_MIN_PLACEHOLDER && grand <= VOL_MAX_PLACEHOLDER;
  const over = grand > VOL_MAX_PLACEHOLDER;
  const gaugeColor = over ? WB.err : inBand ? WB.ok : WB.warn;
  const volTakLabel = `mål ${durLabel(VOL_MIN_PLACEHOLDER)}–${durLabel(VOL_MAX_PLACEHOLDER)}`;
  const volTakStatus = over
    ? "Over volumtaket — trim uka"
    : inBand
      ? "Innenfor periodens volumtak ✓"
      : "Under måltak — fyll på";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 20px",
        height: 74,
        borderTop: "2px solid #D1F84326",
        background: "#0a1d15",
        flexShrink: 0,
        boxShadow: "inset 0 1px 0 rgba(209,248,67,0.08)",
      }}
    >
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: WB.muted3 }}>
          Belastning
        </span>
        <span style={{ fontSize: 11, color: WB.muted }}>{weekLabel} · pyramide</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, flexWrap: "wrap" }}>
        {ORDER.map((cat) => {
          const m = totals[cat];
          return (
            <div
              key={cat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: WB.cardBgAlt,
                border: `1px solid ${WB.innerBorderSoft}`,
                borderRadius: 9999,
                padding: "6px 13px 6px 9px",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 3, background: CAT_COLORS[cat], opacity: m ? 1 : 0.35 }} />
              <div style={{ lineHeight: 1.05 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: WB.text, fontFamily: FONT.display }}>
                  {m ? durLabel(m) : "0m"}
                </div>
                <div style={{ fontSize: 8.5, fontFamily: FONT.mono, letterSpacing: "0.06em", color: "#7c8a82" }}>{cat}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* volum-tak gauge (PLASSHOLDER-tak) */}
      <div style={{ flexShrink: 0, minWidth: 300, background: WB.cardBgAlt, border: `1px solid ${WB.innerBorderSoft}`, borderRadius: 12, padding: "11px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 20, color: WB.lime, lineHeight: 1, flexShrink: 0 }}>
            {durLabel(grand)}
          </span>
          <div style={{ flex: 1, position: "relative", height: 7, borderRadius: 9999, background: WB.railBg, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${volPct}%`, borderRadius: 9999, background: gaugeColor }} />
          </div>
          <span style={{ fontSize: 9.5, color: "#7c8a82", flexShrink: 0 }}>{volTakLabel}</span>
        </div>
        <div style={{ fontSize: 9.5, color: WB.muted, marginTop: 6 }}>{volTakStatus} · plassholder-tak</div>
      </div>
    </div>
  );
}
