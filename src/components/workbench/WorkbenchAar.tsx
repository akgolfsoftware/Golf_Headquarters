"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import { isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { PlanningGoalSummary, PyramidArea, SourceItem, YearPeriodBand, YearViewModel } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { SourcesPanel } from "./SourcesPanel";
import { VisningPiller } from "./VisningPiller";

type Props = {
  playerId: string;
  spillerNavn: string;
  aar: YearViewModel;
  kilder: SourceItem[];
  roster?: { id: string; navn: string }[];
  goals?: PlanningGoalSummary[];
};

const PYRAMIDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const PERIODE_LABEL: Record<YearPeriodBand["type"], string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialiseringsperiode",
  TURNERING: "Turneringsperiode",
  EVALUERING: "Evalueringsperiode",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};

function timer(minutter: number): string {
  return minutter > 0 ? `${formatHours(minutter)} t` : "—";
}

function datoKort(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

function dagnummer(iso: string): number {
  const [aar, maned, dag] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(aar, maned - 1, dag) / 86_400_000);
}

function periodePosisjon(periode: YearPeriodBand, year: number): { left: string; width: string } {
  const start = dagnummer(`${year}-01-01`);
  const dager = dagnummer(`${year + 1}-01-01`) - start;
  const left = Math.max(0, ((dagnummer(periode.startDate) - start) / dager) * 100);
  return { left: `${left}%`, width: `${Math.max(periode.widthPct, 3)}%` };
}

