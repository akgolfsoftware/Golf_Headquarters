"use client";

import { useCallback, useMemo, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Knapp } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { BunnArk } from "@/components/v2/bunn-ark";
import { TL } from "@/lib/v2/train-lock";
import { addDays, isoWeekNumber, mondayOf, validateWeek } from "@/lib/domain/workbench/operations";
import { AREA_LABEL, formatHours, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { SourceItem, WeekViewModel, WorkbenchSession, RecurrencePolicy } from "@/lib/domain/workbench/types";
import { addDrill, addDrillFromSource, createSession, createSessionFromSource, createSessionSeries, deleteSession, deleteSessionSeries, loadWeek, moveSession, publishSessions, removeDrill, reorderDrills, setSessionTemplate, unpublishSession } from "@/lib/workbench/wb-actions";
import { CreateSessionModal, type NyOktVerdier } from "./CreateSessionModal";
import { PublishConfirmDialog } from "./PublishConfirmDialog";
import { SessionInspector, type FlyttVerdier, type LeggTilDrillVerdier } from "./SessionInspector";
import { SourcesPanel } from "./SourcesPanel";
import { osloIdag, WeekGrid } from "./WeekGrid";
import { VisningPiller } from "./VisningPiller";

type Props = { playerId: string; spillerNavn: string; uke: WeekViewModel; kilder: SourceItem[] };

export function WorkbenchUke({ playerId, spillerNavn, uke, kilder }: Props) {
  const router = useRouter();
  const [week, setWeek] = useState<WeekViewModel>(uke);
  const [valgtId, setValgtId] = useState<string | null>(null);
  const [nyOkt, setNyOkt] = useState<{ dato: string; startMinutt: number } | null>(null);
  const [publiserApen, setPubliserApen] = useState(false);
  const [valgtePubliser, setValgtePubliser] = useState<Set<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, start] = useTransition();
  const idag = osloIdag();
  const alleOkter = useMemo(() => week.days.flatMap((d) => d.sessions), [week]);
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
        kjor(() => addDrill({ sessionId: valgt.id, drill: { title: v.title, durationMinutes: v.durationMinutes, akFormel: { pyramid: v.pyramid, area: v.area, label: `${PYRAMID_LABEL[v.pyramid]} · ${AREA_LABEL[v.area]}` }, description: v.description } }), () => toast.success(UI.toastDrillAdded));
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
    />
  );

  return (
    <div style={{ display: "grid", gap: 16, minWidth: 0, background: "#F2F1ED", color: "#111111", fontFamily: "var(--tl-font-sans)" }}>
      <Topplinje playerId={playerId} spillerNavn={spillerNavn} week={week} antallUtkast={utkast.length} travel={travel} onForrige={() => byttUke(-1)} onNeste={() => byttUke(1)} onIdag={() => router.push(`/admin/workbench/${playerId}?uke=${mondayOf(idag)}`)} onNyOkt={() => setNyOkt({ dato: week.days[0]?.date ?? idag, startMinutt: 16 * 60 })} onPubliser={() => { setValgtePubliser(new Set(utkast.filter((s) => !opptattIder.has(s.id)).map((s) => s.id))); setPubliserApen(true); }} />
      {feil && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 2, border: `1px solid color-mix(in srgb, ${TL.danger} 35%, transparent)`, background: `color-mix(in srgb, ${TL.danger} 8%, transparent)` }}>
          <Icon name="triangle-alert" size={15} style={{ color: TL.danger }} />
          <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, flex: 1 }}>{feil}</span>
          <Knapp ghost onClick={() => void lastPaaNytt()}>{UI.retry}</Knapp>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[var(--wb-kilder)_minmax(0,1fr)_var(--wb-artefakt)]" style={{ gap: 16, minWidth: 0, alignItems: "start", ["--wb-kilder" as string]: TL.skall.kilder, ["--wb-artefakt" as string]: TL.skall.artefakt }}>
        <div className="hidden lg:block" style={{ minWidth: 0 }}>
          <SourcesPanel kilder={kilder} playerId={playerId} uke={week.weekStart} maned={week.weekStart.slice(0, 7)} aar={week.weekStart.slice(0, 4)} />
        </div>
        <div style={{ minWidth: 0 }}>
          <WeekGrid week={week} selectedSessionId={valgtId} onSelectSession={setValgtId} onCreateAt={(dato, startMinutt) => setNyOkt({ dato, startMinutt })} onDropSource={(dato, startMinutt, sourceId) => { kjor(() => createSessionFromSource({ playerId, sourceId, date: dato, startMinute: startMinutt }), (okt) => { setValgtId(okt.id); toast.success(UI.toastSourceDropped); }); }} onDropDrillOnSession={(sessionId, sourceId) => { kjor(() => addDrillFromSource({ sessionId, sourceId }), () => toast.success(UI.toastDrillDroppedOnSession)); }} />
        </div>
        <div className="hidden lg:block" style={{ minWidth: 0 }}>{inspectorNode}</div>
      </div>
      <div className="lg:hidden">
        <BunnArk open={valgtId !== null} onClose={() => setValgtId(null)} tittel={valgt?.title ?? UI.inspectorTitle}>{inspectorNode}</BunnArk>
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

