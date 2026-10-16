"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Knapp } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { BunnArk } from "@/components/v2/bunn-ark";
import { useInspektorSynlig } from "@/components/v2/inspektorpanel";
import { TL } from "@/lib/v2/train-lock";
import { addDays, isoWeekNumber, mondayOf } from "@/lib/domain/workbench/operations";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import type { PlanningGoalSummary, SourceItem, WeekViewModel, RecurrencePolicy } from "@/lib/domain/workbench/types";
import type { SaveWeekPlanInput } from "@/lib/workbench/wb-actions";
import type { WeeklyLoadResult } from "@/lib/domain/workbench/load";
import { useUkeMotor } from "./useUkeMotor";
import { CreateSessionModal, type NyOktVerdier } from "./CreateSessionModal";
import { PublishConfirmDialog } from "./PublishConfirmDialog";
import { SessionInspector, type FlyttVerdier, type LeggTilDrillVerdier } from "./SessionInspector";
import { SourcesPanel } from "./SourcesPanel";
import { osloIdag, WeekGrid } from "./WeekGrid";
import { VisningPiller } from "./VisningPiller";
import { WeekPlanEditor } from "./WeekPlanEditor";

type Props = { playerId: string; spillerNavn: string; uke: WeekViewModel; kilder: SourceItem[]; roster?: { id: string; navn: string }[]; goals?: PlanningGoalSummary[] };

