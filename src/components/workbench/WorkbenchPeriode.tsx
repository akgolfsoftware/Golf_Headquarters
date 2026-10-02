"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { validateWeek } from "@/lib/domain/workbench/operations";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import type { PeriodType, PeriodViewModel, PlanningGoalSummary, SourceItem } from "@/lib/domain/workbench/types";
import { deleteSeasonPeriod, loadPeriod, publishSessions, saveSeasonPeriod } from "@/lib/workbench/wb-actions";
import { osloIdag } from "./WeekGrid";
import { PublishConfirmDialog } from "./PublishConfirmDialog";
import { SourcesPanel } from "./SourcesPanel";
import { VisningPiller } from "./VisningPiller";
import { workbenchUrl, type WorkbenchSurface } from "@/lib/workbench/visning-url";
import { parsePlanKontekst, type PlanReferanse } from "@/lib/workbench/plan-kontekst";
import { Ark } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { Knapp } from "@/components/precision/pa";

type Props = {
  playerId: string;
  spillerNavn: string;
  periode: PeriodViewModel;
  kilder: SourceItem[];
  roster?: { id: string; navn: string }[];
  goals?: PlanningGoalSummary[];
  routeSurface?: WorkbenchSurface;
  planKontekst?: PlanReferanse;
};

