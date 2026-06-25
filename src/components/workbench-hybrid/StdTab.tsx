"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { PaletteItem } from "./types";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel } from "./helpers";

type StdFilter = "alle" | "naerspill" | "putting" | "utslag" | "full";

const FILTERS: { key: StdFilter; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "naerspill", label: "Nærspill" },
  { key: "putting", label: "Putting" },
  { key: "utslag", label: "Utslag" },
  { key: "full", label: "Full runde" },
];

function matchesStdFilter(p: PaletteItem, f: StdFilter): boolean {
  if (f === "alle") return true;
  const t = `${p.title} ${p.cat} ${p.omr ?? ""}`.toLowerCase();
  if (f === "naerspill") return /nær|chip|wedge|arg|green/i.test(t);
  if (f === "putting") return /putt/i.test(t);
  if (f === "utslag") return /tee|driver|utslag/i.test(t);
  if (f === "full") return /runde|18|bane/i.test(t);
  return true;
}

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
  const [filter, setFilter] = useState<StdFilter>("alle");
  const visible = useMemo(
    () => palette.filter((p) => matchesStdFilter(p, filter)),
    [palette, filter],
  );

  return (
    <div className="wb-scroll" style={{ flex: 1, overflow: "auto", padding: 16 }}>
      <div
        style={{
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div>
          <span style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 700, color: WB.text }}>
            Standardøkter
          </span>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: WB.muted }}>
            {visible.length} økter · legg inn i ukeplanen
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
            border: "none",
            background: WB.lime,
            color: WB.limeDark,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          + Ny standardøkt
        </button>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                fontFamily: FONT.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${active ? WB.lime : WB.panelBorder}`,
                background: active ? `${WB.lime}22` : WB.cardBg,
                color: active ? WB.lime : WB.muted,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        {visible.map((p) => {
          const active = selectedPaletteId === p.pid;
          const catColor = CAT_COLORS[p.cat];
          return (
            <div
              key={p.pid}
              style={{
                background: WB.cardBg,
                border: `1px solid ${active ? WB.lime : WB.innerBorder}`,
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: `${catColor}22`,
                    color: catColor,
                  }}
                >
                  {p.cat}
                </span>
                <span style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted3 }}>{durLabel(p.dur)}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: WB.text, lineHeight: 1.3 }}>{p.title}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted }}>
                Drill-program · {p.omr ?? "Generell"}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => onSelect(p.pid)}
                  style={{
                    flex: 1,
                    fontFamily: FONT.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "8px 10px",
                    borderRadius: 999,
                    border: `1px solid ${WB.panelBorder}`,
                    background: "transparent",
                    color: WB.muted,
                    cursor: "pointer",
                  }}
                >
                  Rediger
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(p.pid);
                    onGoToWeek();
                  }}
                  style={{
                    flex: 1,
                    fontFamily: FONT.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "8px 10px",
                    borderRadius: 999,
                    border: "none",
                    background: WB.lime,
                    color: WB.limeDark,
                    cursor: "pointer",
                  }}
                >
                  Legg i plan
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}