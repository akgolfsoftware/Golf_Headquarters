"use client";

/**
 * WeekGrid — Agency Workbench-uke (natt-plan Loop 2, drag fra kilder B5).
 *
 * Leser `WeekViewModel` fra `loadWeek` og tegner sju dagkolonner på den delte
 * TimeGrid-motoren (05:00–23:00, 30 min, Notion-fasit). Flytting av
 * eksisterende økter skjer fortsatt i inspektøren (anti-scope, ingen ny
 * drag-lib for det) — men å dra en kilde INN i uka bruker native HTML5
 * drag-and-drop (`draggable` i SourcesPanel + `onDropSlot` her).
 */

import { type CSSProperties, type DragEvent } from "react";
import { TimeGrid, timeGridBlockStyle, type TimeGridDay } from "@/components/v2/time-grid";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { formatTime, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import { lesKildeDataTransfer } from "./wb-drag";
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
  /** Kilde sluppet på åpen flate i uka — oppretter ny økt (B5). */
  onDropSource?: (date: string, startMinute: number, sourceId: string) => void;
  /** Kilde (kun øvelser) sluppet direkte på en eksisterende økt (B5). */
  onDropDrillOnSession?: (sessionId: string, sourceId: string) => void;
};

export function WeekGrid({
  week,
  selectedSessionId,
  onSelectSession,
  onCreateAt,
  onDropSource,
  onDropDrillOnSession,
}: Props) {
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
            border: `1px dashed ${TL.hair}`,
            borderRadius: TL.radius.card,
            padding: "12px 16px",
            background: TL.elev,
          }}
        >
          <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>
            {UI.emptyWeekTitle}
          </span>
          <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>
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
        onDropSlot={
          onDropSource
            ? (slot, e) => {
                const dag = week.days[slot.dayIndex];
                const sourceId = lesKildeDataTransfer(e);
                if (dag && sourceId) onDropSource(dag.date, slot.startMin, sourceId);
              }
            : undefined
        }
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
                    background: TL.dock,
                    border: `1px dashed ${TL.hair}`,
                    borderRadius: 8,
                    opacity: 0.55,
                    pointerEvents: "none",
                    padding: "3px 6px",
                    fontFamily: TL.font.sans,
                    fontSize: 10,
                    color: TL.mute,
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
                  onDropDrill={
                    onDropDrillOnSession
                      ? (sourceId) => onDropDrillOnSession(s.id, sourceId)
                      : undefined
                  }
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
  onDropDrill,
}: {
  session: WorkbenchSession;
  valgt: boolean;
  onClick: () => void;
  onDropDrill?: (sourceId: string) => void;
}) {
  const utkast = session.status === "DRAFT";
  const hake = harHake(session.status);
  const slutt = session.startMinute + session.durationMinutes;
  // Skjult av spilleren («ikke delta»/avvist, WB-10) — gruppen/coachens plan
  // er uendret, men markeres dimmet her (WB-10c-mønsteret).
  const skjultHosSpiller = !!session.hiddenByPlayer;
  const venterGodkjenning = !!session.needsPlayerApproval;
  const statusTekst = skjultHosSpiller
    ? UI.hiddenByPlayerBadge
    : venterGodkjenning
      ? UI.approvalPendingBadge
      : STATUS_CAPS[session.status];

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
    opacity: skjultHosSpiller ? 0.45 : 1,
  };

  return (
    <button
      type="button"
      className="v2-focus"
      onClick={onClick}
      aria-pressed={valgt}
      title={`${session.title} · ${formatTime(session.startMinute)}–${formatTime(slutt)} · ${PYRAMID_LABEL[session.pyramid]} · ${statusTekst}`}
      style={stil}
      onDragOver={onDropDrill ? (e: DragEvent<HTMLButtonElement>) => e.preventDefault() : undefined}
      onDrop={
        onDropDrill
          ? (e: DragEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              const sourceId = lesKildeDataTransfer(e);
              if (sourceId) onDropDrill(sourceId);
            }
          : undefined
      }
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: TL.font.mono,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: utkast ? TL.mute : WARM,
        }}
      >
        {hake && !skjultHosSpiller && !venterGodkjenning && <Icon name="check" size={9} style={{ color: WARM }} />}
        {statusTekst}
      </span>
      <span
        style={{
          display: "block",
          fontFamily: TL.font.sans,
          fontSize: 11.5,
          fontWeight: 600,
          color: TL.text,
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
          fontFamily: TL.font.mono,
          fontSize: 9.5,
          color: TL.mute,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatTime(session.startMinute)}–{formatTime(slutt)}
      </span>
    </button>
  );
}
