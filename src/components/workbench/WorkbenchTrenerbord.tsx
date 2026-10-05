"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Knapp } from "@/components/precision/pa";
import { Ark } from "@/components/precision/pa-a4";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { TreningsvolumVisning } from "@/components/admin/precision/TreningsvolumVisning";
import { dagOgDato, klokke } from "@/components/admin/precision/AG11Ark";
import { STATUS_LABEL } from "@/lib/domain/workbench/labels";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import type { WorkbenchSamletData } from "@/lib/workbench/workbench-samlet-typer";
import { samletWorkbenchUrl } from "@/lib/workbench/samlet-url";
import { publishSessions, resolvePlayerApproval, unpublishSession } from "@/lib/workbench/wb-actions";
import { loadGroupWorkbenchSessions, publishGroupWorkbenchSessions, saveGroupWorkbenchSession, withdrawGroupWorkbenchSessions } from "@/lib/workbench/group-session-actions";

export function WorkbenchTrenerbord({ data }: { data: WorkbenchSamletData }) {
  const router = useRouter(); const [pending, start] = useTransition(); const [feil, setFeil] = useState<string | null>(null);
  const [valgt, setValgt] = useState(data.player.id); const [grupper, setGrupper] = useState(false);
  const bord = data.bord;
  if (!bord) return <div className="ws-empty"><h2>Trenerbordet kunne ikke hentes</h2><p>Prøv å åpne bordet på nytt.</p></div>;
  const rad = bord.rader.find(r => r.spiller.id === valgt) ?? bord.rader[0];
  const ref = data.planKontekst.referanse;
  const href = (playerId: string, s?: WorkbenchSession) => samletWorkbenchUrl(playerId, "uke", { uke: s?.date ?? data.uke.weekStart, aar: ref.aar, maned: ref.maned, okt: s?.id }, data.routeSurface);
  const kort = (playerId: string, s: WorkbenchSession) => <Link className="ws-session" data-status={s.status} key={s.id} href={href(playerId, s)}><small className="ws-num">{klokke(s.startMinute)} · {s.durationMinutes} min · {s.pyramid}</small><strong>{s.title}</strong><small>{STATUS_LABEL[s.status]}{s.needsPlayerApproval ? " · Venter på svar" : ""}</small><small>Registrert {s.actualMinutes == null ? "—" : `${s.actualMinutes} min`}</small></Link>;
  const handle = (s: WorkbenchSession, action: "publiser" | "trekk" | "ja" | "nei") => start(async () => { setFeil(null); try {
    const r = action === "publiser" ? await publishSessions([s.id]) : action === "trekk" ? await unpublishSession(s.id) : await resolvePlayerApproval({ sessionId: s.id, decision: action === "ja" ? "ACCEPTED" : "REJECTED" });
    if (!r.ok) { setFeil(r.error); return; } router.refresh();
  } catch { setFeil("Endringen kunne ikke lagres. Prøv igjen."); } });
  const oppfolging = rad?.followup?.sessions.filter(s => s.status !== "CANCELLED" && (s.status === "DRAFT" || s.needsPlayerApproval || s.isAgentProposal || (s.status === "COMPLETED" && s.actualMinutes == null))) ?? [];
  return <>
    <div className="ws-toolbar"><h2>{data.role === "player" ? "Din uke og oppfølging" : "Trenerbord"}</h2><span className="ws-muted">{dagOgDato(data.uke.weekStart)}–{dagOgDato(data.uke.days.at(-1)?.date ?? data.uke.weekStart)} · {bord.total} {bord.total === 1 ? "spiller" : "spillere"}</span>{data.role === "coach" && data.grupper.length > 0 && <Knapp variant="secondary" onClick={() => setGrupper(true)}>Gruppeøkter</Knapp>}</div>
    {feil && <div className="ws-pad"><InlineVarsel tone="warn">{feil}</InlineVarsel></div>}
    <div className="ws-board" aria-busy={pending}><main className="ws-panel">
      <div className="ws-matrix-scroll"><table className="ws-matrix"><caption className="ws-muted ws-pad">Plan og registrering for valgt uke</caption><thead><tr><th scope="col">Spiller</th>{data.uke.days.map(d => <th key={d.date} scope="col">{dagOgDato(d.date)}</th>)}</tr></thead><tbody>{bord.rader.map(r => <tr key={r.spiller.id}><th scope="row"><button type="button" className="ws-row-select" aria-pressed={rad?.spiller.id === r.spiller.id} onClick={() => setValgt(r.spiller.id)}>{r.spiller.navn}</button><Link href={href(r.spiller.id)}>Åpne uke</Link>{r.error && <span role="status">{r.error}</span>}</th>{data.uke.days.map(d => <td key={d.date}>{r.uke ? r.uke.days.find(x => x.date === d.date)?.sessions.filter(s => s.status !== "CANCELLED").map(s => kort(r.spiller.id, s)) : <span>—</span>}</td>)}</tr>)}</tbody></table></div>
      <div className="ws-board-mobile"><label className="ws-field">Spiller<select value={rad?.spiller.id ?? ""} onChange={e => setValgt(e.target.value)}>{bord.rader.map(r => <option key={r.spiller.id} value={r.spiller.id}>{r.spiller.navn}</option>)}</select></label>{rad?.error && <InlineVarsel tone="warn">{rad.error}</InlineVarsel>}{rad?.uke?.days.map(d => <details key={d.date} open={d.sessions.length > 0}><summary>{dagOgDato(d.date)} · {d.sessions.filter(s => s.status !== "CANCELLED").length} økter</summary>{d.sessions.filter(s => s.status !== "CANCELLED").map(s => kort(rad.spiller.id, s))}</details>)}</div>
      {bord.rader.length === 0 && <div className="ws-empty">Ingen tilgjengelige spillere.</div>}
      {rad?.volum && <section className="ws-section"><h3>{rad.spiller.navn} · treningsvolum</h3><TreningsvolumVisning volum={rad.volum} /></section>}
    </main><aside className="ws-detail"><section className="ws-section"><h2>Følg opp</h2><label className="ws-field">Spiller<select value={rad?.spiller.id ?? ""} onChange={e => setValgt(e.target.value)}>{bord.rader.map(r => <option key={r.spiller.id} value={r.spiller.id}>{r.spiller.navn}</option>)}</select></label>
      {rad?.followup && <p className="ws-muted">{dagOgDato(rad.followup.from)}–{dagOgDato(rad.followup.to)} · oppfølgingsvindu</p>}
      {!rad?.followup ? <p className="ws-muted">Oppfølgingsgrunnlaget er ikke tilgjengelig.</p> : !oppfolging.length ? <p className="ws-muted">Ingen økter i denne oppfølgingslisten.</p> : <ul className="ws-follow">{oppfolging.map(s => <li key={s.id}><strong>{s.title}</strong><span className="ws-muted">{dagOgDato(s.date)} · {STATUS_LABEL[s.status]}{s.actualMinutes == null && s.status === "COMPLETED" ? " · Tid mangler" : ""}</span><Link href={href(rad.spiller.id, s)}>Åpne og vurder økt</Link>
        {s.isAgentProposal && <span className="ws-muted">Forslag må vurderes i øktens verktøy før publisering.</span>}
        {!s.isAgentProposal && s.status === "DRAFT" && <Knapp size="sm" disabled={pending} onClick={() => handle(s, "publiser")}>Publiser økt</Knapp>}
        {data.role === "player" && s.needsPlayerApproval && <div className="ws-row"><Knapp size="sm" disabled={pending} onClick={() => handle(s, "ja")}>Godta</Knapp><Knapp size="sm" variant="secondary" disabled={pending} onClick={() => handle(s, "nei")}>Avslå</Knapp></div>}
        {data.role === "coach" && (s.status === "PUBLISHED" || s.status === "SCHEDULED") && <Knapp size="sm" variant="secondary" disabled={pending} onClick={() => handle(s, "trekk")}>Trekk tilbake</Knapp>}
      </li>)}</ul>}
    </section></aside></div>
    {grupper && data.role === "coach" && <GruppeArk data={data} onLukk={() => setGrupper(false)} />}
  </>;
}

