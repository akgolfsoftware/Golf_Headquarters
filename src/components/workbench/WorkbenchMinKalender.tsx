"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";

import { AREA_LABEL, formatHours, formatTime, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import { addDays, isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { Drill, WorkbenchSession } from "@/lib/domain/workbench/types";
import { calendarLanes } from "@/lib/workbench/calendar-layout";
import type { MinKalenderData, MinKalenderItem } from "@/lib/workbench/min-calendar";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { VisningPiller } from "./VisningPiller";

const DAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const HOURS = Array.from({ length: 18 }, (_, index) => index + 5);
const START = 5 * 60;
const HOUR_PX = 32;

const MOTORIKK: Record<string, string> = { UTEN_BALL: "Uten ball", LAV_HAST: "Lav hastighet", AUTO: "Automatikk" };
const BELASTNING: Record<string, string> = { INNENDORS: "Innendørs", TRENINGSOMRADE: "Treningsområde", BANE: "Bane", KONKURRANSE: "Konkurranse" };
const PRESS: Record<string, string> = { ALENE: "Alene", OBSERVERT: "Observert", KONKURRANSE: "Konkurranse", TURNERING: "Turnering" };
const PRAKSIS: Record<string, string> = { BLOKK: "Blokk", VARIABEL: "Variabel", KONKURRANSE: "Konkurranse", SPILL_TEST: "Spilltest" };

function rangeLabel(weekStart: string): string {
  const start = new Date(`${weekStart}T12:00:00Z`);
  const end = new Date(`${addDays(weekStart, 6)}T12:00:00Z`);
  const startText = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: start.getUTCMonth() === end.getUTCMonth() ? undefined : "long", timeZone: "UTC" }).format(start);
  const endText = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", timeZone: "UTC" }).format(end);
  return `${startText}–${endText}`;
}

