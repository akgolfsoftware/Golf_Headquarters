"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import { isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { PlanningGoalSummary, PyramidArea, SourceItem, YearPeriodBand, YearViewModel } from "@/lib/domain/workbench/types";
import { workbenchUrl, type WorkbenchSurface } from "@/lib/workbench/visning-url";
import { parsePlanKontekst, type PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { SourcesPanel } from "./SourcesPanel";
import { VisningPiller } from "./VisningPiller";
import { Ark } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { Knapp } from "@/components/precision/pa";
import { Valgpille } from "@/components/precision/pa-workbench";
import { createSeasonPlan } from "@/lib/workbench/wb-actions";

type Props = {
  playerId: string;
  spillerNavn: string;
  aar: YearViewModel;
  kilder: SourceItem[];
  roster?: { id: string; navn: string }[];
  goals?: PlanningGoalSummary[];
  routeSurface?: WorkbenchSurface;
  planKontekst?: PlanReferanse;
};

const PYRAMIDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const PERIODE_LABEL: Record<YearPeriodBand["type"], string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialperiode",
  TURNERING: "Turneringsperiode",
  EVALUERING: "Evaluering",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
  RESTITUSJON: "Restitusjon",
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

export function WorkbenchAar({ playerId, spillerNavn, aar, kilder, roster = [], goals = [], routeSurface = "agency", planKontekst }: Props) {
  const router = useRouter();
  const opprinneligReferanse = planKontekst ?? parsePlanKontekst({ aar: String(aar.year) }).referanse;
  const [valgtId, setValgtId] = useState<string | null>(aar.periods.find((periode) => periode.id === opprinneligReferanse.periode)?.id ?? aar.periods.find((periode) => periode.aktiv)?.id ?? aar.periods[0]?.id ?? null);
  const [oppretter, setOppretter] = useState(false);
  const valgt = aar.periods.find((periode) => periode.id === valgtId) ?? null;
  const referanse = { ...opprinneligReferanse, periode: valgt?.id ?? opprinneligReferanse.periode };
  const progress = aar.plannedToDateMinutes > 0 ? Math.min(100, Math.round((aar.completedMinutes / aar.plannedToDateMinutes) * 100)) : 0;

  function naviger(delta: -1 | 1) {
    router.push(workbenchUrl(playerId, "aar", { ...referanse, aar: String(aar.year + delta) }, routeSurface));
  }

  return <div className="wb-layout">
    <aside className="wb-sources">
      <SourcesPanel kilder={kilder} playerId={playerId} aar={String(aar.year)} goals={goals} routeSurface={routeSurface} />
      <nav className="wb-roster" aria-label="Spillere i stallen"><span className="wb-kicker">Stall</span>{roster.map((spiller) => <Link key={spiller.id} href={workbenchUrl(spiller.id, "aar", { ...referanse, aar: String(aar.year), periode: undefined, okt: undefined }, routeSurface)} aria-current={spiller.id === playerId ? "page" : undefined}>{spiller.navn}<small>Spiller</small></Link>)}</nav>
    </aside>

    <main className="wb-main">
      <div className="wb-pills"><VisningPiller playerId={playerId} visning="aar" {...referanse} routeSurface={routeSurface} /></div>
      <div className="wb-body wb-year-body">
        <div className="wb-year-heading">
          <div><span className="wb-kicker">{spillerNavn}</span><h1>{aar.year}</h1></div>
          <span className="wb-sub">1. januar – 31. desember · {aar.periods.length} perioder</span>
          <div className="wb-year-progress"><span className="wb-kicker">{UI.periodProgress}</span><b>{timer(aar.completedMinutes)} av {timer(aar.plannedToDateMinutes)}</b><span className="wb-period-meter"><i style={{ width: `${progress}%` }} /></span></div>
        </div>

        <div className="wb-year-controls" aria-label="Årshandlinger"><button type="button" className="wb-quiet" aria-label={UI.yearNavPrev} onClick={() => naviger(-1)}>‹</button><button type="button" className="wb-quiet" onClick={() => router.push(workbenchUrl(playerId, "aar", { ...referanse, aar: new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Europe/Oslo" }).format(new Date()) }, routeSurface))}>{UI.today}</button><button type="button" className="wb-quiet" aria-label={UI.yearNavNext} onClick={() => naviger(1)}>›</button></div>

        <section className="wb-year-distribution"><span className="wb-kicker">{UI.periodDistribution}</span><div>{PYRAMIDER.map((pyramid) => <span key={pyramid} className="wb-month-tag"><i data-lag={pyramid} />{pyramid}<b>{timer(aar.completedByPyramid[pyramid])} av {timer(aar.budget.byPyramid[pyramid])}</b></span>)}</div></section>

        {aar.periods.length === 0 ? <section className="wb-period-empty"><span className="wb-kicker">{UI.noPeriods}</span><p>{UI.noPeriodBody}</p><Knapp onClick={() => setOppretter(true)}>Opprett årsplan</Knapp></section> : <>
          <section className="wb-year-timeline" aria-label={`Perioder i ${aar.year}`}>
            <div className="wb-year-month-axis">{UI.monthNames.map((maned) => <span key={maned}>{maned.slice(0, 3)}</span>)}</div>
            <div className="wb-year-track">{aar.periods.map((periode) => <button key={periode.id} type="button" aria-pressed={periode.id === valgtId} onClick={() => setValgtId(periode.id)} style={periodePosisjon(periode, aar.year)}><b>{PERIODE_LABEL[periode.type]}</b><small>uke {isoWeekNumber(periode.startDate)}–{isoWeekNumber(periode.endDate)} · {timer(periode.completedMinutes)} av {timer(periode.plannedToDateMinutes)}</small><span>{Array.from({ length: Math.max(1, Math.round((dagnummer(periode.endDate) - dagnummer(periode.startDate) + 1) / 7)) }, (_, index) => <i key={index} data-uke={periode.type === "TURNERING" && index % 3 === 0 ? "turnering" : index % 4 === 3 ? "vedlikehold" : "utvikling"} />)}</span></button>)}</div>
            <div className="wb-year-legend"><span><i data-uke="utvikling" />utviklingsuke</span><span><i data-uke="vedlikehold" />vedlikeholdsuke</span><span><i data-uke="turnering" />turneringsuke</span></div>
          </section>

          <section className="wb-year-periods"><span className="wb-kicker">Perioder</span><div className="wb-period-table-wrap"><table className="wb-period-table"><thead><tr><th>Periode</th><th>Uker</th><th>Gjennomført mot plan</th><th>Fokus</th><th>Turneringer</th></tr></thead><tbody>{aar.periods.map((periode) => <tr key={periode.id} data-selected={periode.id === valgtId}><td><button type="button" onClick={() => setValgtId(periode.id)}>{PERIODE_LABEL[periode.type]}</button></td><td>uke {isoWeekNumber(periode.startDate)}–{isoWeekNumber(periode.endDate)}</td><td>{timer(periode.completedMinutes)} av {timer(periode.plannedToDateMinutes)}</td><td>{periode.focus ?? "—"}</td><td>{periode.turneringer.length || "—"}</td></tr>)}</tbody></table></div></section>
        </>}
      </div>
    </main>

    <aside className="wb-inspector"><YearSummary playerId={playerId} year={aar.year} periode={valgt} referanse={referanse} routeSurface={routeSurface} /></aside>
    {valgt && <aside className="wb-mobile-summary" aria-label={UI.selectedPeriodTitle}><div className="wb-grip" aria-hidden /><YearSummary playerId={playerId} year={aar.year} periode={valgt} referanse={referanse} routeSurface={routeSurface} compact /></aside>}
    {oppretter && <AarsplanOppretter playerId={playerId} year={aar.year} onClose={() => setOppretter(false)} />}
  </div>;
}

function YearSummary({ playerId, year, periode, referanse, routeSurface, compact = false }: { playerId: string; year: number; periode: YearPeriodBand | null; referanse: PlanReferanse; routeSurface: WorkbenchSurface; compact?: boolean }) {
  if (!periode) return <section className="wb-week-summary"><span className="wb-kicker">{UI.selectedPeriodTitle}</span><h2>—</h2><p>{UI.noPeriodBody}</p></section>;
  const uker = `${isoWeekNumber(periode.startDate)}–${isoWeekNumber(periode.endDate)}`;
  return <section className="wb-week-summary wb-year-summary"><span className="wb-kicker">{UI.selectedPeriodTitle}</span><h2>{PERIODE_LABEL[periode.type]}</h2><p>uke {uker} · {timer(periode.plannedMinutes)}</p>{!compact && <><dl><div><dt>Dato</dt><dd>{datoKort(periode.startDate)}–{datoKort(periode.endDate)}</dd></div><div><dt>Fokus</dt><dd>{periode.focus ?? "—"}</dd></div><div><dt>Planlagt hittil</dt><dd>{timer(periode.plannedToDateMinutes)}</dd></div><div><dt>Gjennomført</dt><dd>{timer(periode.completedMinutes)}</dd></div><div><dt>Turneringer</dt><dd>{periode.turneringer.length || "—"}</dd></div></dl>{periode.turneringer.length > 0 && <ul>{periode.turneringer.map((turnering) => <li key={`${turnering.dato}:${turnering.navn}`}>{datoKort(turnering.dato)} · {turnering.navn}</li>)}</ul>}</>}<div className="wb-mobile-actions"><Link className="wb-quiet" href={workbenchUrl(playerId, "periode", { ...referanse, aar: String(year), periode: periode.id }, routeSurface)}>{UI.openPeriod}</Link></div></section>;
}

function AarsplanOppretter({ playerId, year, onClose }: { playerId: string; year: number; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [source, setSource] = useState<"EMPTY" | "PREVIOUS">("EMPTY");
  const [startDate, setStartDate] = useState(`${year}-01-01`);
  const [endDate, setEndDate] = useState(`${year}-12-31`);
  const [name, setName] = useState(`Sesong ${year}`);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () => start(async () => {
    setError(null);
    const result = await createSeasonPlan({ playerId, name, notes, startDate, endDate, source });
    if (!result.ok) { setError(result.error); return; }
    onClose();
    router.refresh();
  });

  return <Ark open onClose={onClose} kicker={`Steg ${step} av 3`} title="Opprett årsplan" footer={<>
    {step < 3 ? <Knapp fullWidth disabled={step === 2 && (!startDate || !endDate)} onClick={() => setStep((s) => Math.min(3, s + 1))}>Neste</Knapp> : <Knapp fullWidth disabled={pending || !name.trim()} onClick={save}>{pending ? "Oppretter …" : "Opprett årsplan"}</Knapp>}
    {step > 1 ? <Knapp variant="ghost" fullWidth onClick={() => setStep((s) => Math.max(1, s - 1))}>Tilbake</Knapp> : <Knapp variant="ghost" fullWidth onClick={onClose}>Avbryt</Knapp>}
  </>}>
    <ol className="a9-steg" aria-label="Steg"><li aria-current={step === 1 ? "step" : undefined}>Utgangspunkt</li><li aria-current={step === 2 ? "step" : undefined}>Tidsrom</li><li aria-current={step === 3 ? "step" : undefined}>Navn</li></ol>
    {error && <InlineVarsel tone="warn">{error}</InlineVarsel>}
    {step === 1 && <div role="radiogroup" aria-label="Utgangspunkt" className="a9-faner">
      <Valgpille rolle="radio" valgt={source === "EMPTY"} onClick={() => setSource("EMPTY")}>Tom plan</Valgpille>
      <Valgpille rolle="radio" valgt={source === "PREVIOUS"} onClick={() => setSource("PREVIOUS")}>Kopi av forrige årsplan</Valgpille>
    </div>}
    {step === 2 && <div className="a9-skjema"><label className="a9-felt">Fra dato<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label><label className="a9-felt">Til dato<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label></div>}
    {step === 3 && <div className="a9-skjema"><label className="a9-felt">Navn<input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} /></label><label className="a9-felt">Sammendrag<textarea value={notes} maxLength={1000} onChange={(e) => setNotes(e.target.value)} placeholder="Hva skal planen hjelpe deg med?" /></label></div>}
  </Ark>;
}
