"use client";

import type { ReactElement } from "react";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel } from "./helpers";
import type { WbSession, WeekKey, WeekState } from "./types";

const ROW_H = 42;
const END_HOUR = 22;
const AREA_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Golfslag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const DAY_DEFS: { key: WeekKey; label: string; num: number }[] = [
  { key: "man", label: "Man", num: 9 },
  { key: "tir", label: "Tir", num: 10 },
  { key: "ons", label: "Ons", num: 11 },
  { key: "tor", label: "Tor", num: 12 },
  { key: "fre", label: "Fre", num: 13 },
  { key: "lor", label: "Lør", num: 14 },
  { key: "son", label: "Søn", num: 15 },
];

function parseHM(time: string): { hh: number; mm: number } {
  if (!time || time === "—") return { hh: 8, mm: 0 };
  const [h, m] = time.split(":");
  return { hh: parseInt(h, 10) || 8, mm: parseInt(m ?? "0", 10) || 0 };
}

/** Tidligste økt-time i uka (clamp 5..8) → akse-start, per spec. */
function earliestHour(week: WeekState): number {
  let min = END_HOUR;
  (Object.keys(week) as WeekKey[]).forEach((k) =>
    week[k].forEach((s) => {
      const { hh } = parseHM(s.time);
      if (hh < min) min = hh;
    }),
  );
  return Math.max(5, Math.min(8, min));
}

type UkeViewProps = {
  week: WeekState;
  selectedId: string | null;
  hoverDay: WeekKey | null;
  weekLabel: string;
  weekRange: string;
  warningTitle: string | null;
  warningMeta: string | null;
  onSessionClick: (id: string) => void;
  onSessionDragStart: (id: string, from: WeekKey) => void;
  onDayDragOver: (day: WeekKey) => void;
  onDayDragLeave: (day: WeekKey) => void;
  onDayDrop: (day: WeekKey) => void;
};

export function UkeView({
  week,
  selectedId,
  hoverDay,
  weekLabel,
  weekRange,
  warningTitle,
  warningMeta,
  onSessionClick,
  onSessionDragStart,
  onDayDragOver,
  onDayDragLeave,
  onDayDrop,
}: UkeViewProps): ReactElement {
  const startHour = earliestHour(week);
  const hours: string[] = [];
  for (let h = startHour; h <= END_HOUR; h++) hours.push(`${h < 10 ? "0" : ""}${h}:00`);
  const gridH = (END_HOUR - startHour + 1) * ROW_H;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>{weekLabel}</span>
          <span style={{ fontSize: 12.5, color: WB.muted }}>{weekRange}</span>
        </div>
        <span style={{ fontSize: 12, color: WB.muted }}>dra fra panelet · flytt mellom dager</span>
      </div>

      {warningTitle && (
        <div
          style={{
            margin: "0 18px 10px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(242,144,140,0.12)",
            border: "1px solid rgba(242,144,140,0.35)",
            borderRadius: 10,
            padding: "9px 13px",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: WB.err }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: WB.text }}>{warningTitle}</span>
          {warningMeta && <span style={{ fontSize: 12, color: WB.muted }}>{warningMeta}</span>}
          <span style={{ marginLeft: "auto", fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 700, color: WB.err }}>
            TURNERING
          </span>
        </div>
      )}

      <div className="wb-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "0 18px 16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "52px repeat(7,1fr)",
            border: `1px solid ${WB.hairline}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* hour axis */}
          <div style={{ position: "relative", background: "#0a1d15", borderRight: `1px solid ${WB.hairline}` }}>
            <div style={{ position: "sticky", top: 0, zIndex: 4, height: 48, background: WB.cardBgAlt, borderBottom: `1px solid ${WB.hairlineSoft}` }} />
            {hours.map((h) => (
              <div key={h} style={{ height: ROW_H, borderTop: `1px solid ${WB.hairline}`, boxSizing: "border-box", position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: 7,
                    fontFamily: FONT.mono,
                    fontSize: 9.5,
                    color: WB.muted3,
                    background: "#0a1d15",
                    padding: "0 2px",
                  }}
                >
                  {h}
                </span>
              </div>
            ))}
          </div>

          {/* day columns */}
          {DAY_DEFS.map((d) => {
            const isToday = d.key === "ons";
            const isWeekend = d.key === "lor" || d.key === "son";
            const isHover = hoverDay === d.key;
            const list = week[d.key] ?? [];
            const colBg = isWeekend ? "#0a1c15" : isToday ? "rgba(209,248,67,0.05)" : "#0f261c";
            const headBg = isToday ? "#15301f" : isWeekend ? "#0c2018" : WB.cardBgAlt;
            return (
              <div
                key={d.key}
                data-day={d.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  onDayDragOver(d.key);
                }}
                onDragLeave={() => onDayDragLeave(d.key)}
                onDrop={(e) => {
                  e.preventDefault();
                  onDayDrop(d.key);
                }}
                style={{
                  position: "relative",
                  minHeight: gridH,
                  borderRight: `1px solid ${WB.hairline}`,
                  background: isHover ? "rgba(209,248,67,0.1)" : colBg,
                  outline: isHover ? `2px dashed ${WB.lime}` : undefined,
                  outlineOffset: isHover ? -2 : undefined,
                }}
              >
                <div
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
                    height: 48,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    borderBottom: `1px solid ${WB.hairlineSoft}`,
                    background: headBg,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: isToday ? WB.lime : isWeekend ? "#6b7a71" : WB.muted,
                    }}
                  >
                    {d.label}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT.display,
                      fontWeight: isToday ? 800 : 700,
                      fontSize: 15,
                      color: isToday ? WB.lime : isWeekend ? "#b9c2bb" : WB.text,
                    }}
                  >
                    {d.num}
                  </div>
                </div>

                <div style={{ position: "relative", minHeight: gridH }}>
                  {hours.map((h) => (
                    <div key={h} style={{ height: ROW_H, borderTop: `1px solid ${WB.hairline}`, boxSizing: "border-box" }} />
                  ))}
                  {list.map((s: WbSession) => {
                    const { hh, mm } = parseHM(s.time);
                    const top = (hh - startHour + mm / 60) * ROW_H;
                    const height = Math.max(46, (s.dur / 60) * ROW_H - 3);
                    const c = CAT_COLORS[s.cat];
                    const on = s.id === selectedId;
                    return (
                      <div
                        key={s.id}
                        draggable
                        data-sid={s.id}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", s.id);
                          onSessionDragStart(s.id, d.key);
                        }}
                        onClick={() => onSessionClick(s.id)}
                        style={{
                          position: "absolute",
                          left: 3,
                          right: 3,
                          top,
                          minHeight: height,
                          background: on ? "#1d3a2e" : WB.cardBg,
                          borderTop: `1px solid ${on ? WB.lime : WB.panelBorder}`,
                          borderRight: `1px solid ${on ? WB.lime : WB.panelBorder}`,
                          borderBottom: `1px solid ${on ? WB.lime : WB.panelBorder}`,
                          borderLeft: `3px solid ${c}`,
                          borderRadius: 9,
                          padding: "7px 9px",
                          cursor: "pointer",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          boxShadow: on ? "0 0 0 3px rgba(209,248,67,0.12)" : undefined,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
                          <span style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted }}>
                            {s.time && s.time !== "—" ? s.time : "—"} · {durLabel(s.dur)}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: WB.text, lineHeight: 1.25 }}>{s.title}</div>
                        <div style={{ fontFamily: FONT.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", color: c }}>
                          {AREA_LABEL[s.cat] ?? s.cat}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
