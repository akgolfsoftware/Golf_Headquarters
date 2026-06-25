"use client";

import type { ReactElement } from "react";
import type { WbGoal } from "./types";
import { CAT_COLORS, FONT, WB } from "./theme";

type SesongmalTabProps = {
  goals: WbGoal[];
};

function formatTarget(g: WbGoal): string | null {
  if (g.targetValue == null) return null;
  if (g.gm === "RESULTATMÅL" && g.ax === "TEK") {
    return `Mål: HCP ${g.targetValue.toFixed(1)}`;
  }
  return `Mål: ${g.targetValue}`;
}

export function SesongmalTab({ goals }: SesongmalTabProps): ReactElement {
  if (goals.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          color: WB.muted,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ margin: "0 0 8px", color: WB.text, fontWeight: 600 }}>Ingen sesongmål ennå</p>
          <p style={{ margin: 0, maxWidth: 300 }}>
            Mål settes i Mål-hub eller av coach — de vises her når de er koblet til planen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wb-scroll" style={{ flex: 1, overflow: "auto", padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 700, color: WB.text }}>
          Sesongmål
        </span>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: WB.muted }}>
          {goals.length} aktive mål · fremdrift fra ekte data
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {goals.map((g, i) => {
          const pct = g.progressPct ?? null;
          const targetLabel = formatTarget(g);
          return (
            <div
              key={`${g.gn}-${i}`}
              style={{
                background: WB.cardBg,
                borderTop: `1px solid ${WB.innerBorder}`,
                borderRight: `1px solid ${WB.innerBorder}`,
                borderBottom: `1px solid ${WB.innerBorder}`,
                borderLeft: `3px solid ${CAT_COLORS[g.ax]}`,
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: WB.text }}>{g.gn}</div>
                {pct != null && (
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 11,
                      fontWeight: 700,
                      color: pct >= 100 ? WB.lime : WB.text,
                      flexShrink: 0,
                    }}
                  >
                    {pct}%
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: WB.muted3,
                  marginTop: 6,
                }}
              >
                {g.gm} · {g.ax}
                {targetLabel ? ` · ${targetLabel}` : ""}
              </div>
              {pct != null && (
                <div
                  style={{
                    marginTop: 10,
                    height: 4,
                    borderRadius: 2,
                    background: WB.railBg,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.max(0, Math.min(100, pct))}%`,
                      borderRadius: 2,
                      background: pct >= 100 ? WB.lime : CAT_COLORS[g.ax],
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}