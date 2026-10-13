"use client";
import "@/styles/precision-month.css";

import { useEffect, useRef, useState, useTransition } from "react";
import { Knapp } from "@/components/precision/pa";
import { Ark } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { MonthDetailsSchema, emptyMonthDetails, type MonthDetails, type MonthOwner, type MonthPlanView } from "@/lib/domain/month-plan";
import { evaluerMaanedsplan, hentMaanedsplan, lagreMaanedsplan, svarMaanedsplanForslag } from "@/lib/workbench/month-plan-actions";
import { MONTH_PART_LABEL, MonthPlanContent, MonthPlanFields, type MonthPart } from "./MonthPlanFields";
import { TreningsvolumVisning } from "@/components/admin/precision/TreningsvolumVisning";
import type { Treningsvolum } from "@/lib/workbench/treningsvolum";

export type MonthSummary = { plannedMinutes: number | null; registeredMinutes: number | null; tournaments: number | null; tests: number | null; source: string };
export type MonthEvent = { id: string; title: string; date: string; kind: "turnering" | "test" };
type Props = { owner: MonthOwner; year: number; month: number; summary?: MonthSummary; events?: MonthEvent[]; volume?: Treningsvolum; initialData?: MonthPlanView };
export function MonthPlan(props: Props) {
  const ownerId = props.owner.kind === "player" ? props.owner.playerId : props.owner.groupId;
  return <MonthPlanInner key={`${props.owner.kind}-${ownerId}-${props.year}-${props.month}`} {...props} />;
}
function MonthPlanInner({ owner, year, month, summary, events = [], volume, initialData }: Props) {
  const [data, setData] = useState<MonthPlanView | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [edit, setEdit] = useState<MonthPart | "evaluering" | null>(null);
  const [draft, setDraft] = useState<MonthDetails>(emptyMonthDetails);
  const [score, setScore] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState("");
  const [pending, start] = useTransition();
  const busy = useRef(false);
  const request = useRef<{ signature: string; id: string } | null>(null);
  const key = { owner, year, month };
  const monthName = new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
  const ownerId = owner.kind === "player" ? owner.playerId : owner.groupId;
  useEffect(() => {
    if (initialData) return;
    let current = true;
    hentMaanedsplan({ owner, year, month }).then(result => {
      if (!current) return;
      if (result.ok && result.data) setData(result.data); else setError(result.ok ? "Månedsplanen kunne ikke hentes." : result.error);
    }).catch(() => { if (current) setError("Månedsplanen kunne ikke hentes. Prøv igjen."); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
    // Owner and date changes remount this component; the request stays bound to that month.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, year, month]);
  function reload() {
    if (busy.current) return;
    setLoading(true); setError(null);
    hentMaanedsplan(key).then(result => { if (result.ok && result.data) setData(result.data); else setError(result.ok ? "Månedsplanen kunne ikke hentes." : result.error); }).catch(() => setError("Månedsplanen kunne ikke hentes. Prøv igjen.")).finally(() => setLoading(false));
  }
  function open(part: MonthPart | "evaluering") {
    if (!data || busy.current) return;
    setError(null); setReceipt(null); request.current = null;
    setDraft(structuredClone(data.canPropose ? data.proposedDetails ?? data.details ?? emptyMonthDetails() : data.details ?? emptyMonthDetails()));
    const existing = data.evaluationRole === "spiller" ? data.playerEvaluation : data.coachEvaluation;
    setScore(existing?.score ?? null); setEvaluation(existing?.text ?? ""); setEdit(part);
  }
  function mutate(operation: "save" | "evaluate" | "accept" | "decline") {
    if (!data || busy.current) return;
    const details = { ...draft, goals: draft.goals.map(goal => goal.trim()).filter(Boolean) };
    if (operation === "save" && !MonthDetailsSchema.safeParse(details).success) { setError("Kontroller feltene. Fokus kan ha 80 tegn, målsetningene 400 tegn hver og timer må være null eller høyere."); return; }
    const payload = operation === "save" ? { details } : operation === "evaluate" ? { score, text: evaluation } : { accept: operation === "accept" };
    const signature = JSON.stringify({ operation, payload, revision: data.revision });
    if (request.current?.signature !== signature) request.current = { signature, id: crypto.randomUUID() };
    const input = { ...key, expectedRevision: data.revision, requestId: request.current.id };
    busy.current = true; setError(null); setReceipt(null);
    start(async () => {
      try {
        const result = operation === "save" ? await lagreMaanedsplan({ ...input, details }) : operation === "evaluate" ? await evaluerMaanedsplan({ ...input, score, text: evaluation }) : await svarMaanedsplanForslag({ ...input, accept: operation === "accept" });
        if (!result.ok) { setError(result.error); return; }
        if (!result.data) { setError("Lagringen kunne ikke bekreftes. Innholdet er beholdt her."); return; }
        setData(result.data); setEdit(null); request.current = null;
        setReceipt(operation === "save" && data.canPropose ? "Forslaget er lagret. Spilleren må godkjenne det før månedsplanen endres." : operation === "accept" ? "Forslaget er godkjent og månedsplanen er oppdatert." : operation === "decline" ? "Forslaget er avslått. Din månedsplan er beholdt." : operation === "evaluate" ? "Evalueringen er lagret." : "Månedsplanen er lagret.");
      } catch { setError("Vi kunne ikke bekrefte lagringen. Prøv igjen med samme innhold."); }
      finally { busy.current = false; }
    });
  }
  const hours = (minutes: number | null) => minutes === null ? "Ikke registrert" : `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 }).format(minutes / 60)} t`;
  const editable = data?.canEdit || data?.canPropose;
  return <section className="month-plan" aria-label={`Månedsplan for ${monthName}`} aria-busy={loading || pending}>
    <header className="month-plan__head"><div><h2>{monthName}</h2><p className="ws-muted">{owner.kind === "group" ? "Gruppens månedsplan" : "Din månedsplan"}</p></div>{data && <span className="month-plan__status">{data.proposedDetails ? "Forslag venter" : data.details ? "Plan lagret" : "Fokus ikke satt"}</span>}</header>
    {summary && <><dl className="month-summary"><div><dt>Planlagt</dt><dd>{hours(summary.plannedMinutes)}</dd></div><div><dt>Registrert</dt><dd>{hours(summary.registeredMinutes)}</dd></div><div><dt>Turneringer</dt><dd>{summary.tournaments ?? "—"}</dd></div><div><dt>Tester</dt><dd>{summary.tests ?? "—"}</dd></div></dl><p className="ws-muted month-source">{summary.source}</p></>}
    {volume && <details><summary>Månedens mengde per akse og datagrunnlag</summary><TreningsvolumVisning volum={volume} enhet="t" /></details>}
    {loading && <p role="status">Henter månedsplanen …</p>}
    {error && <InlineVarsel tone="warn">{error} {!edit && <Knapp variant="ghost" disabled={pending || loading} onClick={reload}>Hent på nytt</Knapp>}</InlineVarsel>}
    {receipt && <p className="month-receipt" role="status">{receipt}</p>}
    {data && <>
      {data.details ? <MonthPlanContent details={data.details} /> : <p className="ws-muted">Samle månedens fokus, målsetninger og prioriteringer her.</p>}
      {editable && <div className="month-edit-actions">{(Object.keys(MONTH_PART_LABEL) as MonthPart[]).map((part, i) => <Knapp key={part} variant={i === 0 ? "primary" : "secondary"} disabled={pending} onClick={() => open(part)}>{data.canPropose ? `Foreslå: ${MONTH_PART_LABEL[part].toLowerCase()}` : MONTH_PART_LABEL[part]}</Knapp>)}</div>}
      {data.canPropose && <p className="ws-muted">Endringer sendes som forslag. Spilleren godkjenner sin egen månedsplan.</p>}
      {owner.kind === "group" && data.canEdit && <p className="ws-muted">Du redigerer gruppeplanen. Medlemmenes personlige planer endres separat.</p>}
      {data.proposedDetails && <section className="month-proposal"><h3>Forslag fra coach</h3>{data.proposalStale && <InlineVarsel tone="warn">Månedsplanen er endret etter dette forslaget. Coachen må oppdatere det før det kan godkjennes.</InlineVarsel>}<details><summary>Se hele forslaget</summary><MonthPlanContent details={data.proposedDetails} /></details>{data.canRespond && <div className="ws-row"><Knapp loading={pending} disabled={data.proposalStale || pending} onClick={() => mutate("accept")}>Godkjenn forslag</Knapp><Knapp variant="secondary" disabled={pending} onClick={() => mutate("decline")}>Avslå forslag</Knapp></div>}</section>}
      {events.length > 0 && <details className="month-events"><summary>Hendelser · {events.length}</summary><ul>{events.map(event => <li key={event.id}><time dateTime={event.date}>{new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${event.date.slice(0, 10)}T12:00:00Z`))}</time><span>{event.title}</span><small>{event.kind === "test" ? "Test" : "Turnering"}</small></li>)}</ul></details>}
      <section className="month-evaluations"><h3>Evaluering</h3>{!data.ended ? <p className="ws-muted">Spiller og coach evaluerer hver for seg når måneden er avsluttet.</p> : <><div className="month-evaluation-grid">{[["Spiller", data.playerEvaluation], ["Coach", data.coachEvaluation]].map(([name, result]) => { const value = typeof result === "object" ? result : null; return <div key={String(name)}><h4>{String(name)}</h4><p>{value ? `${value.score ?? "—"} av 5` : "Ikke evaluert"}</p>{value?.text && <p className="month-note">{value.text}</p>}</div>; })}</div>{data.evaluationRole && <Knapp variant="secondary" disabled={pending} onClick={() => open("evaluering")}>Evaluer som {data.evaluationRole}</Knapp>}</>}</section>
    </>}
    {edit && data && <Ark open title={edit === "evaluering" ? `Evaluering · ${monthName}` : MONTH_PART_LABEL[edit]} onClose={() => { if (!busy.current) setEdit(null); }} footer={<><Knapp loading={pending} disabled={loading || (edit === "evaluering" && score === null && !evaluation.trim())} onClick={() => mutate(edit === "evaluering" ? "evaluate" : "save")}>{edit === "evaluering" ? "Lagre evaluering" : data.canPropose ? "Send forslag" : "Lagre månedsplan"}</Knapp><Knapp variant="ghost" disabled={pending} onClick={() => setEdit(null)}>Avbryt</Knapp></>}>
      {error && <InlineVarsel tone="warn">{error}</InlineVarsel>}
      {edit === "evaluering" ? <><div role="group" aria-label="Vurder måneden fra 1 til 5" className="month-scores">{[1, 2, 3, 4, 5].map(value => <button type="button" key={value} aria-pressed={score === value} onClick={() => setScore(value)}>{value}</button>)}</div><label className="ws-field">Din evaluering<textarea rows={6} maxLength={600} value={evaluation} onChange={e => setEvaluation(e.target.value)} /><small>{evaluation.length} av 600 tegn</small></label></> : <MonthPlanFields part={edit} value={draft} onChange={setDraft} />}
    </Ark>}
  </section>;
}