export function WorkbenchUke({ playerId, spillerNavn, uke, kilder, roster = [], goals = [] }: Props) {
  const router = useRouter();
  const inspectorSynlig = useInspektorSynlig();
  const motor = useUkeMotor({ playerId, uke });
  const { week, feil, travel, weeklyLoad, utkast, valideringsnotater, opptattIder, lastPaaNytt, alleOkter } = motor;
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [nyOkt, setNyOkt] = useState<{ dato: string; startMinutt: number } | null>(null);
  const [ukeArkApen, setUkeArkApen] = useState(false);
  const [publiserApen, setPubliserApen] = useState(false);
  const [valgtePubliser, setValgtePubliser] = useState<Set<string>>(new Set());
  const idag = osloIdag();
  const valgt = useMemo(() => alleOkter.find((s) => s.id === valgtId) ?? null, [alleOkter, valgtId]);

  function byttUke(retning: -1 | 1) {
    router.push(`/admin/workbench/${playerId}?uke=${mondayOf(addDays(week.weekStart, retning * 7))}`);
  }

  const onLagreUkeplan = motor.lagreUkeplan;

  const inspectorNode = (
    <SessionInspector
      key={valgt ? `${valgt.id}:${valgt.date}:${valgt.startMinute}:${valgt.durationMinutes}` : "tom"}
      session={valgt}
      travel={travel}
      onFlytt={(v: FlyttVerdier) => { if (!valgt) return; motor.flytt(valgt.id, v); }}
      onPubliser={() => { if (!valgt) return; motor.publiser([valgt.id]); }}
      onTrekkTilbake={() => { if (!valgt) return; motor.trekkTilbake(valgt.id); }}
      onSlett={(policy: RecurrencePolicy) => { if (!valgt) return; motor.slett(valgt, policy, () => setValgtId(null)); }}
      onLagreSomMal={(isTemplate: boolean) => { if (!valgt) return; motor.lagreSomMal(valgt.id, isTemplate); }}
      onLeggTilDrill={(v: LeggTilDrillVerdier) => { if (!valgt) return; motor.leggTilDrill(valgt.id, v); }}
      onFlyttDrill={(drillId, retning) => { if (!valgt) return; motor.flyttDrill(valgt, drillId, retning); }}
      onFjernDrill={(drillId) => { if (!valgt) return; motor.fjernDrill(valgt.id, drillId); }}
      onOppdaterAnstrengelse={(rpe, min) => { if (!valgt) return; motor.oppdaterAnstrengelse(valgt.id, rpe, min); }}
    />
  );

  return (
    <div className="wb-layout">
      <aside className="wb-sources">
        <SourcesPanel kilder={kilder} playerId={playerId} uke={week.weekStart} maned={week.weekStart.slice(0, 7)} aar={week.weekStart.slice(0, 4)} goals={goals} />
        <nav className="wb-roster" aria-label="Spillere i stallen"><span className="wb-kicker">Stall</span>{roster.map(p => <Link key={p.id} href={`/admin/workbench/${p.id}?uke=${week.weekStart}`} aria-current={p.id === playerId ? "page" : undefined}>{p.navn}<small>Spiller</small></Link>)}</nav>
      </aside>
      <main className="wb-main">
        <div className="wb-pills"><VisningPiller playerId={playerId} visning="uke" uke={week.weekStart} maned={week.weekStart.slice(0, 7)} aar={week.weekStart.slice(0, 4)} /></div>
        <div className="wb-body">
      <Topplinje playerId={playerId} spillerNavn={spillerNavn} week={week} weeklyLoad={weeklyLoad} antallUtkast={utkast.length} travel={travel} onForrige={() => byttUke(-1)} onNeste={() => byttUke(1)} onIdag={() => router.push(`/admin/workbench/${playerId}?uke=${mondayOf(idag)}`)} onNyOkt={() => setNyOkt({ dato: week.days[0]?.date ?? idag, startMinutt: 16 * 60 })} onPubliser={() => { setValgtePubliser(new Set(utkast.filter((s) => !opptattIder.has(s.id)).map((s) => s.id))); setPubliserApen(true); }} />
      {feil && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 2, border: `1px solid color-mix(in srgb, ${TL.danger} 35%, transparent)`, background: `color-mix(in srgb, ${TL.danger} 8%, transparent)` }}>
          <Icon name="triangle-alert" size={15} style={{ color: TL.danger }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, flex: 1 }}>{feil}</span>
          <Knapp ghost onClick={() => void lastPaaNytt()}>{UI.retry}</Knapp>
        </div>
      )}
          <WeekGrid week={week} selectedSessionId={valgtId} onSelectSession={setValgtId} onCreateAt={(dato, startMinutt) => setNyOkt({ dato, startMinutt })} onDropSource={(dato, startMinutt, sourceId) => motor.fraKilde(dato, startMinutt, sourceId, setValgtId)} onDropDrillOnSession={(sessionId, sourceId) => motor.drillFraKilde(sessionId, sourceId)} />

        </div>
      </main>
      {!valgt && <aside className="wb-mobile-summary" aria-label={UI.selectedWeekTitle}>
        <div className="wb-grip" aria-hidden />
        <span className="wb-kicker">{UI.selectedWeekTitle}</span><h2>{UI.weekCrumb(isoWeekNumber(week.weekStart))}</h2>
        <dl>{[UI.pyramid, UI.drillArea, UI.formelBelastning, UI.formelHensikt].map(label => <div key={label}><dt>{label}</dt><dd>—</dd></div>)}</dl>
        <div className="wb-mobile-actions"><button type="button" className="wb-quiet" onClick={() => setUkeArkApen(true)}>{UI.openWeek}</button><button type="button" className="wb-publish" disabled={!utkast.length || travel} onClick={() => { setValgtePubliser(new Set(utkast.filter(s => !opptattIder.has(s.id)).map(s => s.id))); setPubliserApen(true); }}>{UI.publishWeek}</button></div>
      </aside>}
      <aside className="wb-inspector">{valgt ? inspectorNode : <WeekSummary week={week} weeklyLoad={weeklyLoad} onNyOkt={() => setNyOkt({ dato: week.weekStart, startMinutt: 16 * 60 })} onLagreUkeplan={onLagreUkeplan} lagrer={travel} />}</aside>
      <div className="lg:hidden">
        <BunnArk open={!inspectorSynlig && (valgtId !== null || ukeArkApen)} onClose={() => { setValgtId(null); setUkeArkApen(false); }} tittel={valgt?.title ?? UI.selectedWeekTitle}>{valgt ? inspectorNode : <WeekSummary week={week} weeklyLoad={weeklyLoad} playerId={playerId} roster={roster} onSelectPlayer={id => router.push(`/admin/workbench/${id}?uke=${week.weekStart}`)} onNyOkt={() => { setUkeArkApen(false); setNyOkt({ dato: week.weekStart, startMinutt: 16 * 60 }); }} onLagreUkeplan={onLagreUkeplan} lagrer={travel} />}</BunnArk>
      </div>
      <CreateSessionModal key={nyOkt ? `${nyOkt.dato}:${nyOkt.startMinutt}` : "lukket"} open={nyOkt !== null} dato={nyOkt?.dato ?? idag} startMinutt={nyOkt?.startMinutt ?? 16 * 60} lagrer={travel} onLukk={() => setNyOkt(null)} onOpprett={(v: NyOktVerdier) => motor.opprett(v, (id) => { setNyOkt(null); setValgtId(id); })} />
      <PublishConfirmDialog open={publiserApen} okter={utkast} idag={idag} spillerNavn={spillerNavn} notater={valideringsnotater} opptattIder={opptattIder} valgte={valgtePubliser} onVeksle={(id) => setValgtePubliser((prev) => { const neste = new Set(prev); if (neste.has(id)) neste.delete(id); else neste.add(id); return neste; })} onVelgAlle={() => setValgtePubliser((prev) => prev.size === utkast.length ? new Set() : new Set(utkast.map((s) => s.id)))} publiserer={travel} onLukk={() => setPubliserApen(false)} onPubliserValgte={() => motor.publiser(utkast.filter((s) => valgtePubliser.has(s.id)).map((s) => s.id), () => setPubliserApen(false))} onPubliserAlle={() => motor.publiser(utkast.map((s) => s.id), () => setPubliserApen(false))} />
    </div>
  );
}

