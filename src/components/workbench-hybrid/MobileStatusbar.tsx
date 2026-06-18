"use client";

import type { ReactElement } from "react";
import { CAT_COLORS, FONT, WB, type Cat } from "./theme";
import { durLabel } from "./helpers";

const ORDER: Cat[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

// Samme PLASSHOLDER-tak som desktop-Statusbar (FYS-formelen er ikke låst).
const VOL_MIN_PLACEHOLDER = 240;
const VOL_MAX_PLACEHOLDER = 480;

type MobileStatusbarProps = {
  totals: Record<Cat, number>;
  grand: number;
  weekLabel: string;
};

/**
 * Kompakt, klebrig belastnings-stripe nederst på mobil. Erstatter den 74px høye
 * desktop-Statusbar-en. Samlet volum + volumtak-gauge øverst, kategori-chips i
 * en horisontalt scrollbar rad under.
 */
export function MobileStatusbar({ totals, grand, weekLabel }: MobileStatusbarProps): ReactElement {
  const volPct = Math.min(100, Math.round((grand / VOL_MAX_PLACEHOLDER) * 100));
  const inBand = grand >= VOL_MIN_PLACEHOLDER && grand <= VOL_MAX_PLACEHOLDER;
  const over = grand > VOL_MAX_PLACEHOLDER;
  const gaugeColor = over ? WB.err : inBand ? WB.ok : WB.warn;

  return (
    <div
      style={{
        flexShrink: 0,
        borderTop: "2px solid #D1F84326",
        background: "#0a1d15",
        padding: "10px 14px 12px",
        boxShadow: "inset 0 1px 0 rgba(209,248,67,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: WB.lime, lineHeight: 1, flexShrink: 0 }}>
          {durLabel(grand)}
        </span>
        <div style={{ flex: 1, position: "relative", height: 7, borderRadius: 9999, background: WB.railBg, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${volPct}%`, borderRadius: 9999, background: gaugeColor }} />
        </div>
        <span style={{ fontSize: 9.5, color: "#7c8a82", flexShrink: 0 }}>{weekLabel}</span>
      </div>

      <div className="wb-scroll" style={{ display: "flex", gap: 6, marginTop: 9, overflowX: "auto" }}>
        {ORDER.map((cat) => {
          const m = totals[cat];
          return (
            <div
              key={cat}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: WB.cardBgAlt,
                border: `1px solid ${WB.innerBorderSoft}`,
                borderRadius: 9999,
                padding: "5px 12px 5px 8px",
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: 3, background: CAT_COLORS[cat], opacity: m ? 1 : 0.35 }} />
              <div style={{ lineHeight: 1.05 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: WB.text, fontFamily: FONT.display }}>{m ? durLabel(m) : "0m"}</div>
                <div style={{ fontSize: 8, fontFamily: FONT.mono, letterSpacing: "0.06em", color: "#7c8a82" }}>{cat}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
