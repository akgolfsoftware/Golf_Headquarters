"use client";

import { useState, type CSSProperties, type DragEvent } from "react";
import { TimeGrid, timeGridBlockStyle, type TimeGridDay } from "@/components/v2/time-grid";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { formatHours, formatKlokke, UI } from "@/lib/domain/workbench/labels";
import type { WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import { lesKildeDataTransfer } from "./wb-drag";
import { harHake, STATUS_CAPS, WARM } from "./wb-visuelt";

const DAGKORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const WB_HOUR_PX = 48;

export function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

type Props = {
  week: WeekViewModel;
  selectedSessionId: string | null;
  onSelectSession: (id: string | null) => void;
  onCreateAt: (date: string, startMinute: number) => void;
  onDropSource?: (date: string, startMinute: number, sourceId: string) => void;
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
    date: String(Number(d.date.slice(8, 10))),
    today: d.date === idag,
  }));
  const antallOkter = week.days.reduce((sum, d) => sum + d.sessions.length, 0);

  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      {antallOkter === 0 && (
        <div aria-hidden style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, zIndex: 4, pointerEvents: "none" }}>
          <span style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>{UI.emptyWeekTitle}</span>
          <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>{UI.emptyWeekHint}</span>
        </div>
      )}
      <TimeGrid
        days={days}
        hourPx={WB_HOUR_PX}
        bordered={false}
        style={{ background: "transparent" }}
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
                <div key={b.id} aria-hidden style={{ ...timeGridBlockStyle(b.startMinute, b.durationMinutes, undefined, WB_HOUR_PX), background: TL.elev, borderRadius: 2, opacity: 0.55, pointerEvents: "none", padding: "5px 7px", fontFamily: TL.font.sans, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute, overflow: "hidden" }}>
                  {b.title}
                </div>
              ))}
              {dag.sessions.map((s) => (
                <OktKort key={s.id} session={s} valgt={s.id === selectedSessionId} onClick={() => onSelectSession(s.id)} onDropDrill={onDropDrillOnSession ? (sourceId) => onDropDrillOnSession(s.id, sourceId) : undefined} />
              ))}
            </>
          );
        }}
      />
    </div>
  );
}

function OktKort({ session, valgt, onClick, onDropDrill }: { session: WorkbenchSession; valgt: boolean; onClick: () => void; onDropDrill?: (sourceId: string) => void }) {
  const utkast = session.status === "DRAFT";
  const hake = harHake(session.status);
  const skjultHosSpiller = !!session.hiddenByPlayer;
  const venterGodkjenning = !!session.needsPlayerApproval;
  const [dragOver, setDragOver] = useState(false);
  const formelTekst = (session.drills[0]?.akFormel.label ?? session.pyramid).toUpperCase();
  const statusTekst = skjultHosSpiller ? UI.hiddenByPlayerBadge : venterGodkjenning ? UI.approvalPendingBadge : STATUS_CAPS[session.status];
  const stil: CSSProperties = {
    ...timeGridBlockStyle(session.startMinute, session.durationMinutes, undefined, WB_HOUR_PX),
    textAlign: "left",
    appearance: "none",
    cursor: "pointer",
    overflow: "hidden",
    padding: "4px 7px",
    minHeight: 44,
    borderRadius: 2,
    border: "none",
    background: utkast ? "transparent" : TL.dock,
    boxShadow: valgt ? `inset 0 0 0 2px ${TL.text}` : dragOver ? `inset 0 0 0 2px ${TL.text}` : utkast ? `inset 0 0 0 1px ${TL.draftBorder}` : "none",
    zIndex: valgt ? 3 : 2,
    opacity: skjultHosSpiller ? 0.45 : 1,
  };
  return (
    <button type="button" className="v2-focus" onClick={onClick} aria-pressed={valgt} title={`${session.title} · ${formatKlokke(session.startMinute)} · ${formatHours(session.durationMinutes)} t · ${statusTekst}`} style={stil} onDragOver={onDropDrill ? (e: DragEvent<HTMLButtonElement>) => { e.preventDefault(); setDragOver(true); } : undefined} onDragLeave={onDropDrill ? () => setDragOver(false) : undefined} onDrop={onDropDrill ? (e: DragEvent<HTMLButtonElement>) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); const sourceId = lesKildeDataTransfer(e); if (sourceId) onDropDrill(sourceId); } : undefined}>
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 10, fontWeight: 600, letterSpacing: "0.02em", color: TL.mute, whiteSpace: "nowrap", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{formelTekst}</span>
        {hake && !skjultHosSpiller && !venterGodkjenning ? (
          <Icon name="check" size={11} style={{ color: WARM, flexShrink: 0 }} />
        ) : session.seriesId ? (
          <span style={{ fontSize: 10, fontWeight: 600, color: TL.mute, flexShrink: 0 }}>↻</span>
        ) : venterGodkjenning || skjultHosSpiller ? (
          <span style={{ fontSize: 10, fontWeight: 600, color: TL.mute, flexShrink: 0 }}>!</span>
        ) : null}
      </span>
      <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, lineHeight: 1.25, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.title}</span>
      <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 11, fontWeight: 400, color: TL.mute, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{formatKlokke(session.startMinute)} · {formatHours(session.durationMinutes)} t</span>
    </button>
  );
}
