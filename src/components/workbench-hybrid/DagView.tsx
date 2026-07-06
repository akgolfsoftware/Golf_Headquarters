"use client";

import type { DragEvent, ReactElement } from "react";
import { CAT_COLORS, CAT_SOFT, CAT_TEXT, FONT, WB } from "./theme";
import { durLabel } from "./helpers";
import type { WbSession } from "./types";

const ROW_H = 42;
const START_HOUR = 5;
const END_HOUR = 22;

function parseHM(time: string): { hh: number; mm: number } {
  if (!time || time === "—") return { hh: 8, mm: 0 };
  const [h, m] = time.split(":");
  return { hh: parseInt(h, 10) || 8, mm: parseInt(m ?? "0", 10) || 0 };
}

type DagViewProps = {
  daySessions: WbSession[];
  selectedId: string | null;
  onSessionClick: (id: string) => void;
  /** dropp på tidslinjen → time-streng ("16:00") for "ons" */
  onTimelineDrop: (time: string) => void;
};

export function DagView({ daySessions, selectedId, onSessionClick, onTimelineDrop }: DagViewProps): ReactElement {
  const hours: string[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) hours.push(`${h < 10 ? "0" : ""}${h}:00`);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;
    let hour = START_HOUR + Math.floor(y / ROW_H);
    hour = Math.max(6, Math.min(21, hour));
    onTimelineDrop(`${hour < 10 ? "0" : ""}${hour}:00`);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>Onsdag 11. juni</span>
          <span style={{ fontSize: 12.5, color: WB.lime }}>I dag</span>
        </div>
        <span style={{ fontSize: 12, color: WB.muted }}>dra en økt inn på tidslinjen</span>
      </div>

      <div
        className="wb-scroll"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{ flex: 1, position: "relative", margin: "6px 18px 16px", overflowY: "auto" }}
      >
        <div style={{ position: "relative" }}>
          {hours.map((h) => (
            <div key={h} style={{ display: "flex", alignItems: "flex-start", height: ROW_H, borderTop: `1px solid ${WB.hairlineSoft}` }}>
              <span style={{ width: 46, flexShrink: 0, fontFamily: FONT.mono, fontSize: 10, color: WB.muted3, paddingTop: 2 }}>{h}</span>
              <div style={{ flex: 1 }} />
            </div>
          ))}

          {daySessions.map((s) => {
            const { hh, mm } = parseHM(s.time);
            const top = (hh - START_HOUR + mm / 60) * ROW_H;
            const height = Math.max(34, (s.dur / 60) * ROW_H - 4);
            const c = CAT_COLORS[s.cat];
            const soft = CAT_SOFT[s.cat];
            const on = s.id === selectedId;
            return (
              <div
                key={s.id}
                data-sid={s.id}
                onClick={() => onSessionClick(s.id)}
                style={{
                  position: "absolute",
                  left: 54,
                  right: 6,
                  top,
                  height,
                  background: soft,
                  borderLeft: `3px solid ${c}`,
                  borderRadius: 10,
                  padding: "8px 11px",
                  cursor: "pointer",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                  outline: on ? "2px solid var(--signal)" : undefined,
                  outlineOffset: on ? -2 : undefined,
                }}
              >
                <div style={{ fontFamily: FONT.mono, fontSize: 10, color: CAT_TEXT[s.cat], fontWeight: 600 }}>
                  {s.time && s.time !== "—" ? s.time : "—"}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: WB.text, marginTop: 2 }}>{s.title}</div>
                <div style={{ fontSize: 10.5, color: WB.muted, marginTop: 1 }}>
                  {s.cat} · {durLabel(s.dur)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