function Topplinje({
  spillerNavn,
  week,
  weeklyLoad,
  antallUtkast,
  travel,
  onForrige,
  onNeste,
  onIdag,
  onNyOkt,
  onPubliser,
}: {
  playerId: string;
  spillerNavn: string;
  week: WeekViewModel;
  weeklyLoad: WeeklyLoadResult;
  antallUtkast: number;
  travel: boolean;
  onForrige: () => void;
  onNeste: () => void;
  onIdag: () => void;
  onNyOkt: () => void;
  onPubliser: () => void;
}) {
  const ukeNr = isoWeekNumber(week.weekStart);
  const gjennomfort = week.days.flatMap(d => d.sessions).filter(s => s.status === "COMPLETED").reduce((sum, s) => sum + s.durationMinutes, 0);
  const wp = week.weekPlan;
  const typeLabel =
    wp?.weekType === "UTVIKLING"
      ? "Utvikling"
      : wp?.weekType === "VEDLIKEHOLD"
        ? "Vedlikehold"
        : wp?.weekType === "TURNERING"
          ? "Turnering"
          : null;

  const noteLabels: Record<string, string> = {
    TEKNIKK_UKE: "Teknikkuke",
    PRE_TURNERING: "Pre-turnering",
    SAMLING: "Samling",
    TEST: "Test",
    EVALUERING: "Evaluering",
    FERIE: "Ferie",
  };

  return <>
    <div className="wb-heading">
      <div>
        <span className="wb-kicker">{UI.weekPlan}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <h1>Uke {ukeNr}</h1>
          {typeLabel && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                fontSize: 11,
                fontFamily: TL.font.mono,
                fontWeight: 600,
                borderRadius: 12,
                background:
                  wp?.weekType === "UTVIKLING"
                    ? "color-mix(in srgb, var(--ak-grunn-farge-rust-600) 15%, transparent)"
                    : wp?.weekType === "TURNERING"
                      ? `color-mix(in srgb, ${TL.warn} 20%, transparent)`
                      : `color-mix(in srgb, ${TL.viz.target} 15%, transparent)`,
                color:
                  wp?.weekType === "UTVIKLING"
                    ? "var(--ak-grunn-farge-rust-600)"
                    : wp?.weekType === "TURNERING"
                      ? TL.warn
                      : TL.viz.target,
                border: "1px solid currentColor",
              }}
            >
              {typeLabel}
            </span>
          )}
          {wp?.notes?.map((n) => (
            <span
              key={n}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                fontSize: 10,
                fontFamily: TL.font.mono,
                fontWeight: 500,
                borderRadius: 12,
                background: "var(--wb-surface)",
                border: "1px solid var(--wb-border)",
                color: "var(--wb-body)",
              }}
            >
              {noteLabels[n] ?? n}
            </span>
          ))}
        </div>
      </div>
      <span className="wb-sub">
        {spillerNavn} · {week.budget.plannedMinutes ? `${formatHours(week.budget.plannedMinutes)} t` : "—"} planlagt · {gjennomfort ? `${formatHours(gjennomfort)} t gjennomført` : "— gjennomført"}
        {weeklyLoad.totalLoad > 0 ? ` · ${weeklyLoad.totalLoad} sRPE (snitt ${weeklyLoad.averageEffort})` : ""}
      </span>
      <button type="button" className="wb-publish" disabled={!antallUtkast || travel} onClick={onPubliser}>{UI.publishWeek}</button>
    </div>
    <div className="wb-controls" aria-label="Ukehandlinger">
      <button type="button" className="wb-quiet" aria-label={UI.weekNavPrev} onClick={onForrige}>‹</button>
      <button type="button" className="wb-quiet" onClick={onIdag}>{UI.today}</button>
      <button type="button" className="wb-quiet" aria-label={UI.weekNavNext} onClick={onNeste}>›</button>
      <button type="button" className="wb-quiet" onClick={onNyOkt}>{UI.createSession}</button>
    </div>
  </>;
}

