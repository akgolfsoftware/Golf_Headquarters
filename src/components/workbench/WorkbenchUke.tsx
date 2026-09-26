"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Knapp } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { BunnArk } from "@/components/v2/bunn-ark";
import { useInspektorSynlig } from "@/components/v2/inspektorpanel";
import { TL } from "@/lib/v2/train-lock";
import { addDays, isoWeekNumber, mondayOf, validateWeek } from "@/lib/domain/workbench/operations";
import { AREA_LABEL, formatHours, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { SourceItem, WeekViewModel, WorkbenchSession, RecurrencePolicy } from "@/lib/domain/workbench/types";
import { addDrill, addDrillFromSource, createSession, createSessionFromSource, createSessionSeries, deleteSession, deleteSessionSeries, loadWeek, moveSession, publishSessions, removeDrill, reorderDrills, saveWeekPlan, type SaveWeekPlanInput, setSessionTemplate, unpublishSession, updateSessionEffort } from "@/lib/workbench/wb-actions";
import { computeWeeklyLoad, type WeeklyLoadResult } from "@/lib/domain/workbench/load";
import { CreateSessionModal, type NyOktVerdier } from "./CreateSessionModal";
import { PublishConfirmDialog } from "./PublishConfirmDialog";
import { SessionInspector, type FlyttVerdier, type LeggTilDrillVerdier } from "./SessionInspector";
import { SourcesPanel } from "./SourcesPanel";
import { osloIdag, WeekGrid } from "./WeekGrid";
import { VisningPiller } from "./VisningPiller";
import { WeekPlanEditor } from "./WeekPlanEditor";

type Props = { playerId: string; spillerNavn: string; uke: WeekViewModel; kilder: SourceItem[]; roster?: { id: string; navn: string }[] };

export function WorkbenchUke({ playerId, spillerNavn, uke, kilder, roster = [] }: Props) {
  const router = useRouter();
  const inspectorSynlig = useInspektorSynlig();
  const [week, setWeek] = useState<WeekViewModel>(uke);
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [nyOkt, setNyOkt] = useState<{ dato: string; startMinutt: number } | null>(null);
  const [ukeArkApen, setUkeArkApen] = useState(false);
  const [publiserApen, setPubliserApen] = useState(false);
  const [valgtePubliser, setValgtePubliser] = useState<Set<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, start] = useTransition();
  const idag = osloIdag();
  const alleOkter = useMemo(() => week.days.flatMap((d) => d.sessions), [week]);
  const weeklyLoad = useMemo(() => computeWeeklyLoad(alleOkter), [alleOkter]);
  const utkast = useMemo(() => alleOkter.filter((s) => s.status === "DRAFT"), [alleOkter]);
  const valideringsnotater = useMemo(() => validateWeek(alleOkter), [alleOkter]);
  const opptattIder = useMemo(() => new Set(valideringsnotater.map((n) => n.sessionId).filter((id): id is string => !!id)), [valideringsnotater]);
  const valgt = useMemo(() => alleOkter.find((s) => s.id === valgtId) ?? null, [alleOkter, valgtId]);

  const lastPaaNytt = useCallback(async () => {
    const res = await loadWeek({ weekStart: week.weekStart, mode: week.mode, playerId, targetMinutes: week.budget.targetMinutes });
    if (res.ok) { setWeek(res.data); setFeil(null); } else { setFeil(res.error); }
  }, [playerId, week.weekStart, week.mode, week.budget.targetMinutes]);

  function kjor<T>(handling: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>, vedSuksess: (data: T) => void) {
    start(async () => {
      try {
        const res = await handling();
        if (!res.ok) { setFeil(res.error); toast.error(res.error); return; }
        setFeil(null);
        await lastPaaNytt();
        vedSuksess(res.data);
      } catch {
        setFeil(UI.unknownError);
        toast.error(UI.unknownError);
      }
    });
  }

  function byttUke(retning: -1 | 1) {
    router.push(`/admin/workbench/${playerId}?uke=${mondayOf(addDays(week.weekStart, retning * 7))}`);
  }

  const onLagreUkeplan = useCallback(
    (data: Partial<SaveWeekPlanInput>) => {
      kjor(
        () =>
          saveWeekPlan({
            playerId,
            isoYear: parseInt(week.weekStart.slice(0, 4), 10),
            weekNumber: isoWeekNumber(week.weekStart),
            weekType: data.weekType ?? week.weekPlan?.weekType ?? "UTVIKLING",
            notes: data.notes ?? week.weekPlan?.notes ?? [],
            plannedHoursFys: data.plannedHoursFys,
            plannedHoursTek: data.plannedHoursTek,
            plannedHoursSlag: data.plannedHoursSlag,
            plannedHoursSpill: data.plannedHoursSpill,
            plannedHoursTurn: data.plannedHoursTurn,
            repTargetDry: data.repTargetDry,
            repTargetLowSpeed: data.repTargetLowSpeed,
            repTargetFullSpeed: data.repTargetFullSpeed,
            repTargetPutting: data.repTargetPutting,
            repTargetShortGame: data.repTargetShortGame,
            loadCeiling: data.loadCeiling,
            customNotes: data.customNotes,
          }),
        () => toast.success("Ukeplan lagret")
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerId, week.weekStart, week.weekPlan]
  );

  const inspectorNode = (
    <SessionInspector
      key={valgt ? `${valgt.id}:${valgt.date}:${valgt.startMinute}:${valgt.durationMinutes}` : "tom"}
      session={valgt}
      travel={travel}
      onFlytt={(v: FlyttVerdier) => { if (!valgt) return; kjor(() => moveSession({ sessionId: valgt.id, newDate: v.newDate, newStartMinute: v.newStartMinute, newDurationMinutes: v.newDurationMinutes }), () => toast.success(UI.toastSessionMoved)); }}
      onPubliser={() => { if (!valgt) return; kjor(() => publishSessions([valgt.id]), () => toast.success(UI.publishSuccess)); }}
      onTrekkTilbake={() => { if (!valgt) return; kjor(() => unpublishSession(valgt.id), () => toast.success(UI.toastUnpublished)); }}
      onSlett={(policy: RecurrencePolicy) => {
        if (!valgt) return;
        const id = valgt.id;
        if (!valgt.seriesId) { kjor(() => deleteSession(id), () => { setValgtId(null); toast.success(UI.toastSessionDeleted); }); return; }
        kjor(() => deleteSessionSeries({ sessionId: id, policy }), ({ slettet }) => { setValgtId(null); toast.success(UI.toastSeriesDeleted(slettet)); });
      }}
      onLagreSomMal={(isTemplate: boolean) => { if (!valgt) return; kjor(() => setSessionTemplate(valgt.id, isTemplate), () => toast.success(isTemplate ? UI.toastTemplateSaved : UI.toastTemplateRemoved)); }}
      onLeggTilDrill={(v: LeggTilDrillVerdier) => {
        if (!valgt) return;
        const etiketter = [PYRAMID_LABEL[v.pyramid], AREA_LABEL[v.area]];
        if (v.motorikk) etiketter.push(v.motorikk === "UTEN_BALL" ? "Uten ball" : v.motorikk === "LAV_HAST" ? "Lav hastighet" : "Automatikk");
        if (v.belastning) etiketter.push(v.belastning === "INNENDORS" ? "Innendørs" : v.belastning === "TRENINGSOMRADE" ? "Treningsområde" : v.belastning === "BANE" ? "Bane" : "Konkurranse");
        if (v.press) etiketter.push(v.press === "ALENE" ? "Alene" : v.press === "OBSERVERT" ? "Observert" : v.press === "KONKURRANSE" ? "Konkurranse" : "Turnering");
        const descParts = [v.description, v.mengde].filter(Boolean);
        const samletBeskrivelse = descParts.length > 0 ? descParts.join(" · ") : undefined;
        kjor(
          () =>
            addDrill({
              sessionId: valgt.id,
              drill: {
                title: v.title,
                durationMinutes: v.durationMinutes,
                akFormel: {
                  pyramid: v.pyramid,
                  area: v.area,
                  motorikk: v.motorikk,
                  belastning: v.belastning,
                  press: v.press,
                  label: etiketter.join(" · "),
                },
                techniqueFocus: v.techniqueFocus,
                description: samletBeskrivelse,
              },
            }),
          () => toast.success(UI.toastDrillAdded)
        );
      }}
      onFlyttDrill={(drillId, retning) => {
        if (!valgt) return;
        const idx = valgt.drills.findIndex((d) => d.id === drillId);
        const nyIdx = idx + retning;
        if (idx < 0 || nyIdx < 0 || nyIdx >= valgt.drills.length) return;
        const rekkefolge = valgt.drills.map((d) => d.id);
        [rekkefolge[idx], rekkefolge[nyIdx]] = [rekkefolge[nyIdx], rekkefolge[idx]];
        kjor(() => reorderDrills({ sessionId: valgt.id, orderedDrillIds: rekkefolge }), () => {});
      }}
      onFjernDrill={(drillId) => { if (!valgt) return; kjor(() => removeDrill({ sessionId: valgt.id, drillId }), () => toast.success(UI.toastDrillRemoved)); }}
      onOppdaterAnstrengelse={(rpe, min) => {
        if (!valgt) return;
        kjor(
          () => updateSessionEffort({ sessionId: valgt.id, perceivedEffort: rpe, actualMinutes: min }),
          () => toast.success("Belastning oppdatert")
        );
      }}
    />
  );

  return (
    <div className="wb-layout">
      <aside className="wb-sources">
        <SourcesPanel kilder={kilder} playerId={playerId} uke={week.weekStart} maned={week.weekStart.slice(0, 7)} aar={week.weekStart.slice(0, 4)} />
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
          <WeekGrid week={week} selectedSessionId={valgtId} onSelectSession={setValgtId} onCreateAt={(dato, startMinutt) => setNyOkt({ dato, startMinutt })} onDropSource={(dato, startMinutt, sourceId) => { kjor(() => createSessionFromSource({ playerId, sourceId, date: dato, startMinute: startMinutt }), (okt) => { setValgtId(okt.id); toast.success(UI.toastSourceDropped); }); }} onDropDrillOnSession={(sessionId, sourceId) => { kjor(() => addDrillFromSource({ sessionId, sourceId }), () => toast.success(UI.toastDrillDroppedOnSession)); }} />

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
      <CreateSessionModal key={nyOkt ? `${nyOkt.dato}:${nyOkt.startMinutt}` : "lukket"} open={nyOkt !== null} dato={nyOkt?.dato ?? idag} startMinutt={nyOkt?.startMinutt ?? 16 * 60} lagrer={travel} onLukk={() => setNyOkt(null)} onOpprett={(v: NyOktVerdier) => {
        const { repeatWeeks, ...felter } = v;
        if (repeatWeeks > 1) { kjor(() => createSessionSeries({ playerId, ...felter, repeatWeeks }), (okter: WorkbenchSession[]) => { setNyOkt(null); setValgtId(okter[0]?.id ?? null); toast.success(UI.toastSeriesCreated(okter.length)); }); return; }
        kjor(() => createSession({ playerId, ...felter }), (okt: WorkbenchSession) => { setNyOkt(null); setValgtId(okt.id); toast.success(UI.toastDraftCreated); });
      }} />
      <PublishConfirmDialog open={publiserApen} okter={utkast} idag={idag} spillerNavn={spillerNavn} notater={valideringsnotater} opptattIder={opptattIder} valgte={valgtePubliser} onVeksle={(id) => setValgtePubliser((prev) => { const neste = new Set(prev); if (neste.has(id)) neste.delete(id); else neste.add(id); return neste; })} onVelgAlle={() => setValgtePubliser((prev) => prev.size === utkast.length ? new Set() : new Set(utkast.map((s) => s.id)))} publiserer={travel} onLukk={() => setPubliserApen(false)} onPubliserValgte={() => { const ider = utkast.filter((s) => valgtePubliser.has(s.id)).map((s) => s.id); if (ider.length === 0) return; kjor(() => publishSessions(ider), (publiserte: WorkbenchSession[]) => { setPubliserApen(false); toast.success(publiserte.length === 1 ? UI.toastPublishedOne : UI.toastPublishedMany(publiserte.length)); }); }} onPubliserAlle={() => { kjor(() => publishSessions(utkast.map((s) => s.id)), (publiserte: WorkbenchSession[]) => { setPubliserApen(false); toast.success(publiserte.length === 1 ? UI.toastPublishedOne : UI.toastPublishedMany(publiserte.length)); }); }} />
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
                      ? "color-mix(in srgb, #f59e0b 20%, transparent)"
                      : "color-mix(in srgb, #3b82f6 15%, transparent)",
                color:
                  wp?.weekType === "UTVIKLING"
                    ? "var(--ak-grunn-farge-rust-600)"
                    : wp?.weekType === "TURNERING"
                      ? "#d97706"
                      : "#2563eb",
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
