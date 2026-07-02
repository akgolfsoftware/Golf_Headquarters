"use client";

import { useState, type ReactElement } from "react";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { CAT_COLORS, COMPLIANCE_COLORS, FONT, WB } from "./theme";
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

function sessionSpanMinutes(s: WbSession, startHour: number): { start: number; end: number } {
  const { hh, mm } = parseHM(s.time);
  const start = (hh - startHour) * 60 + mm;
  return { start, end: start + s.dur };
}

/** Side-by-side lanes når økter overlapper i tid — unngår at kort dekker grip-håndtak. */
function computeDayLanes(list: WbSession[], startHour: number): Map<string, { lane: number; laneCount: number }> {
  const sorted = [...list].sort((a, b) => {
    const sa = sessionSpanMinutes(a, startHour);
    const sb = sessionSpanMinutes(b, startHour);
    return sa.start - sb.start || sa.end - sb.end;
  });
  const laneEnds: number[] = [];
  const meta = new Map<string, { lane: number; laneCount: number }>();
  for (const s of sorted) {
    const { start, end } = sessionSpanMinutes(s, startHour);
    let lane = laneEnds.findIndex((le) => le <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = Math.max(laneEnds[lane], end);
    }
    meta.set(s.id, { lane, laneCount: 0 });
  }
  const laneCount = Math.max(1, laneEnds.length);
  for (const v of meta.values()) v.laneCount = laneCount;
  return meta;
}

type UkeViewProps = {
  week: WeekState;
  selectedId: string | null;
  hoverDay: WeekKey | null;
  weekLabel: string;
  weekRange: string;
  /** Mandag 00:00 (ISO) for uka som vises — gir ekte datotall + i-dag-markering. */
  weekStartISO?: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  warningTitle: string | null;
  warningMeta: string | null;
  onSessionClick: (id: string) => void;
  onSessionDragStart: (id: string, from: WeekKey) => void;
  onDayDragOver: (day: WeekKey) => void;
  onDayDragLeave: (day: WeekKey) => void;
  onDayDrop: (day: WeekKey, transferSid?: string) => void;
  /** Coach/desktop: vis «dra fra panelet»-hint. */
  showPaletteHint?: boolean;
};

/** Datotall + i-dag per kolonne. Uten weekStartISO: v10-fallback (i dag = ons). */
function dayMetaFor(weekStartISO: string | undefined): { num: number; isToday: boolean }[] {
  if (!weekStartISO) {
    return DAY_DEFS.map((d, i) => ({ num: d.num, isToday: i === 2 }));
  }
  const start = new Date(weekStartISO);
  const now = new Date();
  const ty = now.getFullYear();
  const tm = now.getMonth();
  const td = now.getDate();
  return DAY_DEFS.map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      num: d.getDate(),
      isToday: d.getFullYear() === ty && d.getMonth() === tm && d.getDate() === td,
    };
  });
}

