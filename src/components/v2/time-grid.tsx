"use client";

/**
 * TimeGrid — felles Workbench-uke/dag-motor (N1, Train-lock PX-2).
 *
 * Én motor for tidskolonne + dag-headers + timelinjer + nå-linje.
 * Dag-innhold (økter, droppable, booking-blokker) leveres via `renderDay`.
 *
 * Fasit: designsystem/train-lock/A-01 Mac Uke Pro.dc.html (rutenettet):
 * dag-header «Man 17» caps 11/600/0.08em (i dag = tekstfarge, ellers mute),
 * kun hele timer som hairline-linjer, klokkeslett «07.00» 10/600 mute i
 * tidskolonnen, nå-linje = 1 px tekst-hvit over hele raden med 9 px prikk,
 * i dag-kolonnen får #16161680-flate. Tidsakse-området (05:00–23:00, 30 min
 * slot-snap) styres fortsatt av src/lib/calendar/notion-grid.ts; fasitens
 * tetthet er 48 px/time (`hourPx`), kalenderen (KA-01) beholder 44.
 * Avvik:
 *   - Valgt PH-07 v3 bruker valgfritt tidsutsnitt og stablet daghode;
 *     øvrige flater beholder sine eksisterende standardverdier.
 *   - PH-07 kontrolleres i tests/visual/portering/plan.py. Dette er ikke
 *     visuell godkjenning av alle eldre Workbench-/kalenderflater.
 */

import {
  type CSSProperties,
  type DragEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GRID_END_HOUR,
  GRID_SLOT_MIN,
  GRID_START_HOUR,
  GRID_START_MIN,
  PIXEL_PER_HOUR,
} from "@/lib/calendar/notion-grid";
import { TL } from "@/lib/v2/train-lock";


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
  /**
   * Native HTML5 drag-and-drop sluppet på tom flate i en dag-kolonne
   * (kilder → uke, B5). Slot beregnes med samme snap som `onEmptyClick`.
   */
  onDropSlot?: (slot: TimeGridSlot, e: DragEvent<HTMLDivElement>) => void;
  showNowLine?: boolean;
  timeColWidth?: number;
  bordered?: boolean;
  /** Piksler per time. Fasit A-01 (workbench) = 48; kalender-fasit KA-01 = 44. */
  hourPx?: number;
  /** PH-07 v3 bruker et innholdsbestemt utsnitt; eldre flater beholder 05–23. */
  startHour?: number;
  endHour?: number;
  stackedHeader?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Snap Y i grid-body til slot innenfor 05:00–(23:00−GRID_SLOT_MIN). */
export function snapYToSlot(y: number, hourPx = PIXEL_PER_HOUR, startHour = GRID_START_HOUR, endHour = GRID_END_HOUR): Omit<TimeGridSlot, "dayIndex"> {
  const hours = startHour + y / hourPx;
  let totalMin = Math.round((hours * 60) / GRID_SLOT_MIN) * GRID_SLOT_MIN;
  const maxStart = endHour * 60 - GRID_SLOT_MIN;
  totalMin = Math.max(startHour * 60, Math.min(maxStart, totalMin));
  return {
    hour: Math.floor(totalMin / 60),
    minute: totalMin % 60,
    startMin: totalMin,
  };
}

/**
 * Absolutt posisjon for en hendelse i TimeGrid-dag-kroppen.
 * Fasit A-01: eksakt topp/høyde (1,5 t = 72 px ved 48 px/time), left/right 3.
 */
