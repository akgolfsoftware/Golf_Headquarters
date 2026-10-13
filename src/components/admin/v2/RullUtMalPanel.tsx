"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { Layers } from "lucide-react";
import { Knapp, KnappLenke } from "@/components/precision/pa";
import { coachApplyTemplateToGroup, forhaandsvisMalUtrulling, hentMalUtrullingGruppe } from "@/lib/workbench/apply-template-actions";
import { GruppeMalPublisering } from "./GruppeMalPublisering";
import type { MalUtrullingInput, MalUtrullingPreview } from "@/lib/workbench/template-rollout-kontrakt";
import { osloPlanDato } from "@/lib/workbench/plan-kontekst";
import { addDays, mondayOf } from "@/lib/domain/workbench/operations";
import "@/styles/precision-player-coach-upgrade.css";

export interface RullUtMal { id: string; name: string; varighetUker: number; sessionCount: number }
type GruppeInfo = Extract<Awaited<ReturnType<typeof hentMalUtrullingGruppe>>, { ok: true }>["data"];
type Kvittering = Extract<Awaited<ReturnType<typeof coachApplyTemplateToGroup>>, { ok: true }>;
const tid = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2,"0")}:${String(minute % 60).padStart(2,"0")}`;

/** Valgt mal, faktiske mottakere og kildefestet bekreftelse før én atomisk utrulling. */
export function RullUtMalPanel({ groupId: fixedGroupId, grupper = [], maler, initialTemplateId }: {
  groupId?: string; grupper?: readonly { id: string; name: string }[]; maler: readonly RullUtMal[];
  antallMedlemmer?: number; initialTemplateId?: string;
}) {
  const router = useRouter();
  const [groupId, setGroupId] = useState(fixedGroupId ?? "");
  const [templateId, setTemplateId] = useState(maler.some(m => m.id === initialTemplateId) ? initialTemplateId! : maler[0]?.id ?? "");
  const [weeks, setWeeks] = useState(1);
  const [weekStart, setWeekStart] = useState(addDays(mondayOf(osloPlanDato()), 7));
  const [startTime, setStartTime] = useState("09:00");
  const [mode, setMode] = useState<"PERSONLIGE_FORSLAG" | "GRUPPEUTKAST">("PERSONLIGE_FORSLAG");
  const [loaded, setLoaded] = useState<{ groupId: string; data: GruppeInfo } | null>(null);
  const [loadError, setLoadError] = useState<{ groupId: string; text: string } | null>(null);
  const [recipients, setRecipients] = useState<string[] | null>(null);
  const [schedules, setSchedules] = useState<string[] | null>(null);
  const [preview, setPreview] = useState<MalUtrullingPreview | null>(null);
  const [result, setResult] = useState<Kvittering | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [pending, start] = useTransition();
  const lock = useRef(false);
  const info = loaded?.groupId === groupId ? loaded.data : null;
  const selectedTemplate = maler.find(m => m.id === templateId);

  useEffect(() => {
    if (!groupId) return;
    let active = true;
    void hentMalUtrullingGruppe(groupId).then(response => {
      if (!active) return;
      if (response.ok) { setLoaded({ groupId, data: response.data }); setLoadError(null); }
      else setLoadError({ groupId, text: response.error });
    }).catch(() => { if (active) setLoadError({ groupId, text: "Mottakerne kunne ikke hentes. Åpne gruppen på nytt." }); });
    return () => { active = false; };
  }, [groupId]);
  function endret() { setPreview(null); setResult(null); setError(null); setPublished(false); }
  function options(): MalUtrullingInput {
    const [h,m] = startTime.split(":").map(Number);
    return { mode, weekStart, uker: weeks, startMinute: h * 60 + m,
      ...(mode === "PERSONLIGE_FORSLAG" && recipients !== null ? { recipientIds: recipients } : {}),
      ...(mode === "GRUPPEUTKAST" && schedules !== null ? { groupScheduleIds: schedules } : {}) };
  }
  function vis() {
    if (lock.current) return; lock.current = true;
    start(async () => { setError(null); setResult(null); try {
      const response = await forhaandsvisMalUtrulling(groupId, templateId, options());
      if (!response.ok) { setError(response.error); return; }
      setPreview(response.data);
    } catch (error) { unstable_rethrow(error); setError("Forhåndsvisningen kunne ikke hentes. Valgene er beholdt."); } finally { lock.current = false; } });
  }
  function bekreft() {
    if (!preview || lock.current) return; lock.current = true;
    start(async () => { setError(null); try {
      const response = await coachApplyTemplateToGroup(groupId, templateId, { ...options(), expectedFingerprint: preview.fingerprint });
      if (!response.ok) { setError(response.error); return; }
      setResult(response); router.refresh();
    } catch (error) { unstable_rethrow(error); setError("Utrullingen kunne ikke bekreftes. Vis en ny forhåndsvisning før du prøver igjen."); } finally { lock.current = false; } });
  }
  if (!maler.length) return <section className="mal-rollout"><h2>Bruk en planmal</h2><p>Ingen godkjente maler er tilgjengelige.</p><KnappLenke href="/admin/plan-templates/ny" variant="secondary">Lag mal</KnappLenke></section>;

  return <section className="mal-rollout" aria-busy={pending}>
    <h2>Bruk en planmal</h2><p>Personlige økter sendes som forslag. Gruppeutkast følger registrert gruppetid og publiseres etter en egen bekreftelse.</p>
    <div className="mal-rollout__fields">
      {!fixedGroupId && <label>Gruppe<select value={groupId} disabled={pending} onChange={e => { setGroupId(e.target.value); setRecipients(null); setSchedules(null); endret(); }}><option value="">Velg gruppe</option>{grupper.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>}
      <label>Planmal<select value={templateId} disabled={pending} onChange={e => { setTemplateId(e.target.value); setWeeks(1); endret(); }}>{maler.map(m => <option key={m.id} value={m.id}>{m.name} · {m.varighetUker} uker · {m.sessionCount} økter</option>)}</select></label>
      <label>Utrulling<select value={mode} disabled={pending} onChange={e => { setMode(e.target.value as typeof mode); endret(); }}><option value="PERSONLIGE_FORSLAG">Personlige forslag · spilleren godtar</option><option value="GRUPPEUTKAST">Gruppens egne økter · innen gruppetid</option></select></label>
      <label>Startuke<input type="date" value={weekStart} disabled={pending} onChange={e => { setWeekStart(e.target.value); endret(); }} /></label>
      <label>Antall uker<input type="number" min={1} max={Math.min(selectedTemplate?.varighetUker ?? 52,52)} value={weeks} disabled={pending} onChange={e => { setWeeks(Number(e.target.value)); endret(); }} /></label>
      {mode === "PERSONLIGE_FORSLAG" && <label>Starttid per dag<input type="time" value={startTime} disabled={pending} onChange={e => { setStartTime(e.target.value); endret(); }} /></label>}
    </div>
    {loadError?.groupId === groupId && <p role="alert">{loadError.text}</p>}
    {groupId && !info && loadError?.groupId !== groupId && <p role="status">Henter aktive mottakere…</p>}
    {info && <fieldset className="mal-rollout__recipients"><legend>{mode === "GRUPPEUTKAST" ? "Gruppens aktive spillere" : "Mottakere"}</legend>
      {!info.recipients.length && <p>Ingen aktive spillere i denne gruppen.</p>}
      {info.recipients.map(m => <label key={m.id}><input type="checkbox" checked={mode === "GRUPPEUTKAST" || (recipients ?? info.recipients.map(r => r.id)).includes(m.id)} disabled={pending || mode === "GRUPPEUTKAST"} onChange={e => { const ids = recipients ?? info.recipients.map(r => r.id); setRecipients(e.target.checked ? [...ids,m.id] : ids.filter(id => id !== m.id)); endret(); }} />{m.name}</label>)}
    </fieldset>}
    {info && mode === "GRUPPEUTKAST" && <fieldset className="mal-rollout__recipients"><legend>Registrerte gruppetider</legend>
      {!info.schedules.length && <p>Registrer gruppetid før du lager gruppeutkast.</p>}
      {info.schedules.map(s => <label key={s.id}><input type="checkbox" checked={(schedules ?? info.schedules.map(r => r.id)).includes(s.id)} disabled={pending} onChange={e => { const ids = schedules ?? info.schedules.map(r => r.id); setSchedules(e.target.checked ? [...ids,s.id] : ids.filter(id => id !== s.id)); endret(); }} />{s.title} · {new Intl.DateTimeFormat("nb-NO",{ timeZone:"Europe/Oslo", weekday:"long",hour:"2-digit",minute:"2-digit" }).format(new Date(s.startAt))}–{new Intl.DateTimeFormat("nb-NO",{ timeZone:"Europe/Oslo",hour:"2-digit",minute:"2-digit" }).format(new Date(s.endAt))}{s.kind ? " · Samling bruker invitasjon" : ""}</label>)}
      <KnappLenke variant="ghost" href={`/admin/grupper/${encodeURIComponent(groupId)}/timeplan`}>Åpne gruppens timeplan</KnappLenke>
    </fieldset>}
    <Knapp variant="secondary" icon={Layers} disabled={pending || !info?.recipients.length || !selectedTemplate} onClick={vis}>Vis konkret utrulling</Knapp>
    {error && <p role="alert" className="mal-rollout__error">{error}</p>}
    {preview && <div className="mal-rollout__preview">
      <h3>{preview.template.name} · {preview.group.name}</h3><p>{preview.recipients.length} spillere · {preview.sessions.length} maløkter · {preview.newCount} nye {preview.mode === "GRUPPEUTKAST" ? "gruppeutkast" : "forslag"} · {preview.existingCount} finnes fra før.</p>
      <ul className="mal-rollout__names">{preview.recipients.map(r => <li key={r.id}>{r.name} · {r.sessionCount} økter</li>)}</ul>
      <ol>{preview.sessions.map(s => <li key={`${s.sourceId}:${s.date}`}><strong>{s.title}</strong><span>{s.date} · {tid(s.startMinute)}–{tid(s.startMinute+s.durationMinutes)} · {s.durationMinutes} min · {s.pyramid} · {s.drillCount} øvelser</span>{s.location && <span>{s.location}</span>}{s.focus && <span>{s.focus}</span>}</li>)}</ol>
      {!result && <><p>{preview.mode === "GRUPPEUTKAST" ? "Dette oppretter gruppens utkast. Ingen spillerkopier publiseres nå." : "Dette sender øktene som forslag. Spillerens aktive plan endres først når spilleren godtar."}</p><Knapp disabled={pending} loading={pending} onClick={bekreft}>{preview.mode === "GRUPPEUTKAST" ? "Bekreft gruppeutkast" : "Bekreft og send forslag"}</Knapp></>}
    </div>}
    {result && <div role="status" className="mal-rollout__receipt"><h3>{published ? "Gruppeøktene er publisert" : result.mode === "GRUPPEUTKAST" ? "Gruppeutkastene er lagret" : "Forslagene er opprettet"}</h3><p>{result.okterOpprettet} nye · {result.eksisterende} eksisterende beholdt · {result.spillere} spillere.</p><KnappLenke variant="secondary" href={`/admin/grupper/${encodeURIComponent(groupId)}/workbench?mal=${encodeURIComponent(templateId)}`}>Åpne gruppe-workbench</KnappLenke>{result.mode === "GRUPPEUTKAST" && !published && <GruppeMalPublisering groupId={groupId} sessionIds={result.sessionIds} onPublished={() => setPublished(true)} />}</div>}
  </section>;
}