function GruppeArk({ data, onLukk }: { data: WorkbenchSamletData; onLukk: () => void }) {
  const [groupId, setGroupId] = useState(data.valgtGruppeId ?? data.grupper[0]?.id ?? ""); const [sessions, setSessions] = useState<WorkbenchSession[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]); const [feil, setFeil] = useState<string | null>(null); const [status, setStatus] = useState<string | null>(null); const [pending, start] = useTransition();
  const [sourceId, setSourceId] = useState(""); const [dato, setDato] = useState(data.uke.weekStart); const [tid, setTid] = useState("16:00");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [formaal, setFormaal] = useState(""); const [sted, setSted] = useState(""); const [malsetning, setMalsetning] = useState("");
  const les = (id: string) => start(async () => { setFeil(null); try { const r = await loadGroupWorkbenchSessions(id); if (!r.ok) { setFeil(r.error); return; } setSessions(r.data); setSelected([]); } catch { setFeil("Gruppeøktene kunne ikke hentes."); } });
  const endre = (pub: boolean) => start(async () => { setFeil(null); try { const r = await (pub ? publishGroupWorkbenchSessions : withdrawGroupWorkbenchSessions)({ groupId, sessionIds: selected }); if (!r.ok) { setFeil(r.error); return; } setSessions(old => old?.map(s => r.data.find(n => n.id === s.id) ?? s) ?? r.data); setSelected([]); setStatus(pub ? "Gruppeøktene er publisert." : "Gruppeøktene er trukket tilbake."); } catch { setFeil("Gruppeendringen kunne ikke lagres. Prøv igjen."); } });
  const opprett = () => { const source = data.kilder.find(s => s.id === sourceId); if (!source?.drill) return; const rid = requestId ?? crypto.randomUUID(); setRequestId(rid); start(async () => { setFeil(null); try {
    const [h, m] = tid.split(":").map(Number); const drill = source.drill!; const r = await saveGroupWorkbenchSession({ groupId, requestId: rid, date: dato, startMinute: h * 60 + m, durationMinutes: Math.max(15, source.durationMinutes ?? drill.durationMinutes), title: source.title, pyramid: drill.akFormel.pyramid, rationale: formaal.trim() || undefined, location: sted.trim() || undefined, maalsetning: malsetning.trim() || undefined, drills: [{ title: drill.title, description: drill.description, durationMinutes: drill.durationMinutes, akFormel: drill.akFormel, techniqueFocus: drill.techniqueFocus, sourceId: drill.sourceId, exerciseId: drill.exerciseId, positionTaskId: drill.positionTaskId }] });
    if (!r.ok) { setFeil(r.error); return; } setSessions(old => [...(old ?? []).filter(s => s.id !== r.data.id), r.data]); setRequestId(null); setStatus("Gruppeøkten er lagret som utkast.");
  } catch { setFeil("Gruppeøkten kunne ikke lagres. Prøv igjen."); } }); };
  return <Ark open title="Gruppeøkter" onClose={onLukk} footer={<Knapp variant="ghost" onClick={onLukk}>Lukk</Knapp>}>
    {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}{status && <InlineVarsel tone="info">{status}</InlineVarsel>}
    <label className="ws-field">Gruppe<select value={groupId} disabled={pending} onChange={e => { setGroupId(e.target.value); setSessions(null); setSelected([]); setStatus(null); setRequestId(null); }}>{data.grupper.map(g => <option key={g.id} value={g.id}>{g.navn}</option>)}</select></label><Knapp variant="secondary" loading={pending} disabled={!groupId} onClick={() => les(groupId)}>Hent gruppeøkter</Knapp>
    {sessions && <><ul className="ws-library-list">{sessions.map(s => <li key={s.id}><label className="ws-group-choice"><input type="checkbox" checked={selected.includes(s.id)} disabled={pending || !["DRAFT", "SCHEDULED", "PUBLISHED"].includes(s.status)} onChange={e => setSelected(old => e.target.checked ? [...old, s.id] : old.filter(id => id !== s.id))} /><span>{s.title} · {dagOgDato(s.date)} · {STATUS_LABEL[s.status]}</span></label></li>)}</ul>{!sessions.length && <p>Ingen gruppeøkter.</p>}<div className="ws-row"><Knapp disabled={pending || !selected.length} onClick={() => endre(true)}>Publiser utvalg</Knapp><Knapp variant="secondary" disabled={pending || !selected.length} onClick={() => endre(false)}>Trekk tilbake utvalg</Knapp></div></>}
    <h3>Ny gruppeøkt fra øvelse</h3><label className="ws-field">Øvelse<select value={sourceId} onChange={e => { setSourceId(e.target.value); setRequestId(null); }}><option value="">Velg øvelse</option>{data.kilder.filter(s => s.drill).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label><label className="ws-field">Dato<input type="date" value={dato} onChange={e => { setDato(e.target.value); setRequestId(null); }} /></label><label className="ws-field">Klokkeslett<input type="time" value={tid} onChange={e => { setTid(e.target.value); setRequestId(null); }} /></label><label className="ws-field">Formål<textarea maxLength={1000} value={formaal} onChange={e => { setFormaal(e.target.value); setRequestId(null); }} /></label><label className="ws-field">Sted<input maxLength={160} value={sted} onChange={e => { setSted(e.target.value); setRequestId(null); }} /></label><label className="ws-field">Øktens målsetning<textarea maxLength={500} value={malsetning} onChange={e => { setMalsetning(e.target.value); setRequestId(null); }} /></label><Knapp disabled={pending || !sourceId || !dato || !tid} onClick={opprett}>Opprett gruppeutkast</Knapp>
    <p className="ws-muted">Gruppens eksisterende tilgangsregler styrer lagring og publisering.</p><Link href={`/admin/grupper/${encodeURIComponent(groupId)}/workbench`}>Åpne gruppens årsplan</Link>
  </Ark>;
}
