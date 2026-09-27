"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AREA_LABEL, formatMinutes, formatTime, STATUS_LABEL, UI } from "@/lib/domain/workbench/labels";
import { isoWeekNumber } from "@/lib/domain/workbench/operations";
import type { Drill, PlanningGoalSummary, SourceItem, WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import { nyRekkefolge } from "@/lib/domain/workbench/ovelse-rekkefolge";
import type { OvelseInput } from "@/lib/domain/workbench/ovelse-utkast";
import {
  addDrill,
  loadWeek,
  moveSession,
  publishSessions,
  removeDrill,
  reorderDrills,
  unpublishSession,
} from "@/lib/workbench/wb-actions";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { DIMENSJON_LABEL, SAND_TRINN_LABEL } from "@/lib/domain/ak-formel-v2";
import {
  hastighetTekst,
  MAALEUTSTYR_LABEL,
  mengdeTekst,
  stedTekst,
  TRENINGSMAATE_LABEL,
} from "@/lib/domain/workbench/ovelse-detaljer";
import { OvelseSkjema } from "./OvelseSkjema";
import { SourcesPanel } from "./SourcesPanel";
import { VisningPiller } from "./VisningPiller";

type Props = {
  playerId: string;
  spillerNavn: string;
  uke: WeekViewModel;
  selectedSessionId?: string;
  kilder: SourceItem[];
  roster?: { id: string; navn: string }[];
  goals?: PlanningGoalSummary[];
};

const MOTORIKK: Record<string, string> = {
  UTEN_BALL: "Uten ball",
  LAV_HAST: "Lav hastighet",
  AUTO: "Automatikk",
};
const BELASTNING: Record<string, string> = {
  INNENDORS: "Innendørs",
  TRENINGSOMRADE: "Treningsområde",
  BANE: "Bane",
  KONKURRANSE: "Konkurranse",
};
const PRESS: Record<string, string> = {
  ALENE: "Alene",
  OBSERVERT: "Observert",
  KONKURRANSE: "Konkurranse",
  TURNERING: "Turnering",
};
const PRAKSIS: Record<string, string> = {
  BLOKK: "Blokk",
  VARIABEL: "Variabel",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};

function sesjonerI(uke: WeekViewModel): WorkbenchSession[] {
  return uke.days.flatMap((dag) => dag.sessions).filter((s) => s.status !== "CANCELLED");
}

function datoLabel(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Oslo",
  }).format(new Date(`${iso}T12:00:00Z`));
}

function sluttMinutt(session: WorkbenchSession): number {
  return session.startMinute + session.durationMinutes;
}

function ovelseStart(session: WorkbenchSession, index: number): number {
  return session.startMinute + session.drills.slice(0, index).reduce((sum, drill) => sum + drill.durationMinutes, 0);
}

function detaljRader(drill: Drill | undefined) {
  const d = drill?.akFormel.detaljer;
  if (!d) return [];
  const rader: Array<{ label: string; hint: string; value: string | undefined }> = [
    { label: "Sted", hint: "Hvor øvelsen gjennomføres", value: stedTekst(d.sted) },
    { label: "Måleutstyr", hint: "Hvordan øvelsen måles", value: d.maaleutstyr ? MAALEUTSTYR_LABEL[d.maaleutstyr] : undefined },
    { label: "Hastighet", hint: "Prosent av spillerens Club Speed", value: hastighetTekst(d.hastighetProsent) },
    { label: "Teknisk fokus", hint: "Ett fokus per øvelse", value: d.tekniskFokus ? DIMENSJON_LABEL[d.tekniskFokus] : undefined },
    { label: "Sandtrinn", hint: "Bare bunker", value: d.sandTrinn ? SAND_TRINN_LABEL[d.sandTrinn] : undefined },
    { label: "Treningsmåte", hint: "Hvordan spilleren skal trene", value: d.treningsmaate ? TRENINGSMAATE_LABEL[d.treningsmaate] : undefined },
    { label: "Mengde", hint: "Hvor mye som skal gjøres", value: mengdeTekst(d.mengde) },
    { label: "Målemetode", hint: "Hvordan målet måles", value: d.mal?.malemetode },
    { label: "Resultatkrav", hint: "Hva som må til for å nå målet", value: d.mal?.resultatkrav },
    { label: "Notat", hint: "Fritekst", value: d.mal?.notat },
  ];
  return rader.filter((r): r is { label: string; hint: string; value: string } => r.value !== undefined);
}

function formel(session: WorkbenchSession, drill: Drill | undefined) {
  const f = drill?.akFormel ?? session.drills[0]?.akFormel;
  return [...formelGrunn(session, drill, f), ...detaljRader(drill)];
}

