"use client";

import { useState, type CSSProperties, type DragEvent } from "react";
import { formatHours, formatKlokke, UI } from "@/lib/domain/workbench/labels";
import type { WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import { calendarLanes } from "@/lib/workbench/calendar-layout";
import { lesKildeDataTransfer } from "./wb-drag";
import { STATUS_CAPS } from "./wb-visuelt";

const DAGKORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const START = 5 * 60;
const HOUR_PX = 32;
const HOURS = Array.from({ length: 18 }, (_, i) => i + 5);
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

export function WeekGrid({ week, selectedSessionId, onSelectSession, onCreateAt, onDropSource, onDropDrillOnSession }: Props) {
  const [dayIndex, setDayIndex] = useState(0);
  const [dayPickerOpen, setDayPickerOpen] = useState(false);
  const count = week.days.reduce((n,d) => n + d.sessions.length, 0);
  function slot(e: { clientY: number; currentTarget: HTMLElement }) {
    const top = e.currentTarget.getBoundingClientRect().top;
    return Math.min(22 * 60, Math.max(START, START + Math.floor((e.clientY-top) / HOUR_PX * 2) * 30));
  }
  return <section aria-label={UI.calendarTitle}>
    <div className="wb-day-picker" data-open={dayPickerOpen} aria-label={UI.selectDay}>{week.days.map((day,i) => <button key={day.date} type="button" aria-pressed={dayIndex === i} onClick={() => { setDayIndex(i); setDayPickerOpen(false); }}>{DAGKORT[i]}<b>{Number(day.date.slice(8))}.</b></button>)}</div>
    {count === 0 && <p className="wb-empty">{UI.emptyWeekTitle} · {UI.emptyWeekHint}</p>}
    <div className="wb-calendar">
      <div className="wb-calendar-axis"><div className="wb-day-heading"/><div className="wb-band"/>{HOURS.map(h => <span key={h}>{String(h).padStart(2,"0")}:00</span>)}</div>
      {week.days.map((day,i) => {
        const lanes = calendarLanes(day.sessions);
        return <div key={day.date} className="wb-calendar-day" data-mobile-selected={dayIndex === i}>
          <div className="wb-day-heading wb-day-desktop">{DAGKORT[i]} <b>{Number(day.date.slice(8))}.</b></div>
          <button type="button" className="wb-day-heading wb-day-switch" aria-label={`${UI.selectDay}: ${DAGKORT[i]} ${Number(day.date.slice(8))}.`} aria-expanded={dayPickerOpen} onClick={() => setDayPickerOpen(p => !p)}>{DAGKORT[i]} <b>{Number(day.date.slice(8))}.</b></button>
          <div className="wb-band">{day.lockedBlocks.map(b => <span key={b.id} title={`${b.title} · ${formatKlokke(b.startMinute)} · ${formatHours(b.durationMinutes)} t`}>{b.title}</span>)}</div>
          <div className="wb-day-hours" onClick={e => {if(e.target === e.currentTarget)onCreateAt(day.date,slot(e));}} onDragOver={onDropSource ? e => e.preventDefault() : undefined} onDrop={onDropSource ? e => { e.preventDefault(); const id=lesKildeDataTransfer(e);if(id)onDropSource(day.date,slot(e),id); } : undefined}>
            {day.sessions.map(s => <OktKort key={s.id} session={s} lane={lanes.get(s.id)!} valgt={s.id === selectedSessionId} onClick={() => onSelectSession(s.id)} onDropDrill={onDropDrillOnSession ? id => onDropDrillOnSession(s.id,id) : undefined}/>) }
          </div>
        </div>;
      })}
    </div>
  </section>;
}
function OktKort({ session, lane, valgt, onClick, onDropDrill }: { session: WorkbenchSession; lane: { lane: number; count: number }; valgt: boolean; onClick: () => void; onDropDrill?: (id: string) => void }) {
  const [dragOver,setDragOver]=useState(false);
  const start = Math.max(START,session.startMinute);
  const end = Math.min(23*60,session.startMinute+session.durationMinutes);
  const outside = session.startMinute < START || session.startMinute >= 23*60;
  const style: CSSProperties = {
    top: Math.max(0, Math.min(532,(start-START)/60*HOUR_PX)),
    height: Math.max(44,(end-start)/60*HOUR_PX),
    left: `calc(${lane.lane/lane.count*100}% + 2px)`, width: `calc(${100/lane.count}% - 4px)`,
    opacity: session.hiddenByPlayer ? .45 : 1,
  };
  const status = session.hiddenByPlayer ? UI.hiddenByPlayerBadge : session.needsPlayerApproval ? UI.approvalPendingBadge : STATUS_CAPS[session.status];
  const drop = onDropDrill ? (e: DragEvent<HTMLButtonElement>) => { e.preventDefault();e.stopPropagation();setDragOver(false);const id=lesKildeDataTransfer(e);if(id)onDropDrill(id); } : undefined;
  return <button type="button" className="wb-session" data-lag={session.pyramid} data-drag-over={dragOver} aria-pressed={valgt} style={style} onClick={onClick} title={`${session.title} · ${formatKlokke(session.startMinute)} · ${formatHours(session.durationMinutes)} t · ${status}`} onDragOver={onDropDrill ? e=>{e.preventDefault();setDragOver(true);} : undefined} onDragLeave={()=>setDragOver(false)} onDrop={drop}>
    <span>{session.title}</span><small>{formatKlokke(session.startMinute).replace(".",":")}–{formatKlokke(session.startMinute+session.durationMinutes).replace(".",":")}{outside ? " · utenfor aksen" : ""}</small>
    {(session.needsPlayerApproval || session.hiddenByPlayer) && <small>{status}</small>}
  </button>;
}
