"use client";

/**
 * TimeGrid — felles Notion Calendar-uke (N1).
 *
 * Én motor for tidskolonne + dag-headers + time-/halvtime-linjer + nå-linje.
 * Dag-innhold (økter, droppable, booking-blokker) leveres via `renderDay`.
 *
 * Fasit: src/lib/calendar/notion-grid.ts (05:00–23:00, 30 min, 44 px/time).
 */

import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  GRID_BODY_PX,
  GRID_END_HOUR,
  GRID_SLOT_MIN,
  GRID_START_HOUR,
  GRID_START_MIN,
  PIXEL_PER_HOUR,
  gridHours,
  gridTicks,
} from "@/lib/calendar/notion-grid";
import { T } from "@/lib/v2/tokens";

export type TimeGridDay = {
  id: string;
  dow: string;
  date: string;
  today?: boolean;
};

export type TimeGridSlot = {
  dayIndex: number;
  hour: number;
  minute: number;
  startMin: number;
};

type Props = {
  days: TimeGridDay[];
  /** Innhold i hver dag-kolonne (fyller position:relative-cellen). */
  renderDay: (dayIndex: number, day: TimeGridDay) => ReactNode;
  /**
   * Klikk på tom flate i en dag-kolonne (target === currentTarget).
   * Consumer kan også håndtere tom-klikk selv i renderDay.
   */
  onEmptyClick?: (slot: TimeGridSlot) => void;
  showNowLine?: boolean;
  timeColWidth?: number;
  bordered?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Snap Y i grid-body til slot innenfor 05:00–(23:00−GRID_SLOT_MIN). */
export function snapYToSlot(y: number): Omit<TimeGridSlot, "dayIndex"> {
  const hours = GRID_START_HOUR + y / PIXEL_PER_HOUR;
  let totalMin = Math.round((hours * 60) / GRID_SLOT_MIN) * GRID_SLOT_MIN;
  const maxStart = GRID_END_HOUR * 60 - GRID_SLOT_MIN;
  totalMin = Math.max(GRID_START_MIN, Math.min(maxStart, totalMin));
  return {
    hour: Math.floor(totalMin / 60),
    minute: totalMin % 60,
    startMin: totalMin,
  };
}

/** Absolutt posisjon for en hendelse i TimeGrid-dag-kroppen. */
export function timeGridBlockStyle(
  startMin: number,
  durationMin: number,
  extra?: CSSProperties,
): CSSProperties {
  const top = Math.max(0, ((startMin - GRID_START_MIN) / 60) * PIXEL_PER_HOUR + 2);
  const height = Math.max(20, (durationMin / 60) * PIXEL_PER_HOUR - 3);
  return {
    position: "absolute",
    left: 3,
    right: 3,
    top,
    height,
    zIndex: 1,
    ...extra,
  };
}

export function TimeGrid({
  days,
  renderDay,
  onEmptyClick,
  showNowLine = true,
  // Paper `.tg` bruker en 62px tidskolonne — «05:30» i mono trenger mer plass
  // enn den gamle to-sifrede time-etiketten.
  timeColWidth = 62,
  bordered = true,
  className,
  style,
}: Props) {
  const timer = useMemo(() => gridHours(), []);
  const merker = useMemo(() => gridTicks(), []);
  const bodyH = GRID_BODY_PX;

  const [tikk, setTikk] = useState(0);
  useEffect(() => {
    if (!showNowLine) return;
    const i = setInterval(() => setTikk((t) => t + 1), 60_000);
    return () => clearInterval(i);
  }, [showNowLine]);

  const now = new Date();
  void tikk;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowInGrid = nowMin >= GRID_START_MIN && nowMin <= GRID_END_HOUR * 60;
  const nowTop = ((nowMin - GRID_START_MIN) / 60) * PIXEL_PER_HOUR;
  const todayIndex = days.findIndex((d) => d.today);
  const n = Math.max(1, days.length);

  const shell: CSSProperties = {
    overflow: "hidden",
    borderRadius: bordered ? 12 : 0,
    border: bordered ? `1px solid ${T.border}` : "none",
    background: T.panel,
    ...style,
  };

  return (
    <div className={className} style={shell} data-time-grid="notion">
      {/* Dag-header */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: timeColWidth, flex: "none" }} />
        {days.map((d) => (
          <div
            key={d.id}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "center",
              padding: "9px 0 8px",
              borderLeft: `1px solid ${T.border}`,
              background: d.today
                ? `color-mix(in srgb, ${T.lime} 6%, transparent)`
                : "transparent",
            }}
          >
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: d.today ? T.lime : T.mut,
              }}
            >
              {d.dow}
            </div>
            <div
              style={{
                fontFamily: T.disp,
                fontSize: 15,
                fontWeight: 700,
                color: d.today ? T.fg : T.fg2,
                marginTop: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {d.date}
            </div>
            {d.today && (
              <span
                style={{
                  display: "inline-block",
                  width: 4,
                  height: 4,
                  borderRadius: 9999,
                  background: T.lime,
                  marginTop: 3,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Kropp: tid + dager */}
      <div style={{ display: "flex", position: "relative", height: bodyH }}>
        {/* Tidsakse (Paper `tegnAkse`): ett merke per slot, hele timer i full
            tekstfarge og halvtimene dempet — så aksen er lesbar uten å rope. */}
        <div style={{ width: timeColWidth, flex: "none", position: "relative" }}>
          {merker.map((min) => {
            const helTime = min % 60 === 0;
            return (
              <span
                key={min}
                style={{
                  position: "absolute",
                  top: ((min - GRID_START_MIN) / 60) * PIXEL_PER_HOUR - 5,
                  right: 8,
                  fontFamily: T.mono,
                  fontSize: 10,
                  fontWeight: helTime ? 500 : 400,
                  color: helTime ? T.fg : T.mut,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(Math.floor(min / 60)).padStart(2, "0")}:
                {String(min % 60).padStart(2, "0")}
              </span>
            );
          })}
        </div>

        <div style={{ flex: 1, position: "relative", display: "flex", minWidth: 0 }}>
          {timer.map((h) =>
            h > GRID_START_HOUR && h < GRID_END_HOUR ? (
              <span
                key={`h-${h}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: (h - GRID_START_HOUR) * PIXEL_PER_HOUR,
                  height: 1,
                  background: `color-mix(in srgb, ${T.border} 70%, transparent)`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            ) : null,
          )}
          {timer.map((h) =>
            h < GRID_END_HOUR ? (
              <span
                key={`half-${h}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: (h - GRID_START_HOUR) * PIXEL_PER_HOUR + PIXEL_PER_HOUR / 2,
                  height: 1,
                  background: `color-mix(in srgb, ${T.border} 32%, transparent)`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            ) : null,
          )}

          {showNowLine && nowInGrid && todayIndex >= 0 && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: `${(todayIndex / n) * 100}%`,
                width: `${100 / n}%`,
                top: nowTop,
                zIndex: 2,
                pointerEvents: "none",
                borderTop: `2px solid ${T.lime}`,
                boxShadow: `0 0 6px color-mix(in srgb, ${T.lime} 40%, transparent)`,
              }}
            />
          )}

          {days.map((d, i) => (
            <div
              key={d.id}
              data-time-grid-day={i}
              onClick={
                onEmptyClick
                  ? (e) => {
                      if (e.target !== e.currentTarget) return;
                      const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                      const slot = snapYToSlot(y);
                      onEmptyClick({ ...slot, dayIndex: i });
                    }
                  : undefined
              }
              style={{
                flex: 1,
                minWidth: 0,
                position: "relative",
                borderLeft: `1px solid ${T.border}`,
                background: d.today
                  ? `color-mix(in srgb, ${T.lime} 3%, transparent)`
                  : "transparent",
                height: bodyH,
              }}
            >
              {renderDay(i, d)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