function WeekSummary({
  week,
  weeklyLoad,
  onNyOkt,
  playerId,
  roster = [],
  onSelectPlayer,
  onLagreUkeplan,
  lagrer = false,
}: {
  week: WeekViewModel;
  weeklyLoad?: WeeklyLoadResult;
  onNyOkt: () => void;
  playerId?: string;
  roster?: { id: string; navn: string }[];
  onSelectPlayer?: (id: string) => void;
  onLagreUkeplan?: (data: Partial<SaveWeekPlanInput>) => void;
  lagrer?: boolean;
}) {
  const [fane, setFane] = useState<"rammer" | "info">("rammer");

  return (
    <section className="wb-week-summary" aria-label={UI.selectedWeekTitle}>
      <span className="wb-kicker">{UI.selectedWeekTitle}</span>
      <h2>Uke {isoWeekNumber(week.weekStart)}</h2>
      <p>
        {week.budget.plannedMinutes ? `${formatHours(week.budget.plannedMinutes)} t` : "—"} planlagt · mål {week.budget.targetMinutes ? `${formatHours(week.budget.targetMinutes)} t` : "—"}
        {weeklyLoad && weeklyLoad.totalLoad > 0 ? ` · ${weeklyLoad.totalLoad} sRPE (${weeklyLoad.ratedSessionsCount}/${weeklyLoad.totalSessionsCount} vurdert)` : ""}
      </p>
      {onSelectPlayer && <label className="wb-player-select">{UI.planFor}<select value={playerId} onChange={e => onSelectPlayer(e.target.value)}>{roster.map(p => <option key={p.id} value={p.id}>{p.navn}</option>)}</select></label>}

      {/* Tabs mellom Ukeplan & rammer og Formel/info */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, borderBottom: "1px solid var(--wb-border)", paddingBottom: 6 }}>
        <button
          type="button"
          onClick={() => setFane("rammer")}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            fontFamily: TL.font.sans,
            fontWeight: fane === "rammer" ? 600 : 400,
            color: fane === "rammer" ? "var(--ak-grunn-farge-rust-600)" : "var(--wb-muted)",
            cursor: "pointer",
            borderBottom: fane === "rammer" ? "2px solid var(--ak-grunn-farge-rust-600)" : "2px solid transparent",
            paddingBottom: 4,
          }}
        >
          Ukeplan & mål
        </button>
        <button
          type="button"
          onClick={() => setFane("info")}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            fontFamily: TL.font.sans,
            fontWeight: fane === "info" ? 600 : 400,
            color: fane === "info" ? "var(--ak-grunn-farge-rust-600)" : "var(--wb-muted)",
            cursor: "pointer",
            borderBottom: fane === "info" ? "2px solid var(--ak-grunn-farge-rust-600)" : "2px solid transparent",
            paddingBottom: 4,
          }}
        >
          {UI.formulaTitle}
        </button>
      </div>

      {fane === "rammer" && onLagreUkeplan && (
        <WeekPlanEditor key={week.weekPlan?.id ?? week.weekStart} weekPlan={week.weekPlan} onSave={onLagreUkeplan} lagrer={lagrer} />
      )}

      {fane === "info" && (
        <>
          <span className="wb-kicker">{UI.formulaTitle}</span>
          <dl>{[UI.pyramid, UI.drillArea, UI.formelMotorikk, UI.formelBelastning, UI.formelPress, UI.formelHensikt, UI.formelMate, UI.formelMal].map(label => <div key={label}><dt>{label}</dt><dd>—</dd></div>)}</dl>
          <p>{UI.inspectorEmptyBody}</p>
        </>
      )}

      <div style={{ marginTop: 16 }}>
        <button type="button" className="wb-quiet" onClick={onNyOkt}>{UI.createSession}</button>
      </div>
    </section>
  );
}
