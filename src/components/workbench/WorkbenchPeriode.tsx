"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { validateWeek } from "@/lib/domain/workbench/operations";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import type { PeriodType, PeriodViewModel, SourceItem } from "@/lib/domain/workbench/types";
import { loadPeriod, publishSessions } from "@/lib/workbench/wb-actions";
import { osloIdag } from "./WeekGrid";
import { PublishConfirmDialog } from "./PublishConfirmDialog";
import { SourcesPanel } from "./SourcesPanel";
import { VisningPiller } from "./VisningPiller";

type Props = {
  playerId: string;
  spillerNavn: string;
  periode: PeriodViewModel;
  kilder: SourceItem[];
  roster?: { id: string; navn: string }[];
};

const PERIODE_LABEL: Record<PeriodType, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialiseringsperiode",
  TURNERING: "Turneringsperiode",
  EVALUERING: "Evalueringsperiode",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
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

export function WorkbenchPeriode({ playerId, spillerNavn, periode: startPeriode, kilder, roster = [] }: Props) {
  const [periode, setPeriode] = useState(startPeriode);
  const [publiserApen, setPubliserApen] = useState(false);
  const [valgtePubliser, setValgtePubliser] = useState<Set<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, start] = useTransition();
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
        <SourcesPanel kilder={kilder} playerId={playerId} aar={String(periode.year)} />
        <nav className="wb-roster" aria-label="Spillere i stallen">
          <span className="wb-kicker">Stall</span>
          {roster.map((spiller) => (
            <Link key={spiller.id} href={`/admin/workbench/${spiller.id}?vis=periode&aar=${periode.year}`} aria-current={spiller.id === playerId ? "page" : undefined}>
              {spiller.navn}<small>Spiller</small>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="wb-main">
        <div className="wb-pills"><VisningPiller playerId={playerId} visning="periode" aar={String(periode.year)} /></div>
        <div className="wb-body wb-period-body">
          <div className="wb-heading">
            <div><span className="wb-kicker">{valgt ? periodeNavn : UI.periodPlan}</span><h1>{førsteUke && sisteUke ? `Uke ${førsteUke}–${sisteUke}` : "—"}</h1></div>
            <span className="wb-sub">{spillerNavn} · {UI.periodWeeks(periode.weeks.length)} · {valgt?.turneringer.length ?? 0} turneringer</span>
            <button type="button" className="wb-publish" disabled={!utkast.length || travel} onClick={apnePublisering}>{UI.publishPeriod}</button>
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
                <Link key={uke.weekStart} href={`/admin/workbench/${playerId}?uke=${uke.weekStart}`} className="wb-period-week">
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
      {valgt && <aside className="wb-mobile-summary" aria-label={UI.selectedPeriodTitle}><div className="wb-grip" aria-hidden /><PeriodSummary periode={periode} compact /><div className="wb-mobile-actions"><Link className="wb-quiet" href={`/admin/workbench/${playerId}?uke=${periode.weeks[0]?.weekStart ?? valgt.startDate}`}>{UI.openPeriod}</Link><button type="button" className="wb-publish" disabled={!utkast.length || travel} onClick={apnePublisering}>{UI.publishPeriod}</button></div></aside>}

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
    </div>
  );
}

function PeriodSummary({ periode, compact = false }: { periode: PeriodViewModel; compact?: boolean }) {
  const valgt = periode.period;
  if (!valgt) return <section className="wb-week-summary"><span className="wb-kicker">{UI.selectedPeriodTitle}</span><h2>—</h2><p>{UI.noPeriodBody}</p></section>;
  return <section className="wb-week-summary wb-period-summary"><span className="wb-kicker">{UI.selectedPeriodTitle}</span><h2>{PERIODE_LABEL[valgt.type]}</h2><p>{datoKort(valgt.startDate)}–{datoKort(valgt.endDate)} · {UI.periodWeeks(periode.weeks.length)} · {timer(periode.plannedMinutes)}</p>{!compact && <><dl><div><dt>Fokus</dt><dd>{valgt.focus ?? "—"}</dd></div><div><dt>Planlagt</dt><dd>{timer(periode.plannedMinutes)}</dd></div><div><dt>Gjennomført</dt><dd>{timer(periode.completedMinutes)}</dd></div><div><dt>Turneringer</dt><dd>{valgt.turneringer.length || "—"}</dd></div></dl>{valgt.turneringer.length > 0 && <ul>{valgt.turneringer.map((turnering) => <li key={`${turnering.dato}:${turnering.navn}`}>{datoKort(turnering.dato)} · {turnering.navn}</li>)}</ul>}</>}</section>;
}