function Topplinje({ playerId, spillerNavn, week, antallUtkast, travel, onForrige, onNeste, onIdag, onNyOkt, onPubliser }: { playerId: string; spillerNavn: string; week: WeekViewModel; antallUtkast: number; travel: boolean; onForrige: () => void; onNeste: () => void; onIdag: () => void; onNyOkt: () => void; onPubliser: () => void }) {
  const ukeNr = isoWeekNumber(week.weekStart);
  const manedNavn = UI.monthNames[Number(week.weekStart.slice(5, 7)) - 1];
  const ghost: CSSProperties = { minHeight: 44, borderRadius: 2, padding: "0 12px" };
  return (
    <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
          <span style={{ fontFamily: TL.font.sans, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{spillerNavn}</span>
          {antallUtkast > 0 && <span style={{ fontFamily: TL.font.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{UI.draftCountBadge(antallUtkast)}</span>}
        </div>
        <VisningPiller playerId={playerId} visning="uke" uke={week.weekStart} maned={week.weekStart.slice(0, 7)} aar={week.weekStart.slice(0, 4)} />
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center", flexWrap: "wrap" }}>
          <Knapp ghost icon="chevron-left" onClick={onForrige} style={ghost}>{UI.weekNavPrev}</Knapp>
          <Knapp ghost onClick={onIdag} style={ghost}>{UI.today}</Knapp>
          <Knapp ghost icon="chevron-right" onClick={onNeste} style={ghost}>{UI.weekNavNext}</Knapp>
          <Knapp ghost icon="plus" onClick={onNyOkt} style={ghost}>{UI.createSession}</Knapp>
          <Knapp enTing disabled={antallUtkast === 0 || travel} onClick={onPubliser} style={{ minHeight: 44, borderRadius: 2, padding: "0 18px", fontSize: 13, fontWeight: 600, ...(antallUtkast === 0 || travel ? { background: TL.dim, color: TL.mute } : { background: "#9B2415", color: "#F4EFE6" }) }}>{UI.publish}</Knapp>
        </div>
      </div>
      <div style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
        {UI.yearSeason(Number(week.weekStart.slice(0, 4)))}<span style={{ margin: "0 4px" }}>›</span>{manedNavn}<span style={{ margin: "0 4px" }}>›</span><span style={{ color: TL.text, fontWeight: 600 }}>{UI.weekCrumb(ukeNr)}</span>
        <span style={{ marginLeft: 12 }}>{UI.budgetLabel(formatHours(week.budget.plannedMinutes), formatHours(week.budget.targetMinutes))}</span>
      </div>
    </div>
  );
}
