"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { addMonths } from "@/lib/domain/workbench/operations";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import type { MonthViewModel, PyramidArea, SourceItem } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { osloIdag } from "./WeekGrid";
import { SourcesPanel } from "./SourcesPanel";
import { VisningPiller } from "./VisningPiller";

type Props = {
  playerId: string;
  spillerNavn: string;
  maned: MonthViewModel;
  kilder: SourceItem[];
  roster?: { id: string; navn: string }[];
};

const PYRAMIDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

function timer(minutter: number): string {
  return minutter > 0 ? `${formatHours(minutter)} t` : "—";
}

export function WorkbenchManed({ playerId, spillerNavn, maned, kilder, roster = [] }: Props) {
  const router = useRouter();
  const idag = osloIdag();
  const [aar, manedNummer] = maned.monthStart.split("-").map(Number);
  const manedsnavn = UI.monthNames[manedNummer - 1];
  const progress = maned.plannedToDateMinutes > 0
    ? Math.min(100, Math.round((maned.completedMinutes / maned.plannedToDateMinutes) * 100))
    : 0;

  function naviger(delta: -1 | 1) {
    const neste = addMonths(maned.monthStart, delta).slice(0, 7);
    router.push(workbenchUrl(playerId, "maned", { maned: neste }));
  }

  return <div className="wb-layout">
    <aside className="wb-sources">
      <SourcesPanel kilder={kilder} playerId={playerId} maned={maned.monthStart.slice(0, 7)} aar={String(aar)} />
      <nav className="wb-roster" aria-label="Spillere i stallen"><span className="wb-kicker">Stall</span>{roster.map((spiller) => <Link key={spiller.id} href={`/admin/workbench/${spiller.id}?vis=maned&maned=${maned.monthStart.slice(0, 7)}`} aria-current={spiller.id === playerId ? "page" : undefined}>{spiller.navn}<small>Spiller</small></Link>)}</nav>
    </aside>

    <main className="wb-main">
      <div className="wb-pills"><VisningPiller playerId={playerId} visning="maned" uke={maned.weeks[0]?.weekStart} maned={maned.monthStart.slice(0, 7)} aar={String(aar)} /></div>
      <div className="wb-body wb-month-body">
        <div className="wb-month-heading">
          <div><span className="wb-kicker">Månedsplan</span><h1>{manedsnavn}</h1></div>
          <span className="wb-month-year">{aar}</span>
          <span className="wb-sub">{spillerNavn}</span>
          <div className="wb-month-progress"><span className="wb-kicker">{UI.periodProgress}</span><b>{timer(maned.completedMinutes)} av {timer(maned.plannedToDateMinutes)}</b><span className="wb-period-meter"><i style={{ width: `${progress}%` }} /></span></div>
        </div>

        <div className="wb-month-controls" aria-label="Månedshandlinger"><button type="button" className="wb-quiet" aria-label={UI.monthNavPrev} onClick={() => naviger(-1)}>‹</button><button type="button" className="wb-quiet" onClick={() => router.push(workbenchUrl(playerId, "maned", { maned: idag.slice(0, 7) }))}>{UI.today}</button><button type="button" className="wb-quiet" aria-label={UI.monthNavNext} onClick={() => naviger(1)}>›</button></div>

        <section className="wb-month-distribution"><span className="wb-kicker">{UI.periodDistribution}</span><div>{PYRAMIDER.map((pyramid) => <span key={pyramid} className="wb-month-tag"><i data-lag={pyramid} />{pyramid}<b>{timer(maned.completedByPyramid[pyramid])} av {timer(maned.budget.byPyramid[pyramid])}</b></span>)}</div></section>

        {maned.empty ? <section className="wb-period-empty"><span className="wb-kicker">{UI.emptyMonthTitle}</span><p>{UI.emptyMonthBody}</p><Link className="wb-quiet" href={workbenchUrl(playerId, "uke", { uke: maned.weeks[0]?.weekStart })}>{UI.openWeek}</Link></section> : <MonthCalendar playerId={playerId} maned={maned} idag={idag} />}
      </div>
    </main>

    <aside className="wb-inspector"><MonthSummary playerId={playerId} maned={maned} /></aside>
    <aside className="wb-mobile-summary" aria-label="Valgt måned"><div className="wb-grip" aria-hidden /><MonthSummary playerId={playerId} maned={maned} compact /></aside>
  </div>;
}

function MonthCalendar({ playerId, maned, idag }: { playerId: string; maned: MonthViewModel; idag: string }) {
  return <section className="wb-month-calendar" aria-label={`Månedskalender ${maned.label}`}>
    <div className="wb-month-weekdays">{UI.weekdayShort.map((dag) => <span key={dag}>{dag}</span>)}</div>
    <div className="wb-month-days">{maned.weeks.flatMap((uke) => uke.days.map((dag) => <Link key={dag.date} href={workbenchUrl(playerId, "uke", { uke: uke.weekStart })} className="wb-month-day" data-in-month={dag.inMonth} aria-current={dag.date === idag ? "date" : undefined}>
      <span className="wb-month-date">{dag.dayOfMonth}.</span>
      <span className="wb-month-lines">{dag.lines.length === 0 ? <small>—</small> : dag.lines.map((linje, index) => <span key={`${dag.date}:${index}`} data-lag={linje.pyramid}>{linje.title}</span>)}{dag.restCount > 0 && <small>{UI.moreCount(dag.restCount)}</small>}</span>
      <span className="wb-month-bars" aria-hidden>{dag.lines.length === 0 ? "—" : dag.lines.map((linje, index) => <i key={`${dag.date}:bar:${index}`} data-lag={linje.pyramid} />)}</span>
    </Link>))}</div>
  </section>;
}

function MonthSummary({ playerId, maned, compact = false }: { playerId: string; maned: MonthViewModel; compact?: boolean }) {
  const første = maned.weeks.find((uke) => uke.days.some((dag) => dag.inMonth));
  return <section className="wb-week-summary wb-month-summary"><span className="wb-kicker">Valgt måned</span><h2>{maned.label}</h2><p>{maned.sessionCount} økter · {timer(maned.budget.plannedMinutes)}</p>{!compact && <><span className="wb-kicker">Uker</span><div className="wb-month-week-list">{maned.weekSummaries.map((uke) => <Link key={uke.weekStart} href={workbenchUrl(playerId, "uke", { uke: uke.weekStart })}><b>Uke {uke.weekNumber}</b><span>{uke.sessionCount} økter · {timer(uke.minutes)}</span></Link>)}</div><p>{UI.monthHint}</p></>}<div className="wb-mobile-actions"><Link className="wb-quiet" href={workbenchUrl(playerId, "uke", { uke: første?.weekStart })}>{UI.openWeek}</Link></div></section>;
}
