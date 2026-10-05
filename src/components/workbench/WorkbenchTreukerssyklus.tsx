"use client";
import { useEffect, useState } from "react";
import { Knapp } from "@/components/precision/pa";
import { Ark } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { UkeplanArk, dagOgDato } from "@/components/admin/precision/AG11Ark";
import { isoUkeIdentitet, tommeUkeplandetaljer, UKEPLAN_TYPER } from "@/lib/workbench/ukeplan-schema";
import { UKEPLAN_OMRADER } from "@/lib/workbench/ukeplan-schema";
import { syklusPlanfelter, type TreukerssyklusData, type LagreSyklusInput } from "@/lib/workbench/treukerssyklus";
import { lastTreukerssyklus, lagreTreukerssyklus, kopierTreukerssyklus, opplosTreukerssyklus } from "@/lib/workbench/treukerssyklus-actions";
import type { WbResultat } from "@/lib/workbench/wb-actions";

async function sikkert<T>(run: () => Promise<WbResultat<T>>): Promise<WbResultat<T>> {
  try { return await run(); } catch { return { ok: false, error: "Kunne ikke kontakte serveren. Utkastet er beholdt; prøv samme handling igjen." }; }
}

export function WorkbenchTreukerssyklus({ playerId, anchorWeek, onLukk, onLagret }: { playerId: string; anchorWeek: string; onLukk(): void; onLagret(): void }) {
  const [data, setData] = useState<TreukerssyklusData | null>(null);
  const [drafts, setDrafts] = useState<LagreSyklusInput["weeks"] | null>(null);
  const [edit, setEdit] = useState<number | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const receive = (value: TreukerssyklusData) => {
    setData(value); setDrafts(value.weeks.map(w => ({ expected: w.expected, fields: syklusPlanfelter(w.plan) })) as LagreSyklusInput["weeks"]); setRequestId(null); setConfirmed(false);
  };
  useEffect(() => { let active = true; void sikkert(() => lastTreukerssyklus({ playerId, anchorWeek })).then(result => {
    if (!active) return; if (result.ok) receive(result.data); else setError(result.error); setBusy(false);
  }); return () => { active = false; }; }, [playerId, anchorWeek]);
  async function save() {
    if (!drafts) return; const id = requestId ?? crypto.randomUUID(); setRequestId(id); setBusy(true); setError(null);
    const result = await sikkert(() => lagreTreukerssyklus({ playerId, anchorWeek, requestId: id, weeks: drafts }));
    if (result.ok) { receive(result.data); onLagret(); } else setError(result.error); setBusy(false);
  }
  async function preview() {
    setBusy(true); setError(null); setConfirmed(false); setRequestId(null);
    const result = await sikkert(() => lastTreukerssyklus({ playerId, anchorWeek, targetWeek: target }));
    if (result.ok) setData(result.data); else setError(result.error); setBusy(false);
  }
  async function copy() {
    if (!data?.targets) return; const id = requestId ?? crypto.randomUUID(); setRequestId(id); setBusy(true); setError(null);
    const targets = data.targets;
    const result = await sikkert(() => kopierTreukerssyklus({ playerId, anchorWeek, targetWeek: target, requestId: id, sourceExpected: data.weeks.map(w => w.expected), targetExpected: targets.map(w => w.expected), confirmedFilledTargets: confirmed }));
    if (result.ok) { setData(previous => previous ? { ...previous, targets: result.data.weeks } : previous); setRequestId(null); setConfirmed(false); onLagret(); } else setError(result.error); setBusy(false);
  }
  async function dissolve() {
    if (!data) return; setBusy(true); setError(null);
    const result = await sikkert(() => opplosTreukerssyklus({ playerId, anchorWeek, expected: data.weeks.map(w => w.expected) }));
    if (result.ok) { receive(result.data); onLagret(); } else setError(result.error); setBusy(false);
  }
  const dirty = Boolean(data && drafts && drafts.some((d, i) => JSON.stringify(d.fields) !== JSON.stringify(syklusPlanfelter(data.weeks[i].plan))));
  const linked = data?.weeks.every(w => w.plan?.planningDetails?.cycle);
  const editing = edit === null ? null : data?.weeks[edit];
  return <>
    <Ark open title="Treukerssyklus" kicker="Tre sammenhengende kalenderuker" onClose={onLukk} footer={<><Knapp fullWidth loading={busy} disabled={!drafts} onClick={() => void save()}>Lagre alle tre uker</Knapp><Knapp fullWidth variant="ghost" disabled={busy} onClick={onLukk}>Lukk</Knapp></>}>
      <div className="a9-skjema" aria-busy={busy}>
        <p>Velg uketype og mengde fritt i hver uke. Ingen automatisk belastningsprogresjon.</p>
        {error && <InlineVarsel tone="warn">{error}</InlineVarsel>}
        {!data && !error && <p>Laster ukeplaner …</p>}
        {data?.weeks.map((week, i) => { const fields = drafts?.[i].fields; return <section key={week.weekStart}>
          <h3>Uke {isoUkeIdentitet(week.weekStart).weekNumber} · {dagOgDato(week.weekStart)}</h3>
          <p>{UKEPLAN_TYPER.find(t => t.id === fields?.planningDetails?.weekType)?.navn ?? "Ingen uketype valgt"} · {fields?.planningDetails?.location ?? "Oppholdssted ikke valgt"}</p>
          <p>{fields?.notes?.includes("TEST") ? "Testuke · " : ""}{week.sessions.length} økter kan kopieres. {week.excludedSessions} gruppe-, skjulte eller avventende økter kopieres ikke.</p>
          <dl className="ws-kv">{UKEPLAN_OMRADER.map(area => {
            const hours = { FYS: fields?.plannedHoursFys, TEK: fields?.plannedHoursTek, SLAG: fields?.plannedHoursSlag, SPILL: fields?.plannedHoursSpill, TURN: fields?.plannedHoursTurn }[area];
            const details = fields?.planningDetails?.areas[area];
            return <div key={area}><dt>{area}</dt><dd>{hours == null ? "Timer ikke fastsatt" : `${hours} timer`} · {details?.sessionBudget == null ? "Øktbudsjett ikke fastsatt" : `${details.sessionBudget} økter`}{details?.focus ? ` · ${details.focus}` : ""}</dd></div>;
          })}</dl>
          <Knapp variant="secondary" disabled={busy} onClick={() => setEdit(i)}>Rediger uke {i + 1}</Knapp>
        </section>; })}
        {linked && <Knapp variant="ghost" disabled={busy || dirty} onClick={() => void dissolve()}>Oppløs sykluskoblingen · behold ukeplaner og økter</Knapp>}
        <h3>Kopier til tre nye uker</h3>{dirty && <p>Lagre ukeendringene før forhåndsvisning.</p>}
        <label className="ws-field">Målmandag<input type="date" value={target} disabled={busy} onChange={e => { setTarget(e.target.value); setConfirmed(false); setData(previous => previous ? { weeks: previous.weeks } : previous); setRequestId(null); }} /></label>
        <Knapp variant="secondary" disabled={busy || !linked || dirty || !target} onClick={() => void preview()}>Forhåndsvis kopiering</Knapp>
        {data?.targets && <section><h3>Konsekvens for målukene</h3>
          {data.targets.map((w, i) => <p key={w.weekStart}>{dagOgDato(w.weekStart)}: {w.plan ? "Eksisterende planfelter erstattes" : "Ny ukeplan"}. {w.sessions.length + w.excludedSessions} eksisterende økter beholdes; {data.weeks[i].sessions.length} nye utkast legges til.</p>)}
          <p>Gjennomføring, logg, publisering, gruppeoriginaler og kalenderhendelser kopieres ikke.</p>
          <label><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />Jeg har gjennomgått konsekvensen for alle tre måluker.</label>
          <Knapp fullWidth disabled={busy || !confirmed} onClick={() => void copy()}>Kopier tre uker som utkast</Knapp>
        </section>}
      </div>
    </Ark>
    {editing && edit !== null && drafts && <UkeplanArk key={editing.weekStart} weekPlan={{ playerId, ...isoUkeIdentitet(editing.weekStart), weekType: "UTVIKLING", notes: [], ...editing.plan, ...drafts[edit].fields, planningDetails: drafts[edit].fields.planningDetails ?? tommeUkeplandetaljer() }} ukeNr={isoUkeIdentitet(editing.weekStart).weekNumber} travel={busy} onLukk={() => setEdit(null)} onLagre={fields => {
      setDrafts(previous => previous ? previous.map((w, i) => i === edit ? { ...w, fields: { ...w.fields, ...fields } } : w) as LagreSyklusInput["weeks"] : previous); setEdit(null); setRequestId(null); setData(previous => previous ? { weeks: previous.weeks } : previous);
    }} />}
  </>;
}
