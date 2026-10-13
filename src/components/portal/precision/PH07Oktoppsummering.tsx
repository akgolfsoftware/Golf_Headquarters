"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AkseMerke, Knapp, Tall } from "@/components/precision/pa";
import { MicButton } from "@/components/shared/mic-button";
import { type OktoppsummeringData, formatTimerOgMinutter } from "@/lib/portal-live/ph04-07-data";
import { lagreLiveOppsummering } from "@/lib/portal-live/session-actions";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { clearSavedSummaryDraft, readSummaryDraft, writeSummaryDraft } from "@/lib/offline-queue/summary-draft-store";
import "@/styles/precision-athletics.css";
import "@/styles/precision-live.css";

type Resultat = { ok: true } | { ok: false; error: string };
interface PH07OktoppsummeringProps {
  data: OktoppsummeringData;
  onSave?: (note: string, shareWithCoach: boolean) => Promise<Resultat | void> | Resultat | void;
  onCloseHref?: string;
}

export function PH07Oktoppsummering({ data, onSave, onCloseHref = "/portal" }: PH07OktoppsummeringProps) {
  const [note, setNote] = useState(data.note ?? "");
  const [share, setShare] = useState(data.shareWithCoach ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [localFeedback, setLocalFeedback] = useState("");
  const [draftReady, setDraftReady] = useState(!data.eierUserId);
  const ownerId = useLokalDataEier();
  const draftToken = useRef<string | null>(null);
  const draftValue = useRef({ note: data.note ?? "", share: data.shareWithCoach ?? false });
  const localWrites = useRef<Promise<void>>(Promise.resolve());
  const changeNumber = useRef(0);
  const canEdit = draftReady && (!data.eierUserId || ownerId === data.eierUserId);
  useEffect(() => {
    if (!data.eierUserId || ownerId !== data.eierUserId) return;
    let active = true;
    readSummaryDraft(ownerId, data.sessionId).then(draft => {
      if (!active) return;
      draftToken.current = draft?.token ?? null;
      if (draft) {
        draftValue.current = { note: draft.note, share: draft.shareWithCoach };
        setNote(draft.note); setShare(draft.shareWithCoach);
        setLocalFeedback("Privat utkast gjenåpnet fra denne enheten. Det er ikke sendt eller delt.");
      }
    }).catch(() => { if (active) setLocalFeedback("Lokal lagring er ikke tilgjengelig. Behold siden åpen frem til lagring er bekreftet."); })
      .finally(() => { if (active) setDraftReady(true); });
    return () => { active = false; };
  }, [data.eierUserId, data.sessionId, ownerId]);
  const changeDraft = (nextNote: string, nextShare: boolean) => {
    setNote(nextNote); setShare(nextShare); setSaved(false); setFeedback("");
    draftValue.current = { note: nextNote, share: nextShare };
    const change = ++changeNumber.current;
    if (!data.eierUserId || ownerId !== data.eierUserId) return;
    setLocalFeedback("Lagrer privat utkast på enheten …");
    localWrites.current = localWrites.current.then(async () => {
      try {
        const draft = await writeSummaryDraft(ownerId, data.sessionId, draftToken.current, nextNote, nextShare);
        draftToken.current = draft.token;
        if (change === changeNumber.current) setLocalFeedback("Privat utkast lagret på denne enheten. Det er ikke sendt eller delt.");
      } catch (error) { if (change === changeNumber.current) setLocalFeedback(error instanceof Error ? error.message : "Utkastet kunne ikke lagres. Behold siden åpen."); }
    });
  };
  const sending = useRef(false);
  const scale = Math.max(1, ...data.axes.flatMap((a) => [a.actualMin ?? 0, a.plannedMin]));
  const save = async () => {
    if (sending.current || !canEdit) return;
    sending.current = true; setSaving(true); setFeedback("");
    try {
      await localWrites.current;
      const result = onSave ? await onSave(note, share) : await lagreLiveOppsummering(data.sessionId, { note, shareWithCoach: share });
      if (!result?.ok) { setFeedback(result && !result.ok ? result.error : "Lagringen er ikke bekreftet. Prøv igjen."); return; }
      setSaved(true);
      if (ownerId && ownerId === data.eierUserId) {
        await clearSavedSummaryDraft(ownerId, data.sessionId, note, share).catch(() => undefined);
        draftToken.current = null; setLocalFeedback("");
      }
      setFeedback(share ? "Kommentaren er lagret og delt med coach." : "Kommentaren er lagret privat.");
    } catch { setFeedback("Kommentaren ble ikke lagret. Teksten er beholdt her; prøv igjen."); }
    finally { sending.current = false; setSaving(false); }
  };
  return <div className="pa-root pa-live ph07" data-theme="night" data-design="precision-athletics">
    <header className="pa-live__top"><Link href={onCloseHref} className="pa-iconbtn" aria-label="Til I dag"><ArrowLeft size={20} /></Link><span className="pa-live__context">Oppsummering</span></header>
    <main className="pa-live__main pa-live__main--summary">
      <div><p className="pa-live__source">{data.dateStr}{data.timeRangeStr ? " · " + data.timeRangeStr : ""}</p><h1>{data.title}</h1><p className="pa-live__instruction">Dette er registreringene fra økta.</p></div>
      <dl className="pa-live__summary">
        <div><dt>Slag og putter</dt><dd>{data.totalShots}</dd></div>
        <div><dt>Registrert tid</dt><dd>{data.actualMinutes == null ? "—" : formatTimerOgMinutter(data.actualMinutes)}</dd><p className="pa-live__help">{data.plannedMinutes > 0 ? "Planlagt " + formatTimerOgMinutter(data.plannedMinutes) : "Ingen planlagt varighet"}</p></div>
        <div><dt>Øvelser fullført</dt><dd>{data.completedDrillsCount} av {data.totalDrillsCount}</dd></div>
        {data.dagsform && <div><dt>Dagsform</dt><dd>{data.dagsform}</dd></div>}
      </dl>
      {data.drillRows.length > 0 ? <section className="pa-live__rows" aria-label="Registrering per øvelse">
        {data.drillRows.map((r) => <article key={r.id}><div><h3>{r.name}</h3><div className="pa-live__row-values"><span>Mengde: {r.quantityText}</span><span>Tid: {r.timeText}</span><span>Treff: {r.hitsText}</span></div></div></article>)}
      </section> : <section><h2>Ingen registreringer</h2><p>Økta har ingen lagrede øvelseslogger. Manglende målinger vises ikke som gjennomført arbeid.</p></section>}
      <details className="pa-live__notes"><summary>Planlagt og registrert per akse</summary><div className="pa-live__note-body">
        {data.axes.map((a) => <div key={a.axis} className="pa-live__axis-row"><AkseMerke axis={a.axis} /><progress max={scale} value={a.actualMin ?? 0} aria-label={a.axis.toUpperCase() + " registrerte minutter"} /><Tall>{a.actualMin == null ? "—" : a.actualMin} min</Tall><span className="pa-live__help" style={{ gridColumn: "2 / -1" }}>Planlagt {a.plannedMin} min{a.actualMin == null ? " · registrert tid er ukjent" : ""}</span></div>)}
      </div></details>
      <section className="pa-live__note-body" aria-labelledby="ph07-comment-title">
        <div className="pa-live__fieldhead"><label id="ph07-comment-title" htmlFor="ph07-note">Din kommentar</label><MicButton variant="suffix" disabled={saving || !canEdit} onResult={(text) => changeDraft((draftValue.current.note ? draftValue.current.note + " " : "") + text, draftValue.current.share)} /></div>
        <textarea id="ph07-note" value={note} maxLength={2000} rows={3} disabled={saving || !canEdit} onChange={(e) => changeDraft(e.target.value, share)} placeholder="Hva merket du i økta?" />
        <label className="pa-live__share" htmlFor="ph07-share"><input id="ph07-share" type="checkbox" checked={share} disabled={saving || !canEdit} onChange={(e) => changeDraft(note, e.target.checked)} /><span>Del denne kommentaren med coach</span></label>
        <p className="pa-live__help">Se gjennom teksten før du lagrer. Delingsvalget gjelder denne kommentaren.</p>
        <p role={saved ? "status" : "alert"} className="pa-live__status">{feedback}</p>
        <p role="status" className="pa-live__help">{canEdit ? localFeedback : "Henter privat kommentarutkast …"}</p>
      </section>
    </main>
    <footer className="pa-live__footer"><div>{saved ? <Link href={onCloseHref} className="pa-btn pa-btn--primary pa-btn--xl pa-btn--full">Til I dag</Link> : <Knapp fullWidth size="xl" disabled={!canEdit} loading={saving} loadingText="Lagrer …" onClick={() => void save()}>Lagre kommentar</Knapp>}</div></footer>
  </div>;
}