export function UkeView({
  week,
  selectedId,
  hoverDay,
  weekLabel,
  weekRange,
  weekStartISO,
  onPrevWeek,
  onNextWeek,
  canPrev = true,
  canNext = true,
  warningTitle,
  warningMeta,
  onSessionClick,
  onSessionDragStart,
  onDayDragOver,
  onDayDragLeave,
  onDayDrop,
  showPaletteHint = true,
}: UkeViewProps): ReactElement {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dayMeta = dayMetaFor(weekStartISO);
  const startHour = earliestHour(week);
  const hours: string[] = [];
  for (let h = startHour; h <= END_HOUR; h++) hours.push(`${h < 10 ? "0" : ""}${h}:00`);
  const gridH = (END_HOUR - startHour + 1) * ROW_H;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 8px", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            aria-label="Forrige uke"
            onClick={onPrevWeek}
            disabled={!onPrevWeek || !canPrev}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              border: `1px solid ${WB.panelBorder}`,
              background: "transparent",
              borderRadius: 999,
              padding: "6px 10px",
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: !onPrevWeek || !canPrev ? WB.muted3 : WB.text,
              cursor: !onPrevWeek || !canPrev ? "not-allowed" : "pointer",
              opacity: !onPrevWeek || !canPrev ? 0.55 : 1,
            }}
          >
            <ChevronLeft size={12} />
            Forrige
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18, color: WB.text }}>{weekLabel}</span>
            <span style={{ fontSize: 12.5, color: WB.muted }}>{weekRange}</span>
          </div>
          <button
            type="button"
            aria-label="Neste uke"
            onClick={onNextWeek}
            disabled={!onNextWeek || !canNext}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              border: `1px solid ${WB.panelBorder}`,
              background: "transparent",
              borderRadius: 999,
              padding: "6px 10px",
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: !onNextWeek || !canNext ? WB.muted3 : WB.text,
              cursor: !onNextWeek || !canNext ? "not-allowed" : "pointer",
              opacity: !onNextWeek || !canNext ? 0.55 : 1,
            }}
          >
            Neste
            <ChevronRight size={12} />
          </button>
        </div>
        {showPaletteHint ? (
          <span style={{ fontSize: 12, color: WB.muted, flexShrink: 0 }}>dra fra panelet · flytt mellom dager</span>
        ) : null}
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
          {DAY_DEFS.map((d, i) => {
            const isToday = dayMeta[i].isToday;
            const isWeekend = d.key === "lor" || d.key === "son";
            const isHover = hoverDay === d.key;
            const list = week[d.key] ?? [];
            const laneMap = computeDayLanes(list, startHour);
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
                  onDayDrop(d.key, e.dataTransfer.getData("text/plain") || undefined);
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
                    {dayMeta[i].num}
                  </div>
                </div>

                <div style={{ position: "relative", minHeight: gridH }}>
                  {hours.map((h) => (
                    <div key={h} style={{ height: ROW_H, borderTop: `1px solid ${WB.hairline}`, boxSizing: "border-box" }} />
                  ))}
                  {list
                    .map((s, idx) => ({ s, idx, ...parseHM(s.time) }))
                    .sort((a, b) => a.hh - b.hh || a.mm - b.mm)
                    .map(({ s, idx, hh, mm }) => {
                    const top = (hh - startHour + mm / 60) * ROW_H;
                    const height = Math.max(46, (s.dur / 60) * ROW_H - 3);
                    const c = CAT_COLORS[s.cat];
                    // Compliance-farge (plan vs. gjennomført) overtar kant + prikk for
                    // forfalte økter. Fremtidige økter beholder ren kategori-farge.
                    const comp =
                      s.compliance && s.compliance !== "fremtidig" ? s.compliance : null;
                    const edge = comp ? COMPLIANCE_COLORS[comp] : c;
                    const on = s.id === selectedId;
                    const dragging = draggingId === s.id;
                    const stackZ = 2 + idx;
                    const { lane, laneCount } = laneMap.get(s.id) ?? { lane: 0, laneCount: 1 };
                    const laneShare = `((100% - 6px) / ${laneCount})`;
                    return (
                      <div
                        key={s.id}
                        data-sid={s.id}
                        onClick={() => onSessionClick(s.id)}
                        style={{
                          position: "absolute",
                          left: `calc(3px + ${lane} * ${laneShare})`,
                          width: `calc(${laneShare} - 3px)`,
                          top,
                          minHeight: height,
                          zIndex: dragging ? 50 : stackZ + lane,
                          background: on ? "#1d3a2e" : WB.cardBg,
                          borderTop: `1px solid ${on ? WB.lime : WB.panelBorder}`,
                          borderRight: `1px solid ${on ? WB.lime : WB.panelBorder}`,
                          borderBottom: `1px solid ${on ? WB.lime : WB.panelBorder}`,
                          borderLeft: `3px solid ${edge}`,
                          borderRadius: 9,
                          padding: "7px 7px 7px 4px",
                          cursor: "pointer",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "row",
                          gap: 4,
                          boxShadow: dragging
                            ? "0 8px 24px rgba(0,0,0,0.35)"
                            : on
                              ? "0 0 0 3px rgba(209,248,67,0.12)"
                              : undefined,
                          opacity: dragging ? 0.92 : comp === "ikke-gjennomfort" ? 0.72 : 1,
                        }}
                      >
                        <div
                          draggable
                          data-drag-handle
                          role="button"
                          tabIndex={0}
                          aria-label={`Flytt ${s.title}`}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", s.id);
                            setDraggingId(s.id);
                            onSessionDragStart(s.id, d.key);
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          style={{
                            flexShrink: 0,
                            alignSelf: "stretch",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 20,
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: 4,
                            color: WB.muted3,
                            cursor: "grab",
                            touchAction: "none",
                            position: "relative",
                            zIndex: 2,
                          }}
                        >
                          <GripVertical size={14} strokeWidth={1.5} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: edge, flexShrink: 0 }} />
                            <span style={{ fontFamily: FONT.mono, fontSize: 9, color: WB.muted }}>
                              {s.time && s.time !== "—" ? s.time : "—"} · {durLabel(s.dur)}
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, fontWeight: 600, color: WB.text, lineHeight: 1.25 }}>{s.title}</div>
                          <div style={{ fontFamily: FONT.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", color: c }}>
                            {AREA_LABEL[s.cat] ?? s.cat}
                          </div>
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
