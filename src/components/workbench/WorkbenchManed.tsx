"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addDays, addMonths } from "@/lib/domain/workbench/operations";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import type { MonthViewModel, PlanningGoalSummary, PyramidArea, SourceItem } from "@/lib/domain/workbench/types";
import { workbenchUrl, type WorkbenchSurface } from "@/lib/workbench/visning-url";
import { parsePlanKontekst, type PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { osloIdag } from "./WeekGrid";
import { SourcesPanel } from "./SourcesPanel";
import { VisningPiller } from "./VisningPiller";
import { saveMonthPlan } from "@/lib/workbench/wb-actions";
import { maanedKvittering, ukeNokkel } from "@/lib/workbench/maanedsplan-regler";
import { isoUkeIdentitet } from "@/lib/workbench/ukeplan-schema";
import { Ark } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { Knapp } from "@/components/precision/pa";

type Props = {
  playerId: string;
  spillerNavn: string;
  maned: MonthViewModel;
  kilder: SourceItem[];
  roster?: { id: string; navn: string }[];
  goals?: PlanningGoalSummary[];
  routeSurface?: WorkbenchSurface;
  planKontekst?: PlanReferanse;
};

const PYRAMIDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

function timer(minutter: number): string {
  return minutter > 0 ? `${formatHours(minutter)} t` : "—";
}

export function WorkbenchManed({ playerId, spillerNavn, maned, kilder, roster = [], goals = [], routeSurface = "agency", planKontekst }: Props) {
  const router = useRouter();
  const [skjemaApent, setSkjemaApent] = useState(false);
  const referanse = planKontekst ?? parsePlanKontekst({ maned: maned.monthStart.slice(0, 7) }).referanse;
  const idag = osloIdag();
  const [aar, manedNummer] = maned.monthStart.split("-").map(Number);
  const manedsnavn = UI.monthNames[manedNummer - 1];
  const progress = maned.plannedToDateMinutes > 0
    ? Math.min(100, Math.round((maned.completedMinutes / maned.plannedToDateMinutes) * 100))
    : 0;

  function naviger(delta: -1 | 1) {
    const neste = addMonths(maned.monthStart, delta).slice(0, 7);
    router.push(workbenchUrl(playerId, "maned", { ...referanse, maned: neste }, routeSurface));
  }

  return <div className="wb-layout">
    <aside className="wb-sources">
      <SourcesPanel kilder={kilder} playerId={playerId} maned={maned.monthStart.slice(0, 7)} aar={String(aar)} goals={goals} routeSurface={routeSurface} />
      <nav className="wb-roster" aria-label="Spillere i stallen"><span className="wb-kicker">Stall</span>{roster.map((spiller) => <Link key={spiller.id} href={workbenchUrl(spiller.id, "maned", { ...referanse, periode: undefined, okt: undefined }, routeSurface)} aria-current={spiller.id === playerId ? "page" : undefined}>{spiller.navn}<small>Spiller</small></Link>)}</nav>
    </aside>

    <main className="wb-main">
      <div className="wb-pills"><VisningPiller playerId={playerId} visning="maned" {...referanse} routeSurface={routeSurface} /></div>
      <div className="wb-body wb-month-body">
        <div className="wb-month-heading">
          <div><span className="wb-kicker">Månedsplan</span><h1>{manedsnavn}</h1></div>
          <span className="wb-month-year">{aar}</span>
          <span className="wb-sub">{spillerNavn}</span>
          <div className="wb-month-progress"><span className="wb-kicker">{UI.periodProgress}</span><b>{timer(maned.completedMinutes)} av {timer(maned.plannedToDateMinutes)}</b><span className="wb-period-meter"><i style={{ width: `${progress}%` }} /></span></div>
        </div>

        <div className="wb-month-controls" aria-label="Månedshandlinger"><button type="button" className="wb-quiet" aria-label={UI.monthNavPrev} onClick={() => naviger(-1)}>‹</button><button type="button" className="wb-quiet" onClick={() => router.push(workbenchUrl(playerId, "maned", { ...referanse, maned: idag.slice(0, 7) }, routeSurface))}>{UI.today}</button><button type="button" className="wb-quiet" aria-label={UI.monthNavNext} onClick={() => naviger(1)}>›</button><button type="button" className="wb-quiet" onClick={() => setSkjemaApent(true)}>Rediger måned</button></div>
        {maned.maanedsplan?.fokus && <p className="wb-sub">Fokus: {maned.maanedsplan.fokus}</p>}
        {skjemaApent && <MaanedSkjema key={maned.monthStart} playerId={playerId} aar={aar} maned={manedNummer} manedsnavn={manedsnavn} model={maned} onClose={() => setSkjemaApent(false)} onSaved={() => { setSkjemaApent(false); router.refresh(); }} />}

        <section className="wb-month-distribution"><span className="wb-kicker">{UI.periodDistribution}</span><div>{PYRAMIDER.map((pyramid) => <span key={pyramid} className="wb-month-tag"><i data-lag={pyramid} />{pyramid}<b>{timer(maned.completedByPyramid[pyramid])} av {timer(maned.budget.byPyramid[pyramid])}</b></span>)}</div></section>

        {maned.empty ? <section className="wb-period-empty"><span className="wb-kicker">{UI.emptyMonthTitle}</span><p>{UI.emptyMonthBody}</p><Link className="wb-quiet" href={workbenchUrl(playerId, "uke", { ...referanse, uke: referanse.uke ?? maned.weeks[0]?.weekStart }, routeSurface)}>{UI.openWeek}</Link></section> : <MonthCalendar playerId={playerId} maned={maned} idag={idag} referanse={referanse} routeSurface={routeSurface} />}
      </div>
    </main>

    <aside className="wb-inspector"><MonthSummary playerId={playerId} maned={maned} referanse={referanse} routeSurface={routeSurface} /></aside>
    <aside className="wb-mobile-summary" aria-label="Valgt måned"><div className="wb-grip" aria-hidden /><MonthSummary playerId={playerId} maned={maned} referanse={referanse} routeSurface={routeSurface} compact /></aside>
  </div>;
}

function MonthCalendar({ playerId, maned, idag, referanse, routeSurface }: { playerId: string; maned: MonthViewModel; idag: string; referanse: PlanReferanse; routeSurface: WorkbenchSurface }) {
  return <section className="wb-month-calendar" aria-label={`Månedskalender ${maned.label}`}>
    <div className="wb-month-weekdays">{UI.weekdayShort.map((dag) => <span key={dag}>{dag}</span>)}</div>
    <div className="wb-month-days">{maned.weeks.flatMap((uke) => uke.days.map((dag) => <Link key={dag.date} href={workbenchUrl(playerId, "uke", { ...referanse, uke: uke.weekStart }, routeSurface)} className="wb-month-day" data-in-month={dag.inMonth} aria-current={dag.date === idag ? "date" : undefined}>
      <span className="wb-month-date">{dag.dayOfMonth}.</span>
      <span className="wb-month-lines">{dag.lines.length === 0 ? <small>—</small> : dag.lines.map((linje, index) => <span key={`${dag.date}:${index}`} data-lag={linje.pyramid}>{linje.title}</span>)}{dag.restCount > 0 && <small>{UI.moreCount(dag.restCount)}</small>}</span>
      <span className="wb-month-bars" aria-hidden>{dag.lines.length === 0 ? "—" : dag.lines.map((linje, index) => <i key={`${dag.date}:bar:${index}`} data-lag={linje.pyramid} />)}</span>
    </Link>))}</div>
  </section>;
}

function MonthSummary({ playerId, maned, referanse, routeSurface, compact = false }: { playerId: string; maned: MonthViewModel; referanse: PlanReferanse; routeSurface: WorkbenchSurface; compact?: boolean }) {
  const første = maned.weeks.find((uke) => uke.days.some((dag) => dag.inMonth));
  return <section className="wb-week-summary wb-month-summary"><span className="wb-kicker">Valgt måned</span><h2>{maned.label}</h2><p>{maned.sessionCount} økter · {timer(maned.budget.plannedMinutes)}</p>{!compact && <><span className="wb-kicker">Uker</span><div className="wb-month-week-list">{maned.weekSummaries.map((uke) => <Link key={uke.weekStart} href={workbenchUrl(playerId, "uke", { ...referanse, uke: uke.weekStart }, routeSurface)}><b>Uke {uke.weekNumber}</b><span>{uke.sessionCount} økter · {timer(uke.minutes)}{maned.maanedsplan?.uker[ukeNokkel(isoUkeIdentitet(uke.weekStart).isoYear, uke.weekNumber)] ? " · Endret i måneden" : ""}</span></Link>)}</div><p>{UI.monthHint}</p></>}<div className="wb-mobile-actions"><Link className="wb-quiet" href={workbenchUrl(playerId, "uke", { ...referanse, uke: referanse.uke ?? første?.weekStart }, routeSurface)}>{UI.openWeek}</Link></div></section>;
}

const AKSER_MANED: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

function MaanedSkjema({ playerId, aar, maned, manedsnavn, model, onClose, onSaved }: {
  playerId: string; aar: number; maned: number; manedsnavn: string; model: MonthViewModel; onClose: () => void; onSaved: () => void;
}) {
  const plan = model.maanedsplan;
  // Uker som tilhører måneden: torsdagen ligger i måneden (samme regel som perioder).
  const uker = model.weekSummaries
    .filter((u) => Number(addDays(u.weekStart, 3).slice(5, 7)) === maned)
    .map((u) => ({ ...u, nokkel: ukeNokkel(isoUkeIdentitet(u.weekStart).isoYear, u.weekNumber) }));
  const [fokus, setFokus] = useState(plan?.fokus ?? "");
  const [notat, setNotat] = useState(plan?.notat ?? "");
  const [evaluering, setEvaluering] = useState(plan?.evaluering ?? "");
  const [verdier, setVerdier] = useState<Record<string, Partial<Record<PyramidArea, string>>>>(() =>
    Object.fromEntries(uker.map((u) => [u.nokkel, Object.fromEntries(
      Object.entries(plan?.uker[u.nokkel] ?? {}).map(([akse, min]) => [akse, String(min)]),
    )])));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const lagre = () => start(async () => {
    setFeil(null);
    const ukerData: Record<string, Partial<Record<PyramidArea, number>>> = {};
    for (const u of uker) {
      const rad = Object.fromEntries(
        AKSER_MANED.flatMap((a) => {
          const v = verdier[u.nokkel]?.[a];
          return v === undefined || v === "" ? [] : [[a, Number(v)] as const];
        }),
      );
      if (Object.keys(rad).length > 0) ukerData[u.nokkel] = rad;
    }
    // Uker utenfor måneden som allerede er tilpasset (gåtte uker osv.) beholdes.
    const beholdt = Object.fromEntries(Object.entries(plan?.uker ?? {}).filter(([k]) => !uker.some((u) => u.nokkel === k)));
    const res = await saveMonthPlan({ playerId, data: {
      year: aar, month: maned, fokus, notat, evaluering, uker: { ...beholdt, ...ukerData },
    } });
    if (!res.ok) { setFeil(res.error); return; }
    const tekst = maanedKvittering(res.data.kvittering, res.data.fordelingFeilet);
    (res.data.fordelingFeilet ? toast.error : toast.success)(tekst);
    onSaved();
  });

  return <Ark open onClose={onClose} kicker="Rediger måned" title={`${manedsnavn} ${aar}`} footer={<>
    <Knapp fullWidth disabled={pending} onClick={lagre}>{pending ? "Lagrer …" : "Lagre måned"}</Knapp>
    <Knapp variant="ghost" fullWidth onClick={onClose}>Avbryt</Knapp>
  </>}>
    {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
    <div className="a9-skjema">
      <label className="a9-felt">Fokus<input value={fokus} maxLength={200} onChange={(e) => setFokus(e.target.value)} placeholder="Putting og kort spill" /></label>
      <span className="kicker">Timer per uke · minutter per akse</span>
      <InlineVarsel tone="info">La feltet stå tomt for å følge perioden. En uke du fyller inn, beholder månedens tall når perioden endres.</InlineVarsel>
      {uker.map((u) => <div key={u.nokkel}>
        <span className="kicker">Uke {u.weekNumber}</span>
        <div className="a9-feltrad">{AKSER_MANED.map((akse) => <label className="a9-felt" key={akse}>{akse}<input type="number" min={0} max={3000} step={15} placeholder="Periode"
          value={verdier[u.nokkel]?.[akse] ?? ""}
          onChange={(e) => setVerdier((v) => ({ ...v, [u.nokkel]: { ...v[u.nokkel], [akse]: e.target.value } }))} /></label>)}</div>
      </div>)}
      <label className="a9-felt">Notat<textarea rows={3} maxLength={2000} value={notat} onChange={(e) => setNotat(e.target.value)} /></label>
      <label className="a9-felt">Evaluering<textarea rows={3} maxLength={4000} value={evaluering} onChange={(e) => setEvaluering(e.target.value)} placeholder="Fylles ut når måneden er over" /></label>
    </div>
  </Ark>;
}