export function timeGridBlockStyle(
  startMin: number,
  durationMin: number,
  extra?: CSSProperties,
  hourPx = PIXEL_PER_HOUR,
): CSSProperties {
  const top = Math.max(0, ((startMin - GRID_START_MIN) / 60) * hourPx);
  const height = Math.max(20, (durationMin / 60) * hourPx);
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
  onDropSlot,
  showNowLine = true,
  // Fasit A-01: tidskolonne 48 px, klokkeslett høyrestilt 8 px fra kanten.
  timeColWidth = 48,
  bordered = true,
  hourPx = PIXEL_PER_HOUR,
  startHour = GRID_START_HOUR,
  endHour = GRID_END_HOUR,
  stackedHeader = false,
  className,
  style,
}: Props) {
  const timer = useMemo(() => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i), [startHour, endHour]);
  const bodyH = (endHour - startHour) * hourPx;

  const [tikk, setTikk] = useState(0);
  useEffect(() => {
    if (!showNowLine) return;
    const i = setInterval(() => setTikk((t) => t + 1), 60_000);
    return () => clearInterval(i);
  }, [showNowLine]);

  const now = new Date();
  void tikk;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowInGrid = nowMin >= startHour * 60 && nowMin <= endHour * 60;
  const nowTop = ((nowMin - startHour * 60) / 60) * hourPx;
  const todayIndex = days.findIndex((d) => d.today);

  const shell: CSSProperties = {
    overflow: "hidden",
    borderRadius: bordered ? 12 : 0,
    border: bordered ? `1px solid ${TL.hair}` : "none",
    background: TL.elev,
    ...style,
  };

  return (
    <div className={className} style={shell} data-time-grid="notion">
      {/* Dag-header — fasit A-01: én linje «Man 17», caps 11/600/0.08em,
          i dag = tekstfarge, ellers mute. Ingen prikk, ingen fylt flate. */}
      <div style={{ display: "flex", borderBottom: `1px solid ${TL.hair}` }}>
        <div style={{ width: timeColWidth, flex: "none" }} />
        {days.map((d) => (
          <div
            key={d.id}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "center",
              padding: "10px 0 8px",
            }}
          >
            <span
              style={{
                fontFamily: TL.font.sans,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: d.today ? TL.text : TL.mute,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {d.dow}{stackedHeader ? <strong style={{ display: "block", fontSize: 17, fontWeight: 600, color: d.today ? TL.text : TL.mute, marginTop: 5, letterSpacing: "-0.02em" }}>{d.date}</strong> : ` ${d.date}`}
            </span>
          </div>
        ))}
      </div>

      {/* Kropp: tid + dager */}
      <div style={{ display: "flex", position: "relative", height: bodyH }}>
        {/* Tidsakse — fasit A-01: kun hele timer, «07.00» 10/600 mute,
            høyrestilt 8 px, sentrert på timelinjen. */}
        <div style={{ width: timeColWidth, flex: "none", position: "relative" }}>
          {timer.map((h) =>
            h < endHour ? (
              <span
                key={h}
                style={{
                  position: "absolute",
                  top: (h - startHour) * hourPx - 7,
                  right: 8,
                  fontFamily: TL.font.sans,
                  fontSize: 10,
                  fontWeight: 600,
                  color: TL.mute,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(h).padStart(2, "0")}.00
              </span>
            ) : null,
          )}
        </div>

        <div style={{ flex: 1, position: "relative", display: "flex", minWidth: 0 }}>
          {/* Kun hele timer som hairline (fasit: repeating-gradient per 48 px,
              ingen halvtimelinjer). */}
          {timer.map((h) =>
            h > startHour && h < endHour ? (
              <span
                key={`h-${h}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: (h - startHour) * hourPx,
                  height: 1,
                  background: TL.hair,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            ) : null,
          )}

          {/* Nå-linje — fasit A-01: 1 px tekst-hvit over hele raden + 9 px prikk
              i venstre kant. Aldri fill-glød. */}
          {showNowLine && nowInGrid && todayIndex >= 0 && (
            <div aria-hidden style={{ pointerEvents: "none" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: nowTop,
                  height: 1,
                  background: TL.text,
                  zIndex: 3,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: -4,
                  top: nowTop - 4,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: TL.text,
                  zIndex: 3,
                }}
              />
            </div>
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
                      const slot = snapYToSlot(y, hourPx, startHour, endHour);
                      onEmptyClick({ ...slot, dayIndex: i });
                    }
                  : undefined
              }
              onDragOver={onDropSlot ? (e) => e.preventDefault() : undefined}
              onDrop={
                onDropSlot
                  ? (e) => {
                      e.preventDefault();
                      const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                      const slot = snapYToSlot(y, hourPx, startHour, endHour);
                      onDropSlot({ ...slot, dayIndex: i }, e);
                    }
                  : undefined
              }
              style={{
                flex: 1,
                minWidth: 0,
                position: "relative",
                borderLeft: `1px solid ${TL.hair}`,
                // Fasit A-01: i dag-kolonnen har elev-flate @ 50 % alfa.
                background: d.today
                  ? `color-mix(in srgb, ${TL.elev} 50%, transparent)`
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