export function WorkbenchAar({ playerId, spillerNavn, aar, kilder, roster = [], goals = [] }: Props) {
  const router = useRouter();
  const [valgtId, setValgtId] = useState<string | null>(aar.periods.find((periode) => periode.aktiv)?.id ?? aar.periods[0]?.id ?? null);
  const valgt = aar.periods.find((periode) => periode.id === valgtId) ?? null;
  const progress = aar.plannedToDateMinutes > 0 ? Math.min(100, Math.round((aar.completedMinutes / aar.plannedToDateMinutes) * 100)) : 0;

  function naviger(delta: -1 | 1) {
    router.push(workbenchUrl(playerId, "aar", { aar: String(aar.year + delta) }));
  }

  return <div className="wb-layout">
    <aside className="wb-sources">
      <SourcesPanel kilder={kilder} playerId={playerId} aar={String(aar.year)} goals={goals} />
      <nav className="wb-roster" aria-label="Spillere i stallen"><span className="wb-kicker">Stall</span>{roster.map((spiller) => <Link key={spiller.id} href={workbenchUrl(spiller.id, "aar", { aar: String(aar.year) })} aria-current={spiller.id === playerId ? "page" : undefined}>{spiller.navn}<small>Spiller</small></Link>)}</nav>
    </aside>

    <main className="wb-main">
      <div className="wb-pills"><VisningPiller playerId={playerId} visning="aar" aar={String(aar.year)} maned={`${aar.year}-01`} uke={`${aar.year}-01-01`} /></div>
      <div className="wb-body wb-year-body">
        <div className="wb-year-heading">
          <div><span className="wb-kicker">{spillerNavn}</span><h1>{aar.year}</h1></div>
          <span className="wb-sub">1. januar – 31. desember · {aar.periods.length} perioder</span>
          <div className="wb-year-progress"><span className="wb-kicker">{UI.periodProgress}</span><b>{timer(aar.completedMinutes)} av {timer(aar.plannedToDateMinutes)}</b><span className="wb-period-meter"><i style={{ width: `${progress}%` }} /></span></div>
        </div>

        <div className="wb-year-controls" aria-label="Årshandlinger"><button type="button" className="wb-quiet" aria-label={UI.yearNavPrev} onClick={() => naviger(-1)}>‹</button><button type="button" className="wb-quiet" onClick={() => router.push(workbenchUrl(playerId, "aar", { aar: new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Europe/Oslo" }).format(new Date()) }))}>{UI.today}</button><button type="button" className="wb-quiet" aria-label={UI.yearNavNext} onClick={() => naviger(1)}>›</button></div>

        <section className="wb-year-distribution"><span className="wb-kicker">{UI.periodDistribution}</span><div>{PYRAMIDER.map((pyramid) => <span key={pyramid} className="wb-month-tag"><i data-lag={pyramid} />{pyramid}<b>{timer(aar.completedByPyramid[pyramid])} av {timer(aar.budget.byPyramid[pyramid])}</b></span>)}</div></section>

        {aar.periods.length === 0 ? <section className="wb-period-empty"><span className="wb-kicker">{UI.noPeriods}</span><p>{UI.noPeriodBody}</p></section> : <>
          <section className="wb-year-timeline" aria-label={`Perioder i ${aar.year}`}>
            <div className="wb-year-month-axis">{UI.monthNames.map((maned) => <span key={maned}>{maned.slice(0, 3)}</span>)}</div>
            <div className="wb-year-track">{aar.periods.map((periode) => <button key={periode.id} type="button" aria-pressed={periode.id === valgtId} onClick={() => setValgtId(periode.id)} style={periodePosisjon(periode, aar.year)}><b>{PERIODE_LABEL[periode.type]}</b><small>uke {isoWeekNumber(periode.startDate)}–{isoWeekNumber(periode.endDate)} · {timer(periode.completedMinutes)} av {timer(periode.plannedToDateMinutes)}</small><span>{Array.from({ length: Math.max(1, Math.round((dagnummer(periode.endDate) - dagnummer(periode.startDate) + 1) / 7)) }, (_, index) => <i key={index} data-uke={periode.type === "TURNERING" && index % 3 === 0 ? "turnering" : index % 4 === 3 ? "vedlikehold" : "utvikling"} />)}</span></button>)}</div>
            <div className="wb-year-legend"><span><i data-uke="utvikling" />utviklingsuke</span><span><i data-uke="vedlikehold" />vedlikeholdsuke</span><span><i data-uke="turnering" />turneringsuke</span></div>
          </section>

          <section className="wb-year-periods"><span className="wb-kicker">Perioder</span><div className="wb-period-table-wrap"><table className="wb-period-table"><thead><tr><th>Periode</th><th>Uker</th><th>Gjennomført mot plan</th><th>Fokus</th><th>Turneringer</th></tr></thead><tbody>{aar.periods.map((periode) => <tr key={periode.id} data-selected={periode.id === valgtId}><td><button type="button" onClick={() => setValgtId(periode.id)}>{PERIODE_LABEL[periode.type]}</button></td><td>uke {isoWeekNumber(periode.startDate)}–{isoWeekNumber(periode.endDate)}</td><td>{timer(periode.completedMinutes)} av {timer(periode.plannedToDateMinutes)}</td><td>{periode.focus ?? "—"}</td><td>{periode.turneringer.length || "—"}</td></tr>)}</tbody></table></div></section>
        </>}
      </div>
    </main>

    <aside className="wb-inspector"><YearSummary playerId={playerId} year={aar.year} periode={valgt} /></aside>
    {valgt && <aside className="wb-mobile-summary" aria-label={UI.selectedPeriodTitle}><div className="wb-grip" aria-hidden /><YearSummary playerId={playerId} year={aar.year} periode={valgt} compact /></aside>}
  </div>;
}

function YearSummary({ playerId, year, periode, compact = false }: { playerId: string; year: number; periode: YearPeriodBand | null; compact?: boolean }) {
  if (!periode) return <section className="wb-week-summary"><span className="wb-kicker">{UI.selectedPeriodTitle}</span><h2>—</h2><p>{UI.noPeriodBody}</p></section>;
  const uker = `${isoWeekNumber(periode.startDate)}–${isoWeekNumber(periode.endDate)}`;
  return <section className="wb-week-summary wb-year-summary"><span className="wb-kicker">{UI.selectedPeriodTitle}</span><h2>{PERIODE_LABEL[periode.type]}</h2><p>uke {uker} · {timer(periode.plannedMinutes)}</p>{!compact && <><dl><div><dt>Dato</dt><dd>{datoKort(periode.startDate)}–{datoKort(periode.endDate)}</dd></div><div><dt>Fokus</dt><dd>{periode.focus ?? "—"}</dd></div><div><dt>Planlagt hittil</dt><dd>{timer(periode.plannedToDateMinutes)}</dd></div><div><dt>Gjennomført</dt><dd>{timer(periode.completedMinutes)}</dd></div><div><dt>Turneringer</dt><dd>{periode.turneringer.length || "—"}</dd></div></dl>{periode.turneringer.length > 0 && <ul>{periode.turneringer.map((turnering) => <li key={`${turnering.dato}:${turnering.navn}`}>{datoKort(turnering.dato)} · {turnering.navn}</li>)}</ul>}</>}<div className="wb-mobile-actions"><Link className="wb-quiet" href={workbenchUrl(playerId, "periode", { aar: String(year), periode: periode.id })}>{UI.openPeriod}</Link></div></section>;
}
