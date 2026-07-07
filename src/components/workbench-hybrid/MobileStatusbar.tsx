"use client";

import type { ReactElement } from "react";
import { CAT_COLORS, FONT, WB, type Cat } from "./theme";
import { durLabel } from "./helpers";

const ORDER: Cat[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

// Default-volumtak når aktiv PeriodBlock ikke har satt weeklyVolMin/Max.
const VOL_MIN_DEFAULT = 240;
const VOL_MAX_DEFAULT = 480;

type MobileStatusbarProps = {
  totals: Record<Cat, number>;
  grand: number;
  weekLabel: string;
  /** Ukevolum-mål fra spillerens aktive PeriodBlock (min/max minutter). */
  volMin?: number | null;
  volMax?: number | null;
  /** CANON tek-min-brudd → TEK-chip lyser rødt. */
  tekBrudd?: { malt?: number; grense?: number } | null;
};

/**
 * Kompakt, klebrig belastnings-stripe nederst på mobil. Erstatter den 74px høye
 * desktop-Statusbar-en. Samlet volum + volumtak-gauge øverst, kategori-chips i
 * en horisontalt scrollbar rad under.
 */
export function MobileStatusbar({ totals, grand, weekLabel, volMin, volMax, tekBrudd }: MobileStatusbarProps): ReactElement {
  const vMin = volMin ?? VOL_MIN_DEFAULT;
  const vMax = volMax ?? VOL_MAX_DEFAULT;
  const volPct = Math.min(100, Math.round((grand / vMax) * 100));
  const inBand = grand >= vMin && grand <= vMax;
  const over = grand > vMax;
  const gaugeColor = over ? WB.err : inBand ? WB.ok : WB.warn;

  return (
    <div
      style={{
        flexShrink: 0,
        borderTop: `2px solid ${WB.limeBorder}`,
        background: WB.railBg,
        padding: "10px 14px 12px",
        boxShadow: `inset 0 1px 0 ${WB.limeFaint}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: WB.lime, lineHeight: 1, flexShrink: 0 }}>
          {durLabel(grand)}
        </span>
        <div style={{ flex: 1, position: "relative", height: 7, borderRadius: 9999, background: WB.railBg, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${volPct}%`, borderRadius: 9999, background: gaugeColor }} />
        </div>
        <span style={{ fontSize: 9.5, color: WB.muted3, flexShrink: 0 }}>{weekLabel}</span>
      </div>

      <div className="wb-scroll" style={{ display: "flex", gap: 6, marginTop: 9, overflowX: "auto" }}>
        {ORDER.map((cat) => {
          const m = totals[cat];
          const tekRod = cat === "TEK" && !!tekBrudd;
          return (
            <div
              key={cat}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: tekRod ? WB.errSoft : WB.cardBgAlt,
                border: `1px solid ${tekRod ? WB.err : WB.innerBorderSoft}`,
                borderRadius: 9999,
                padding: "5px 12px 5px 8px",
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: 3, background: CAT_COLORS[cat], opacity: m ? 1 : 0.35 }} />
              <div style={{ lineHeight: 1.05 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: tekRod ? WB.err : WB.text, fontFamily: FONT.display }}>{m ? durLabel(m) : "0m"}</div>
                <div style={{ fontSize: 8, fontFamily: FONT.mono, letterSpacing: "0.06em", color: tekRod ? WB.err : WB.muted3 }}>
                  {tekRod ? `TEK <${tekBrudd?.grense}%` : cat}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