function dateLabel(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

function formula(session?: WorkbenchSession) {
  const drill: Drill | undefined = session?.drills[0];
  const f = drill?.akFormel;
  return [
    { label: UI.pyramid, value: session ? PYRAMID_LABEL[session.pyramid] : "—" },
    { label: UI.drillArea, value: f ? AREA_LABEL[f.area] : session?.skillArea ?? "—" },
    { label: UI.formelMotorikk, value: f?.motorikk ? MOTORIKK[f.motorikk] : "—" },
    { label: UI.formelBelastning, value: f?.belastning ? BELASTNING[f.belastning] : session?.environment ? BELASTNING[session.environment] ?? session.environment : "—" },
    { label: UI.formelPress, value: f?.press ? PRESS[f.press] : session?.pressureLevel ?? "—" },
    { label: UI.formelHensikt, value: session?.rationale ?? "—" },
    { label: UI.formelMate, value: drill?.description ?? (session?.practiceType ? PRAKSIS[session.practiceType] : "—") },
    { label: UI.formelMal, value: drill?.techniqueFocus ?? session?.maalsetning ?? "—" },
  ];
}

function Inspector({ item }: { item?: MinKalenderItem }) {
  if (!item) return <p className="wb-empty">Velg en økt for å se detaljene.</p>;
  const rows = formula(item.session);
  return <section className="wb-week-summary wb-min-summary">
    <span className="wb-kicker">Valgt økt</span>
    <h2>{item.title}</h2>
    <p>{dateLabel(item.date)} · {formatTime(item.startMinute)}–{formatTime(item.startMinute + item.durationMinutes)}</p>
    <span className="wb-kicker">Formel</span>
    <dl>{rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
    <Link className="wb-quiet wb-inline-link wb-min-open" href={item.href}>Åpne økt</Link>
  </section>;
}

function SourcePanel({ playerId, data }: { playerId: string; data: MinKalenderData }) {
  return <>
    <span className="wb-kicker">Tidsnivå</span>
    <nav className="wb-min-levels" aria-label="Tidsnivå">
      <Link href={workbenchUrl(playerId, "uke", { uke: data.weekStart })}>Uke<small>Uke {isoWeekNumber(data.weekStart)}</small></Link>
      <Link href={workbenchUrl(playerId, "min", { uke: data.weekStart })} aria-current="page">Min kalender<small>{rangeLabel(data.weekStart)}</small></Link>
    </nav>
    <section className="wb-min-sources"><span className="wb-kicker">Egne maler</span>{data.templates.length ? data.templates.map((item) => <div key={item.id}><b>{item.title}</b><small>{item.subtitle}</small></div>) : <p>Ingen lagrede maler.</p>}</section>
    <section className="wb-min-sources"><span className="wb-kicker">Bookinger</span>{data.bookings.length ? data.bookings.map((item) => <div key={item.id}><b>{item.title}</b><small>{item.subtitle}</small></div>) : <p>Ingen bookinger denne uken.</p>}</section>
  </>;
}

export function WorkbenchMinKalender({ playerId, coachName, data }: { playerId: string; coachName: string; data: MinKalenderData }) {
  const router = useRouter();
  const all = useMemo(() => data.days.flatMap((day) => day.items), [data.days]);
  const initialDay = Math.max(0, data.days.findIndex((day) => day.date === data.todayIso));
  const [dayIndex, setDayIndex] = useState(initialDay);
  const [selectedId, setSelectedId] = useState(all.find((item) => item.kind === "WORKBENCH")?.id ?? all[0]?.id ?? "");
  const selected = all.find((item) => item.id === selectedId) ?? all[0];
  const totalMinutes = all.reduce((sum, item) => sum + item.durationMinutes, 0);
  const mobileItems = data.days[dayIndex]?.items ?? [];
  const mobileMinutes = mobileItems.reduce((sum, item) => sum + item.durationMinutes, 0);
  const currentDayIndex = data.days.findIndex((day) => day.date === data.todayIso);

  return <div className="wb-layout wb-min-layout">
    <aside className="wb-sources"><SourcePanel playerId={playerId} data={data} /></aside>
    <main className="wb-main">
      <div className="wb-pills"><VisningPiller playerId={playerId} visning="min" uke={data.weekStart} maned={data.weekStart.slice(0, 7)} aar={data.weekStart.slice(0, 4)} /></div>
      <div className="wb-body wb-min-body">
        <header className="wb-heading wb-min-heading"><div><span className="wb-kicker">Min kalender</span><h1>Uke {isoWeekNumber(data.weekStart)}</h1></div><span className="wb-sub wb-min-desktop-meta">{coachName} · {rangeLabel(data.weekStart)} · {all.length} økter · {formatHours(totalMinutes)} t</span><span className="wb-sub wb-min-mobile-meta">{coachName} · {dateLabel(data.days[dayIndex]?.date ?? data.weekStart)} · {mobileItems.length} økter · {formatHours(mobileMinutes)} t</span></header>
        <nav className="wb-min-week-nav" aria-label="Velg uke"><button type="button" className="wb-quiet" onClick={() => router.push(workbenchUrl(playerId, "min", { uke: addDays(data.weekStart, -7) }))}>←</button><button type="button" className="wb-quiet" onClick={() => router.push(workbenchUrl(playerId, "min", { uke: data.todayIso }))}>I dag</button><button type="button" className="wb-quiet" onClick={() => router.push(workbenchUrl(playerId, "min", { uke: addDays(data.weekStart, 7) }))}>→</button></nav>
        <section className="wb-calendar wb-min-calendar" aria-label="Min kalender">
          <div className="wb-calendar-axis"><div className="wb-day-heading"/><div className="wb-band"/>{HOURS.map((hour) => <span key={hour}>{String(hour).padStart(2, "0")}:00</span>)}</div>
          {data.days.map((day, index) => {
            const lanes = calendarLanes(day.items);
            return <div key={day.date} className="wb-calendar-day" data-mobile-selected={dayIndex === index}><div className="wb-day-heading"><button type="button" className="wb-min-day-switch" aria-label={`Neste dag etter ${DAYS[index]} ${Number(day.date.slice(8))}.`} onClick={() => setDayIndex((index + 1) % data.days.length)}>{DAYS[index]} <b>{Number(day.date.slice(8))}.</b></button></div><div className="wb-band"/><div className="wb-day-hours">{day.items.map((item) => {
              const start = Math.max(START, item.startMinute);
              const end = Math.min(23 * 60, item.startMinute + item.durationMinutes);
              const lane = lanes.get(item.id) ?? { lane: 0, count: 1 };
              const style: CSSProperties = { top: Math.max(0, Math.min(532, (start - START) / 60 * HOUR_PX)), height: Math.max(44, (end - start) / 60 * HOUR_PX), left: `calc(${lane.lane / lane.count * 100}% + 2px)`, width: `calc(${100 / lane.count}% - 4px)` };
              return <button key={item.id} type="button" className="wb-session" data-lag={item.pyramid ?? "TEK"} aria-pressed={selected?.id === item.id} style={style} onClick={() => setSelectedId(item.id)}><span>{item.title}</span><small>{formatTime(item.startMinute)}–{formatTime(item.startMinute + item.durationMinutes)}</small></button>;
            })}{currentDayIndex === index ? <span className="wb-min-now" style={{ top: Math.max(0, Math.min(576, (data.nowMinute - START) / 60 * HOUR_PX)) }} aria-hidden><i /></span> : null}</div></div>;
          })}
        </section>
      </div>
    </main>
    <aside className="wb-inspector"><Inspector item={selected} /></aside>
    {selected ? <aside className="wb-mobile-summary wb-min-mobile" aria-label="Valgt økt"><div className="wb-grip" aria-hidden/><Inspector item={selected} /></aside> : null}
  </div>;
}
