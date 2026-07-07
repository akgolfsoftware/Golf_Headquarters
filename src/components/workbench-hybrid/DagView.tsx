"use client";

import type { DragEvent, ReactElement } from "react";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel, WEEK_KEYS } from "./helpers";
import type { WbSession, WeekKey } from "./types";

const ROW_H = 42;
const START_HOUR = 5;
const END_HOUR = 22;

const DAY_SHORT: Record<WeekKey, string> = {
  man: "Man", tir: "Tir", ons: "Ons", tor: "Tor", fre: "Fre", lor: "Lør", son: "Søn",
};

function parseHM(time: string): { hh: number; mm: number } {
  if (!time || time === "—") return { hh: 8, mm: 0 };
  const [h, m] = time.split(":");
  return { hh: parseInt(h, 10) || 8, mm: parseInt(m ?? "0", 10) || 0 };
}

type DagViewProps = {
  daySessions: WbSession[];
  selectedId: string | null;
  onSessionClick: (id: string) => void;
  /** dropp på tidslinjen → time-streng ("16:00") for valgt dag (dagKey) */
  onTimelineDrop: (time: string) => void;
  /** Hvilken ukedag som vises. */
  dagKey: WeekKey;
  onDagKeyChange: (key: WeekKey) => void;
  /** Ekte dato-etikett for dagKey, f.eks. "Ons 11. jun". */
  dateLabel: string;
  isToday: boolean;
};

export function DagView({
  daySessions,
  selectedId,
  onSessionClick,
  onTimelineDrop,
  dagKey,
  onDagKeyChange,
  dateLabel,
  isToday,
}: DagViewProps): ReactElement {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 8px", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>{dateLabel}</span>
          {isToday && <span style={{ fontSize: 12.5, color: WB.lime }}>I dag</span>}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {WEEK_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onDagKeyChange(k)}
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "5px 10px",
                borderRadius: 999,
                border: "none",
                background: k === dagKey ? WB.lime : "transparent",
                color: k === dagKey ? WB.limeDark : WB.muted,
                cursor: "pointer",
              }}
            >
              {DAY_SHORT[k]}
            </button>
          ))}
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
                  background: c,
                  borderRadius: 10,
                  padding: "8px 11px",
                  cursor: "pointer",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  outline: on ? "2px solid #fff" : undefined,
                  outlineOffset: on ? -2 : undefined,
                }}
              >
                <div style={{ fontFamily: FONT.mono, fontSize: 10, color: WB.limeDark, fontWeight: 600 }}>
                  {s.time && s.time !== "—" ? s.time : "—"}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: WB.limeDark, marginTop: 2 }}>{s.title}</div>
                <div style={{ fontSize: 10.5, color: WB.limeDark, opacity: 0.75, marginTop: 1 }}>
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
