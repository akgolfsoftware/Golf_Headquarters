"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ark } from "@/components/precision/pa-a4";
import { Knapp } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { lagreWorkbenchHendelse, lastWorkbenchHendelser, slettWorkbenchHendelse } from "@/lib/workbench/hendelser-actions";
import type { HendelseInput } from "@/lib/workbench/hendelser-kontrakt";
import { addDays } from "@/lib/domain/workbench/operations";

type Rad = Extract<Awaited<ReturnType<typeof lastWorkbenchHendelser>>, { ok: true }>["data"][number];
export function WorkbenchHendelserArk({ playerId, dato, editable, onLukk, onLagret }: { playerId: string; dato: string; editable: boolean; onLukk: () => void; onLagret?: () => void }) {
  const router = useRouter(), [pending, start] = useTransition(), [error, setError] = useState<string | null>(null), [rows, setRows] = useState<Rad[]>([]);
  const [valgt, setValgt] = useState<Rad | null>(null);
  const [form, setForm] = useState({ title: "", kind: "AVTALE", startDate: dato, endDate: dato, start: "08:00", end: "09:00", recurring: "NONE", isPrivate: false, note: "" });
  const load = () => lastWorkbenchHendelser(playerId, dato, addDays(dato, 7)).then(r => { if (r.ok) setRows(r.data); else setError(r.error); }).catch(() => setError("Hendelsene kunne ikke hentes. Prøv igjen."));
  useEffect(() => { let active = true; void lastWorkbenchHendelser(playerId, dato, addDays(dato, 7)).then(r => { if (active) { if (r.ok) setRows(r.data); else setError(r.error); } }).catch(() => { if (active) setError("Hendelsene kunne ikke hentes. Prøv igjen."); }); return () => { active = false; }; }, [playerId, dato]);
  const tid = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const select = (r: Rad) => { setValgt(r); setForm({ title: r.title, kind: r.kind, startDate: r.start.date, endDate: r.end.date, start: tid(r.start.minute), end: tid(r.end.minute), recurring: r.recurring ?? "NONE", isPrivate: r.isPrivate, note: r.note ?? "" }); };
  const done = async () => { router.refresh(); onLagret?.(); await load(); setValgt(null); setForm(f => ({ ...f, title: "", note: "" })); };
  const save = () => start(async () => {
    const minutes = (value: string) => { if (!/^\d{2}:\d{2}$/.test(value)) return NaN; const [h, m] = value.split(":").map(Number); return h * 60 + m; };
    const input: HendelseInput = { playerId, ...(valgt ? { id: valgt.id, expectedUpdatedAt: valgt.updatedAt } : {}), title: form.title, kind: form.kind as HendelseInput["kind"], startDate: form.startDate, endDate: form.endDate,
      startMinute: minutes(form.start), endMinute: minutes(form.end), recurring: form.recurring as HendelseInput["recurring"], isPrivate: form.isPrivate, note: form.note.trim() || null };
    try { const r = await lagreWorkbenchHendelse(input); if (!r.ok) setError(r.error); else { setError(null); await done(); } } catch { setError("Lagringen feilet. Inndataene er bevart."); }
  });
  const input = (key: keyof typeof form, label: string, type = "text") => <label className="ws-field">{label}<input type={type} value={String(form[key])} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></label>;
  return <Ark open title="Hendelser i kalenderen" kicker="Workbench · Uke" onClose={onLukk} footer={<Knapp variant="ghost" fullWidth onClick={onLukk}>Lukk</Knapp>}>
    {error && <InlineVarsel tone="warn">{error}</InlineVarsel>}
    <p className="a9-tekst">Skole, reise og samling gir kontekst. Overlapp sperrer ikke automatisk planlegging. Klokkeslett gjelder Oslo.</p>
    {rows.length === 0 ? <p>Ingen personlige hendelser i dette tidsrommet.</p> : <ul>{rows.map(r => <li key={r.id}>{r.title} · {r.start.date} {tid(r.start.minute)} {r.recurring === "WEEKLY" ? "· Ukentlig" : ""}{r.editable && <Knapp variant="ghost" disabled={pending} onClick={() => select(r)}>Rediger</Knapp>}</li>)}</ul>}
    {editable && <div className="a9-skjema">{input("title", "Navn")}<label className="ws-field">Type<select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}>{[["SKOLE", "Skole"], ["REISE", "Reise"], ["SAMLING", "Treningssamling"], ["HELDAGSSAMLING", "Heldagssamling"], ["TEST", "Test"], ["AVTALE", "Avtale"], ["ANNET", "Annet"]].map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>
      <div className="a9-feltrad">{input("startDate", "Fra dato", "date")}{input("start", "Fra kl.", "time")}{input("endDate", "Til dato", "date")}{input("end", "Til kl.", "time")}</div>
      <label className="ws-field">Gjenta<select value={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.value }))}><option value="NONE">Én gang</option><option value="WEEKLY">Ukentlig</option></select></label>
      <label><input type="checkbox" checked={form.isPrivate} onChange={e => setForm(f => ({ ...f, isPrivate: e.target.checked }))} />Privat tittel og notat (andre ser bare opptatt tid)</label>{input("note", "Notat")}
      <Knapp disabled={pending || !form.title.trim()} onClick={save}>{pending ? "Lagrer …" : valgt ? "Lagre hendelse" : "Legg til hendelse"}</Knapp>
      {valgt && <><Knapp variant="ghost" disabled={pending} onClick={() => setValgt(null)}>Ny hendelse</Knapp><Knapp variant="ghost" disabled={pending} onClick={() => start(async () => { try { const r = await slettWorkbenchHendelse({ playerId, id: valgt.id, expectedUpdatedAt: valgt.updatedAt }); if (!r.ok) setError(r.error); else await done(); } catch { setError("Hendelsen kunne ikke slettes."); } })}>Slett hendelse</Knapp></>}
    </div>}
  </Ark>;
}