const PERIODE_LABEL: Record<PeriodType, string> = {
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

function datoKort(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

function prosent(teller: number, nevner: number): number {
  return nevner > 0 ? Math.min(100, Math.round((teller / nevner) * 100)) : 0;
}

function timer(minutter: number): string {
  return minutter > 0 ? `${formatHours(minutter)} t` : "—";
}

export function WorkbenchPeriode({ playerId, spillerNavn, periode: startPeriode, kilder, roster = [], goals = [], routeSurface = "agency", planKontekst }: Props) {
  const router = useRouter();
  const [periode, setPeriode] = useState(startPeriode);
  const referanse = { ...(planKontekst ?? parsePlanKontekst({ aar: String(periode.year) }, { periode: periode.period }).referanse), periode: periode.period?.id ?? planKontekst?.periode };
  const [publiserApen, setPubliserApen] = useState(false);
  const [valgtePubliser, setValgtePubliser] = useState<Set<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, start] = useTransition();
  const [skjema, setSkjema] = useState<"ny" | "rediger" | null>(null);
  const valgt = periode.period;
  const utkast = useMemo(() => periode.sessions.filter((session) => session.status === "DRAFT"), [periode.sessions]);
  const notater = useMemo(() => validateWeek(periode.sessions), [periode.sessions]);
  const opptattIder = useMemo(() => new Set(notater.map((note) => note.sessionId).filter((id): id is string => Boolean(id))), [notater]);
  const storsteUke = Math.max(1, ...periode.weeks.map((uke) => uke.minutes));

  const lastPaaNytt = useCallback(async () => {
    const resultat = await loadPeriod({
      year: periode.year,
      periodId: valgt?.id,
      mode: periode.mode,
      playerId,
    });
    if (resultat.ok) {
      setPeriode(resultat.data);
      setFeil(null);
    } else {
      setFeil(resultat.error);
    }
  }, [periode.year, periode.mode, valgt?.id, playerId]);

  function apnePublisering() {
    setValgtePubliser(new Set(utkast.filter((session) => !opptattIder.has(session.id)).map((session) => session.id)));
    setPubliserApen(true);
  }

  function publiser(ider: string[]) {
    if (ider.length === 0) return;
    start(async () => {
      const resultat = await publishSessions(ider);
      if (!resultat.ok) {
        setFeil(resultat.error);
        toast.error(resultat.error);
        return;
      }
      await lastPaaNytt();
      setPubliserApen(false);
      toast.success(resultat.data.length === 1 ? UI.toastPublishedOne : UI.toastPublishedMany(resultat.data.length));
    });
  }

  const førsteUke = periode.weeks[0]?.weekNumber;
  const sisteUke = periode.weeks.at(-1)?.weekNumber;
  const periodeNavn = valgt ? PERIODE_LABEL[valgt.type] : UI.noPeriodTitle;

  return (
    <div className="wb-layout">
      <aside className="wb-sources">
        <SourcesPanel kilder={kilder} playerId={playerId} aar={String(periode.year)} goals={goals} routeSurface={routeSurface} />
        <nav className="wb-roster" aria-label="Spillere i stallen">
          <span className="wb-kicker">Stall</span>
          {roster.map((spiller) => (
            <Link key={spiller.id} href={workbenchUrl(spiller.id, "periode", { ...referanse, periode: undefined, okt: undefined }, routeSurface)} aria-current={spiller.id === playerId ? "page" : undefined}>
              {spiller.navn}<small>Spiller</small>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="wb-main">
        <div className="wb-pills"><VisningPiller playerId={playerId} visning="periode" {...referanse} routeSurface={routeSurface} /></div>
        <div className="wb-body wb-period-body">
          <div className="wb-heading">
            <div><span className="wb-kicker">{valgt ? periodeNavn : UI.periodPlan}</span><h1>{førsteUke && sisteUke ? `Uke ${førsteUke}–${sisteUke}` : "—"}</h1></div>
            <span className="wb-sub">{spillerNavn} · {UI.periodWeeks(periode.weeks.length)} · {valgt?.turneringer.length ?? 0} turneringer</span>
            <div className="a9-rad"><Knapp variant="secondary" size="sm" onClick={() => setSkjema("ny")}>Ny periode</Knapp>{valgt && <Knapp variant="secondary" size="sm" onClick={() => setSkjema("rediger")}>Rediger periode</Knapp>}<button type="button" className="wb-publish" disabled={!utkast.length || travel} onClick={apnePublisering}>{UI.publishPeriod}</button></div>
          </div>

          {feil && <div className="wb-period-error" role="alert">{feil}<button type="button" className="wb-quiet" onClick={() => void lastPaaNytt()}>{UI.retry}</button></div>}

          {!valgt ? (
            <section className="wb-period-empty"><span className="wb-kicker">{UI.noPeriodTitle}</span><p>{UI.noPeriodBody}</p></section>
          ) : (
            <>
              <div className="wb-period-cards">
                <section className="wb-period-card"><span className="wb-kicker">{UI.periodVolume}</span><strong>{timer(periode.plannedMinutes)}<small>{periode.sessions.length} økter</small></strong></section>
                <section className="wb-period-card"><span className="wb-kicker">{UI.periodProgress}</span><strong>{timer(periode.completedMinutes)}<small>av {timer(periode.plannedToDateMinutes)}</small></strong><span className="wb-period-meter"><i style={{ width: `${prosent(periode.completedMinutes, periode.plannedToDateMinutes)}%` }} /></span></section>
                <section className="wb-period-card"><span className="wb-kicker">{UI.periodDistribution}</span><div className="wb-period-split" aria-label="Fordeling av planlagt periodevolum">{periode.distribution.filter((row) => row.plannedMinutes > 0).map((row) => <span key={row.pyramid} data-lag={row.pyramid} style={{ flex: Math.max(1, row.plannedMinutes) }}>{row.pyramid}</span>)}</div><small>Putt ligger i fot under SLAG</small></section>
              </div>

              <section className="wb-period-section"><span className="wb-kicker">{UI.periodTimeline}</span><div className="wb-period-timeline">{periode.weeks.map((uke) => (
                <Link key={uke.weekStart} href={workbenchUrl(playerId, "uke", { ...referanse, uke: uke.weekStart }, routeSurface)} className="wb-period-week">
                  <span>Uke {uke.weekNumber}</span><small>—</small><b>{timer(uke.minutes)}</b><i><span style={{ width: `${Math.round((uke.minutes / storsteUke) * 100)}%` }} /></i>
                </Link>
              ))}</div></section>

              <section className="wb-period-section"><span className="wb-kicker">{UI.periodPyramid}</span><div className="wb-period-table-wrap"><table className="wb-period-table"><thead><tr><th>Lag</th><th>Planlagt</th><th>Gjennomført</th><th>Andel av periodevolum</th><th>Hovedfokus</th></tr></thead><tbody>{periode.distribution.map((row) => (
                <tr key={row.pyramid}><td><span className="wb-period-lag"><i data-lag={row.pyramid} />{row.pyramid}</span></td><td>{timer(row.plannedMinutes)}</td><td>{timer(row.completedMinutes)}</td><td><span className="wb-period-meter"><i style={{ width: `${row.sharePct}%` }} /></span></td><td>{row.focus ?? "—"}</td></tr>
              ))}</tbody></table></div></section>
            </>
          )}
        </div>
      </main>

      <aside className="wb-inspector"><PeriodSummary periode={periode} /></aside>
      {valgt && <aside className="wb-mobile-summary" aria-label={UI.selectedPeriodTitle}><div className="wb-grip" aria-hidden /><PeriodSummary periode={periode} compact /><div className="wb-mobile-actions"><Link className="wb-quiet" href={workbenchUrl(playerId, "uke", { ...referanse, uke: referanse.uke ?? periode.weeks[0]?.weekStart ?? valgt.startDate }, routeSurface)}>{UI.openPeriod}</Link><button type="button" className="wb-publish" disabled={!utkast.length || travel} onClick={apnePublisering}>{UI.publishPeriod}</button></div></aside>}

      <PublishConfirmDialog
        open={publiserApen}
        okter={utkast}
        idag={osloIdag()}
        kicker={`${periodeNavn} · ${spillerNavn}`}
        notater={notater}
        opptattIder={opptattIder}
        valgte={valgtePubliser}
        onVeksle={(id) => setValgtePubliser((forrige) => { const neste = new Set(forrige); if (neste.has(id)) neste.delete(id); else neste.add(id); return neste; })}
        onVelgAlle={() => setValgtePubliser((forrige) => forrige.size === utkast.length ? new Set() : new Set(utkast.map((session) => session.id)))}
        publiserer={travel}
        onLukk={() => setPubliserApen(false)}
        onPubliserValgte={() => publiser(utkast.filter((session) => valgtePubliser.has(session.id)).map((session) => session.id))}
        onPubliserAlle={() => publiser(utkast.map((session) => session.id))}
      />
      {skjema && <PeriodeSkjema playerId={playerId} year={periode.year} period={skjema === "rediger" ? valgt : null} onClose={() => setSkjema(null)} onSaved={() => { setSkjema(null); router.refresh(); }} />}
    </div>
  );
}

function PeriodSummary({ periode, compact = false }: { periode: PeriodViewModel; compact?: boolean }) {
  const valgt = periode.period;
  if (!valgt) return <section className="wb-week-summary"><span className="wb-kicker">{UI.selectedPeriodTitle}</span><h2>—</h2><p>{UI.noPeriodBody}</p></section>;
  return <section className="wb-week-summary wb-period-summary"><span className="wb-kicker">{UI.selectedPeriodTitle}</span><h2>{PERIODE_LABEL[valgt.type]}</h2><p>{datoKort(valgt.startDate)}–{datoKort(valgt.endDate)} · {UI.periodWeeks(periode.weeks.length)} · {timer(periode.plannedMinutes)}</p>{!compact && <><dl><div><dt>Fokus</dt><dd>{valgt.focus ?? "—"}</dd></div><div><dt>Planlagt</dt><dd>{timer(periode.plannedMinutes)}</dd></div><div><dt>Gjennomført</dt><dd>{timer(periode.completedMinutes)}</dd></div><div><dt>Turneringer</dt><dd>{valgt.turneringer.length || "—"}</dd></div></dl>{valgt.turneringer.length > 0 && <ul>{valgt.turneringer.map((turnering) => <li key={`${turnering.dato}:${turnering.navn}`}>{datoKort(turnering.dato)} · {turnering.navn}</li>)}</ul>}</>}</section>;
}

const TOMT_BUDSJETT = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };

function PeriodeSkjema({ playerId, year, period, onClose, onSaved }: {
  playerId: string;
  year: number;
  period: PeriodViewModel["period"];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<PeriodType>(period?.type ?? "GRUNN");
  const [startDate, setStartDate] = useState(period?.startDate ?? `${year}-01-01`);
  const [endDate, setEndDate] = useState(period?.endDate ?? `${year}-03-31`);
  const [focus, setFocus] = useState(period?.focus ?? "");
  const [min, setMin] = useState(period?.weeklyVolMin != null ? String(period.weeklyVolMin) : "");
  const [max, setMax] = useState(period?.weeklyVolMax != null ? String(period.weeklyVolMax) : "");
  const [budget, setBudget] = useState({ ...TOMT_BUDSJETT, ...(period?.sessionBudget ?? {}) });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = () => start(async () => {
    setError(null);
    const result = await saveSeasonPeriod({ playerId, periodId: period?.id, data: {
      lPhase: type,
      startDato: startDate,
      sluttDato: endDate,
      fokus: focus,
      ukevolumMin: min === "" ? null : Number(min),
      ukevolumMax: max === "" ? null : Number(max),
      budsjett: budget,
    } });
    if (!result.ok) { setError(result.error); return; }
    onSaved();
  });

  const remove = () => period && start(async () => {
    setError(null);
    const result = await deleteSeasonPeriod({ playerId, periodId: period.id });
    if (!result.ok) { setError(result.error); return; }
    onSaved();
  });

  return <Ark open onClose={onClose} kicker={period ? "Rediger periode" : "Ny periode"} title={period ? PERIODE_LABEL[period.type] : "Ny periode"} footer={<>
    <Knapp fullWidth disabled={pending || !startDate || !endDate} onClick={save}>{pending ? "Lagrer …" : "Lagre periode"}</Knapp>
    <Knapp variant="ghost" fullWidth onClick={onClose}>Avbryt</Knapp>
    {period && !confirmDelete && <Knapp variant="signal" fullWidth onClick={() => setConfirmDelete(true)}>Fjern periode</Knapp>}
    {period && confirmDelete && <Knapp variant="signal" fullWidth disabled={pending} onClick={remove}>Bekreft fjerning</Knapp>}
  </>}>
    {error && <InlineVarsel tone="warn">{error}</InlineVarsel>}
    {confirmDelete && <InlineVarsel tone="warn" tittel="Perioden fjernes">Økter og mål slettes ikke. De mister bare denne perioden som grunnlag.</InlineVarsel>}
    <div className="a9-skjema">
      <label className="a9-felt">Periodetype<select value={type} onChange={(e) => setType(e.target.value as PeriodType)}>{Object.entries(PERIODE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <div className="a9-feltrad"><label className="a9-felt">Fra dato<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label><label className="a9-felt">Til dato<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label></div>
      <label className="a9-felt">Fokus<input value={focus} maxLength={200} onChange={(e) => setFocus(e.target.value)} placeholder="Styrke og hastighet" /></label>
      <span className="kicker">Øktbudsjett per uke · antall økter</span>
      <div className="a9-feltrad">{(Object.keys(TOMT_BUDSJETT) as Array<keyof typeof TOMT_BUDSJETT>).map((key) => <label className="a9-felt" key={key}>{key}<input type="number" min={0} max={21} value={budget[key]} onChange={(e) => setBudget((b) => ({ ...b, [key]: Number(e.target.value) }))} /></label>)}</div>
      <span className="kicker">Tid per uke · minutter</span>
      <div className="a9-feltrad"><label className="a9-felt">Minimum<input type="number" min={0} max={3000} value={min} onChange={(e) => setMin(e.target.value)} /></label><label className="a9-felt">Maksimum<input type="number" min={0} max={3000} value={max} onChange={(e) => setMax(e.target.value)} /></label></div>
      <InlineVarsel tone="info">TEK er antall planlagte teknikkøkter. Oppgaver og repetisjoner endrer ikke dette tallet automatisk.</InlineVarsel>
    </div>
  </Ark>;
}
