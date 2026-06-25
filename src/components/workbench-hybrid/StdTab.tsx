"use client";

import type { ReactElement } from "react";
import type { PaletteItem } from "./types";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel } from "./helpers";

type StdTabProps = {
  palette: PaletteItem[];
  selectedPaletteId: string | null;
  onSelect: (pid: string) => void;
  onGoToWeek: () => void;
};

export function StdTab({
  palette,
  selectedPaletteId,
  onSelect,
  onGoToWeek,
}: StdTabProps): ReactElement {
  return (
    <div className="wb-scroll" style={{ flex: 1, overflow: "auto", padding: 16 }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <span style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 700, color: WB.text }}>
            Standardøkter
          </span>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: WB.muted }}>
            {palette.length} økter · dra inn i ukeplanen eller trykk for å velge
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToWeek}
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "8px 14px",
            borderRadius: 999,
            border: `1px solid ${WB.panelBorder}`,
            background: WB.cardBg,
            color: WB.lime,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Gå til uke →
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {palette.map((p) => {
          const active = selectedPaletteId === p.pid;
          return (
            <button
              key={p.pid}
              type="button"
              onClick={() => onSelect(p.pid)}
              style={{
                textAlign: "left",
                background: WB.cardBg,
                border: `1px solid ${active ? WB.lime : WB.innerBorder}`,
                borderLeft: `3px solid ${CAT_COLORS[p.cat]}`,
                borderRadius: 10,
                padding: "12px 14px",
                cursor: "pointer",
                color: WB.text,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                <span style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted3, flexShrink: 0 }}>
                  {durLabel(p.dur)}
                </span>
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted, marginTop: 4 }}>
                {p.cat}
                {p.omr ? ` · ${p.omr}` : ""}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}