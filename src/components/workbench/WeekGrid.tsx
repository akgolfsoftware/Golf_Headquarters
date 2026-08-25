"use client";

/**
 * WeekGrid — Agency Workbench-uke (natt-plan Loop 2).
 *
 * Leser `WeekViewModel` fra `loadWeek` og tegner sju dagkolonner på den delte
 * TimeGrid-motoren (05:00–23:00, 30 min, Notion-fasit). Flytting skjer i
 * inspektøren i v1 — ingen ny drag-lib (anti-scope).
 */

import { type CSSProperties } from "react";
import { TimeGrid, timeGridBlockStyle, type TimeGridDay } from "@/components/v2/time-grid";
import { Icon } from "@/components/v2/icon";
import { T } from "@/lib/v2/tokens";
import { TL } from "@/lib/v2/train-lock";
import { formatTime, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import { harHake, STATUS_CAPS, WARM } from "./wb-visuelt";

const DAGKORT = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];

/** Dagens dato i Oslo som YYYY-MM-DD (samme svar på server og klient). */
export function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

type Props = {
  week: WeekViewModel;
  selectedSessionId: string | null;
  onSelectSession: (id: string | null) => void;
  onCreateAt: (date: string, startMinute: number) => void;
};

export function WeekGrid({ week, selectedSessionId, onSelectSession, onCreateAt }: Props) {
  const idag = osloIdag();

  const days: TimeGridDay[] = week.days.map((d, i) => ({
    id: d.date,
    dow: DAGKORT[i] ?? "",
    date: `${d.date.slice(8, 10)}.${d.date.slice(5, 7)}`,
    today: d.date === idag,
  }));

  const antallOkter = week.days.reduce((sum, d) => sum + d.sessions.length, 0);

  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      {antallOkter === 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 10,
            border: `1px dashed ${T.border}`,
            borderRadius: T.rCard,
            padding: "12px 16px",
            background: T.panel,
          }}
        >
          <span style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
            {UI.emptyWeekTitle}
          </span>
          <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
            {UI.emptyWeekHint}
          </span>
        </div>
      )}

      <TimeGrid
        days={days}
        onEmptyClick={(slot) => {
          const dag = week.days[slot.dayIndex];
          if (dag) onCreateAt(dag.date, slot.startMin);
        }}
        renderDay={(i) => {
          const dag = week.days[i];
          if (!dag) return null;
          return (
            <>
              {dag.lockedBlocks.map((b) => (
                <div
                  key={b.id}
                  aria-hidden
                  style={{
                    ...timeGridBlockStyle(b.startMinute, b.durationMinutes),
                    background: T.panel2,
                    border: `1px dashed ${T.border}`,
                    borderRadius: 8,
                    opacity: 0.55,
                    pointerEvents: "none",
                    padding: "3px 6px",
                    fontFamily: T.ui,
                    fontSize: 10,
                    color: T.mut,
                    overflow: "hidden",
                  }}
                >
                  {b.title}
                </div>
              ))}
              {dag.sessions.map((s) => (
                <OktKort
                  key={s.id}
                  session={s}
                  valgt={s.id === selectedSessionId}
                  onClick={() => onSelectSession(s.id)}
                />
              ))}
            </>
          );
        }}
      />

    </div>
  );
}

function OktKort({
  session,
  valgt,
  onClick,
}: {
  session: WorkbenchSession;
  valgt: boolean;
  onClick: () => void;
}) {
  const utkast = session.status === "DRAFT";
  const hake = harHake(session.status);
  const slutt = session.startMinute + session.durationMinutes;

  // Fasit-blokken (A-01/AG-00 K1): flat dock-flate, radius 12 ("skinne-rad"),
  // ingen fargekoding per pyramide-område. UTKAST = hvit hairline i stedet
  // for fyll (A-01d). Valgt = inset hvit ring, ALDRI warm/grønn (den fargen
  // er reservert fullført-hake).
  const stil: CSSProperties = {
    ...timeGridBlockStyle(session.startMinute, session.durationMinutes),
    textAlign: "left",
    appearance: "none",
    cursor: "pointer",
    overflow: "hidden",
    padding: "4px 7px",
    borderRadius: TL.radius.row,
    background: utkast ? "transparent" : TL.dock,
    border: utkast ? `1px solid ${TL.draftBorder}` : `1px solid ${TL.hair}`,
    boxShadow: valgt ? `inset 0 0 0 2px ${TL.text}` : "none",
    zIndex: valgt ? 3 : 1,
  };

  return (
    <button
      type="button"
      className="v2-focus"
      onClick={onClick}
      aria-pressed={valgt}
      title={`${session.title} · ${formatTime(session.startMinute)}–${formatTime(slutt)} · ${PYRAMID_LABEL[session.pyramid]} · ${STATUS_CAPS[session.status]}`}
      style={stil}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: T.mono,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: utkast ? T.mut : WARM,
        }}
      >
        {hake && <Icon name="check" size={9} style={{ color: WARM }} />}
        {STATUS_CAPS[session.status]}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: T.ui,
          fontSize: 11.5,
          fontWeight: 600,
          color: T.fg,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {session.title}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: T.mono,
          fontSize: 9.5,
          color: T.mut,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTime(session.startMinute)}–{formatTime(slutt)}
      </span>
    </button>
  );
}