function formelGrunn(session: WorkbenchSession, drill: Drill | undefined, f: Drill["akFormel"] | undefined) {
  return [
    { label: UI.pyramid, hint: UI.formelHintPyramide, value: f?.pyramid ?? session.pyramid },
    { label: UI.drillArea, hint: UI.formelHintOmrade, value: f ? AREA_LABEL[f.area] : session.skillArea ?? "—" },
    { label: UI.formelMotorikk, hint: UI.formelHintMotorikk, value: f?.motorikk ? MOTORIKK[f.motorikk] : "—" },
    { label: UI.formelBelastning, hint: UI.formelHintBelastning, value: f?.belastning ? BELASTNING[f.belastning] : session.environment ? BELASTNING[session.environment] ?? session.environment : "—" },
    { label: UI.formelPress, hint: UI.formelHintPress, value: f?.press ? PRESS[f.press] : session.pressureLevel ?? "—" },
    { label: UI.formelHensikt, hint: UI.formelHintHensikt, value: session.pyramid === "FYS" ? session.rationale ?? "—" : "—" },
    { label: UI.formelMate, hint: UI.formelHintMate, value: drill?.description ?? (session.practiceType ? PRAKSIS[session.practiceType] : "—") },
    { label: UI.formelMal, hint: UI.formelHintMal, value: drill?.techniqueFocus ?? session.maalsetning ?? "—" },
  ];
}

export function WorkbenchOkt({ playerId, spillerNavn, uke, selectedSessionId, kilder, roster = [], goals = [] }: Props) {
  const router = useRouter();
  const [week, setWeek] = useState(uke);
  const [sessionId, setSessionId] = useState(selectedSessionId ?? sesjonerI(uke)[0]?.id ?? "");
  const [drillId, setDrillId] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [travel, startTransition] = useTransition();

  const sessions = useMemo(() => sesjonerI(week), [week]);
  const session = sessions.find((s) => s.id === sessionId) ?? sessions[0];
  const selectedDrill = session?.drills.find((d) => d.id === drillId) ?? session?.drills[0];
  const selectedDrillIndex = session && selectedDrill ? session.drills.findIndex((d) => d.id === selectedDrill.id) : -1;
  const formula = session ? formel(session, selectedDrill) : [];

  const refresh = useCallback(async () => {
    const res = await loadWeek({
      weekStart: week.weekStart,
      mode: week.mode,
      playerId,
      targetMinutes: week.budget.targetMinutes,
    });
    if (!res.ok) {
      setFeil(res.error);
      return null;
    }
    setWeek(res.data);
    setFeil(null);
    return res.data;
  }, [playerId, week.budget.targetMinutes, week.mode, week.weekStart]);

  function run<T>(action: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>, success: (data: T) => void) {
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) {
          setFeil(result.error);
          toast.error(result.error);
          return;
        }
        await refresh();
        success(result.data);
      } catch {
        setFeil(UI.unknownError);
        toast.error(UI.unknownError);
      }
    });
  }

  const [arkApen, setArkApen] = useState(false);
  const [bekreftFjernId, setBekreftFjernId] = useState<string | null>(null);

  function leggTilOvelse(ovelse: OvelseInput, ferdig: () => void) {
    if (!session) return;
    run(
      () => addDrill({ sessionId: session.id, drill: ovelse }),
      () => {
        toast.success(UI.toastDrillAdded);
        ferdig();
        setArkApen(false);
      },
    );
  }

  function flyttOvelse(direction: -1 | 1) {
    if (!session || !selectedDrill || selectedDrillIndex < 0) return;
    const ids = nyRekkefolge(session.drills.map((item) => item.id), selectedDrillIndex, direction);
    if (!ids) return;
    run(() => reorderDrills({ sessionId: session.id, orderedDrillIds: ids }), () => {});
  }

  function fjernOvelse() {
    if (!session || !selectedDrill) return;
    run(() => removeDrill({ sessionId: session.id, drillId: selectedDrill.id }), () => {
      setDrillId("");
      setBekreftFjernId(null);
      toast.success(UI.toastDrillRemoved);
    });
  }

  function selectSession(id: string) {
    setSessionId(id);
    setDrillId("");
    router.replace(workbenchUrl(playerId, "okt", { uke: week.weekStart, okt: id }), { scroll: false });
  }

  return (
    <div className="wb-layout wb-session-layout">
      <aside className="wb-sources">
        <SourcesPanel kilder={kilder} playerId={playerId} uke={week.weekStart} maned={week.weekStart.slice(0, 7)} aar={week.weekStart.slice(0, 4)} goals={goals} />
        <nav className="wb-roster" aria-label="Spillere i stallen">
          <span className="wb-kicker">Stall</span>
          {roster.map((p) => (
            <Link key={p.id} href={workbenchUrl(p.id, "okt", { uke: week.weekStart })} aria-current={p.id === playerId ? "page" : undefined}>
              {p.navn}<small>Spiller</small>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="wb-main">
        <div className="wb-pills">
          <VisningPiller playerId={playerId} visning="okt" uke={week.weekStart} maned={week.weekStart.slice(0, 7)} aar={week.weekStart.slice(0, 4)} okt={session?.id} />
        </div>
        <div className="wb-body wb-session-body">
          {feil ? <div className="wb-period-error" role="alert"><span>{feil}</span><button type="button" className="wb-quiet" onClick={() => void refresh()}>Prøv igjen</button></div> : null}

          {!session ? (
            <section className="wb-period-empty">
              <span className="wb-kicker">Økt</span>
              <h1>Ingen økt valgt</h1>
              <p>Uken har ingen økter. Åpne ukevisningen for å legge inn den første.</p>
              <Link className="wb-quiet wb-inline-link" href={workbenchUrl(playerId, "uke", { uke: week.weekStart })}>{UI.openWeek}</Link>
            </section>
          ) : (
            <>
              <header className="wb-heading wb-session-heading">
                <div><span className="wb-kicker">Uke {isoWeekNumber(week.weekStart)} · {STATUS_LABEL[session.status]}</span><h1>{session.title}</h1></div>
                <span className="wb-sub">{spillerNavn} · {datoLabel(session.date)} · {formatTime(session.startMinute)}–{formatTime(sluttMinutt(session))} · {formatMinutes(session.durationMinutes)} · {session.location ?? (session.environment ? BELASTNING[session.environment] ?? session.environment : "—")}</span>
                {session.status === "DRAFT" ? (
                  <button type="button" className="wb-publish" disabled={travel} onClick={() => run(() => publishSessions([session.id]), () => toast.success(UI.publishSuccess))}>Publiser økt</button>
                ) : (
                  <button type="button" className="wb-quiet" disabled={travel} onClick={() => run(() => unpublishSession(session.id), () => toast.success(UI.toastUnpublished))}>{UI.unpublish}</button>
                )}
              </header>

              {sessions.length > 1 ? (
                <label className="wb-session-picker"><span>Økt i uken</span><select value={session.id} onChange={(event) => selectSession(event.target.value)}>{sessions.map((item) => <option key={item.id} value={item.id}>{datoLabel(item.date)} · {formatTime(item.startMinute)} · {item.title}</option>)}</select></label>
              ) : null}

              <section className="wb-session-section" aria-labelledby="session-formel">
                <span className="wb-kicker" id="session-formel">{UI.formulaTitle}</span>
                <div className="wb-session-formula">{formula.map((item) => <div key={item.label}><span>{item.label} <button type="button" className="wb-help" title={item.hint} aria-label={`${item.label}: ${item.hint}`}>?</button></span><b data-empty={item.value === "—"}>{item.value}</b></div>)}</div>
              </section>

              <section className="wb-session-section" aria-labelledby="session-ovelser">
                <span className="wb-kicker" id="session-ovelser">{UI.drills}</span>
                {session.drills.length ? (
                  <div className="wb-session-drills">{session.drills.map((drill, index) => <button key={drill.id} type="button" data-lag={drill.akFormel.pyramid} aria-pressed={selectedDrill?.id === drill.id} onClick={() => setDrillId(drill.id)}><span>{index + 1}</span><b>{drill.title}</b><em>{drill.akFormel.pyramid}</em><small>{formatTime(ovelseStart(session, index))}</small><small>{formatMinutes(drill.durationMinutes)}</small></button>)}</div>
                ) : <div className="wb-session-empty">{UI.emptyDrills}</div>}
              </section>
            </>
          )}
        </div>
      </main>

      <aside className="wb-inspector">
        {session ? <SessionEditor session={session} drill={selectedDrill} drillIndex={selectedDrillIndex} travel={travel} formula={formula} onMove={(date, startMinute, durationMinutes) => run(() => moveSession({ sessionId: session.id, newDate: date, newStartMinute: startMinute, newDurationMinutes: durationMinutes }), () => toast.success(UI.toastSessionMoved))} onAdd={leggTilOvelse} onReorder={flyttOvelse} onRemove={fjernOvelse} /> : <p className="wb-empty">Velg eller opprett en økt i ukevisningen.</p>}
      </aside>

      {session ? <aside className="wb-mobile-summary wb-session-mobile" aria-label="Valgt øvelse"><div className="wb-grip" aria-hidden /><span className="wb-kicker">{selectedDrill ? `Øvelse ${selectedDrillIndex + 1} av ${session.drills.length}` : "Valgt økt"}</span><h2>{selectedDrill?.title ?? session.title}</h2><p>{selectedDrill ? `${formatTime(ovelseStart(session, selectedDrillIndex))} · ${formatMinutes(selectedDrill.durationMinutes)}` : formatMinutes(session.durationMinutes)}</p><dl>{formula.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl><div className="wb-mobile-actions">{selectedDrill ? (bekreftFjernId === selectedDrill.id ? (<div className="wb-mobile-ovelse wb-mobile-bekreft" role="alertdialog" aria-label="Bekreft fjerning"><p>Fjerne «{selectedDrill.title}» fra økten?</p><button type="button" className="wb-quiet" disabled={travel} onClick={() => setBekreftFjernId(null)}>Avbryt</button><button type="button" className="wb-publish" disabled={travel} onClick={fjernOvelse}>Fjern øvelsen</button></div>) : (<div className="wb-mobile-ovelse"><button type="button" className="wb-quiet" disabled={travel || selectedDrillIndex <= 0} onClick={() => flyttOvelse(-1)}>Flytt opp</button><button type="button" className="wb-quiet" disabled={travel || selectedDrillIndex >= session.drills.length - 1} onClick={() => flyttOvelse(1)}>Flytt ned</button><button type="button" className="wb-quiet" disabled={travel} onClick={() => setBekreftFjernId(selectedDrill.id)}>Fjern</button></div>)) : null}<button type="button" className="wb-quiet wb-mobile-add" disabled={travel} onClick={() => setArkApen(true)}>{UI.addDrill}</button><Link className="wb-quiet wb-inline-link" href={workbenchUrl(playerId, "uke", { uke: week.weekStart })}>{UI.openWeek}</Link>{session.status === "DRAFT" ? <button type="button" className="wb-publish" disabled={travel} onClick={() => run(() => publishSessions([session.id]), () => toast.success(UI.publishSuccess))}>Publiser økt</button> : null}</div></aside> : null}
      {session ? <OvelseSkjema modus="ark" apen={arkApen} onLukk={() => setArkApen(false)} standardPyramide={session.pyramid} disabled={travel} onSubmit={leggTilOvelse} /> : null}
    </div>
  );
}

function SessionEditor({ session, drill, drillIndex, travel, formula, onMove, onAdd, onReorder, onRemove }: {
  session: WorkbenchSession;
  drill?: Drill;
  drillIndex: number;
  travel: boolean;
  formula: Array<{ label: string; hint: string; value: string }>;
  onMove: (date: string, startMinute: number, durationMinutes: number) => void;
  onAdd: (ovelse: OvelseInput, ferdig: () => void) => void;
  onReorder: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [date, setDate] = useState(session.date);
  const [start, setStart] = useState(formatTime(session.startMinute));
  const [duration, setDuration] = useState(session.durationMinutes);
  const [hours, minutes] = start.split(":").map(Number);
  const changed = date !== session.date || hours * 60 + minutes !== session.startMinute || duration !== session.durationMinutes;

  return <div className="wb-session-editor">
    <span className="wb-kicker">{drill ? `Øvelse ${drillIndex + 1} av ${session.drills.length}` : "Valgt økt"}</span>
    <h2>{drill?.title ?? session.title}</h2>
    <p>{drill ? `${formatTime(ovelseStart(session, drillIndex))} · ${formatMinutes(drill.durationMinutes)}` : formatMinutes(session.durationMinutes)}</p>
    <dl>{formula.map((item) => <div key={item.label}><dt title={item.hint}>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
    {drill ? <div className="wb-session-editor-actions"><button type="button" className="wb-quiet" disabled={travel || drillIndex <= 0} onClick={() => onReorder(-1)}>Flytt opp</button><button type="button" className="wb-quiet" disabled={travel || drillIndex >= session.drills.length - 1} onClick={() => onReorder(1)}>Flytt ned</button><button type="button" className="wb-quiet" disabled={travel} onClick={onRemove}>{UI.removeDrillLabel}</button></div> : null}

    <details className="wb-session-edit" open>
      <summary>Rediger tid</summary>
      <label>Dato<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <div><label>Start<input type="time" step={1800} value={start} onChange={(event) => setStart(event.target.value)} /></label><label>Varighet<input type="number" min={15} max={720} step={5} value={duration} onChange={(event) => setDuration(Number(event.target.value))} /></label></div>
      <button type="button" className="wb-quiet" disabled={travel || !changed || !Number.isFinite(hours) || !Number.isFinite(minutes)} onClick={() => onMove(date, hours * 60 + minutes, duration)}>{UI.save}</button>
    </details>

    <OvelseSkjema standardPyramide={session.pyramid} disabled={travel} onSubmit={onAdd} />
  </div>;
}
