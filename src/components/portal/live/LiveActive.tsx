"use client";

/** PH-05 Live-økt: aktiv, i Precision Athletics (natt). Selve skjermen er PH05LiveAktiv;
 * denne komponenten eier økt-hooken (klokke, tellere, lagring, offline), notater, tale,
 * skjermlås og avslutt-flyten. Tegning: Claude Design 7d7c2994, PH-live.jsx (PH-05). */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { LiveV2Session, LiveCoachPanelData } from "./types";
import { plannedVolumText } from "./types";
import { DrillLogger } from "./DrillLogger";
import { LiveCoachPanel } from "./LiveCoachPanel";
import { useLiveSession } from "./use-live-session";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { byggLagringsNokkel } from "@/lib/offline-queue/eier-scope";
import { sendOktNotatTilCoach } from "@/lib/portal-live/actions";
import { VoiceRangeRecorder } from "@/components/shared/VoiceRangeRecorder";
import { PH05LiveAktiv, type PH05Drill } from "@/components/portal/precision/PH05LiveAktiv";
import { Knapp, Meta, type Akse } from "@/components/precision/pa";
import type { RepBucket } from "@/lib/portal-live/live-state";
import type { PyramidArea } from "@/generated/prisma/enums";

type LiveNotat = { t: string; tekst: string };
const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
const noteKey = (eierId: string | null, id: string) =>
  byggLagringsNokkel(`akhq-live-notater-${id}`, eierId);
const subscribeNotes = (listener: () => void) => {
  window.addEventListener("storage", listener); window.addEventListener("akhq-live-notes", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("akhq-live-notes", listener); };
};
function noteSnapshot(eierId: string | null, id: string) {
  const key = noteKey(eierId, id);
  if (!key) return "[]";
  try { return sessionStorage.getItem(key) ?? "[]"; } catch { return "[]"; }
}
function readNotes(raw: string): LiveNotat[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((n): n is LiveNotat => !!n && typeof n.t === "string" && typeof n.tekst === "string") : [];
  } catch { return []; }
}

const AKSE: Record<PyramidArea, Akse> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const TELLERE: [RepBucket, string][] = [["repsWithoutBall", "Uten ball"], ["repsLowSpeed", "Lav hastighet"], ["repsAutomatic", "Automatikk"], ["repsHit", "Treff"]];
const felt = { width: "100%", boxSizing: "border-box", minHeight: 44, padding: "8px 12px", border: "1px solid var(--border-control)", background: "var(--surface-card)", color: "var(--text-primary)", borderRadius: "var(--radius)", font: "var(--type-body)" } as const;
const etikett = { font: "var(--type-label)", color: "var(--text-primary)" } as const;
const sammendrag = { minHeight: 56, display: "flex", alignItems: "center", padding: "0 16px", cursor: "pointer", font: "var(--type-label)", color: "var(--text-primary)" } as const;

export function LiveActive({ data, coachPanel }: { data: LiveV2Session; coachPanel: LiveCoachPanelData }) {
  const eierId = useLokalDataEier();
  const live = useLiveSession(data, eierId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const hoppet = live.drills.filter((d) => d.skipped).map((d) => d.id);
  const [kvittering, setKvittering] = useState<{ navn: string; tid: string; planTid: string; fikk: number; plan: number | null } | null>(null);
  const getNotesSnapshot = useCallback(
    () => noteSnapshot(eierId, data.sessionId),
    [data.sessionId, eierId],
  );
  const rawNotes = useSyncExternalStore(subscribeNotes, getNotesSnapshot, () => "[]");
  const notes = useMemo(() => readNotes(rawNotes), [rawNotes]);
  const [text, setText] = useState("");
  const [noteError, setNoteError] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const noteInput = useRef<HTMLTextAreaElement>(null);
  const active = live.drills.find((d) => d.status === "active");
  const selected = live.drills.find((d) => d.id === selectedId) ?? active ?? live.drills[0];
  const valgt = Math.max(0, live.drills.findIndex((d) => d.id === selected?.id));
  const completedCount = live.drills.filter((d) => d.status === "done").length;
  const enabled = live.phase === "active";
  const finishing = live.phase === "finishing" || live.phase === "finished";
  const planned = Math.max(0, Math.round((Date.parse(data.endTimeISO) - Date.parse(data.scheduledAtISO)) / 60000)) || data.drills.reduce((sum, d) => sum + d.durationMinutes, 0);
  const totalReps = live.drills.reduce((sum, d) => sum + d.repsTotal, 0);

  useEffect(() => {
    if (!enabled || live.paused) return;
    let disposed = false;
    let sentinel: WakeLockSentinel | null = null;
    let pending = false;
    const acquire = async () => {
      if (disposed || pending || (sentinel && !sentinel.released) || document.visibilityState !== "visible") return;
      pending = true;
      try {
        const lock = await navigator.wakeLock?.request("screen");
        if (disposed) await lock?.release(); else sentinel = lock ?? null;
      } catch { /* Skjermen kan fortsatt brukes uten wake lock. */ }
      finally { pending = false; }
    };
    void acquire(); document.addEventListener("visibilitychange", acquire);
    return () => { disposed = true; document.removeEventListener("visibilitychange", acquire); void sentinel?.release().catch(() => {}); };
  }, [enabled, live.paused]);

  const close = () => {
    if (finishing) return;
    setConfirm(false);
    if (live.phase === "finish-error") live.resumeAfterError();
  };
  const lagreNotater = (next: LiveNotat[]) => {
    const key = noteKey(eierId, data.sessionId);
    if (!key) return false;
    try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { return false; }
    window.dispatchEvent(new Event("akhq-live-notes"));
    return true;
  };
  const addNote = () => {
    const value = text.trim();
    if (!value || !enabled) return;
    if (!lagreNotater([{ t: fmt(live.totalSec), tekst: value }, ...notes])) { setNoteError(true); return; }
    setText(""); setNoteError(false); noteInput.current?.focus();
  };

  const [showAddDrill, setShowAddDrill] = useState(false);
  const [newDrillName, setNewDrillName] = useState("");
  const [newDrillMinutes, setNewDrillMinutes] = useState(15);
  const [newDrillAkse, setNewDrillAkse] = useState<PyramidArea>("TEK");
  const [coachSendStatus, setCoachSendStatus] = useState<string | null>(null);

  const [editError, setEditError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const addRequest = useRef<string | null>(null);
  const handleAddDrill = async () => {
    const name = newDrillName.trim();
    if (!name || editing) return;
    setEditing(true); setEditError(null);
    addRequest.current ??= crypto.randomUUID();
    try {
      await live.addDrill({ requestId: addRequest.current, name, durationMinutes: newDrillMinutes, pyramide: newDrillAkse, plannedReps: 20 });
      setNewDrillName(""); setShowAddDrill(false); addRequest.current = null;
    } catch { setEditError("Øvelsen kunne ikke lagres. Kontroller navn, varighet og nettforbindelse, og prøv igjen."); }
    finally { setEditing(false); }
  };

  const handleSendNoteToCoach = async (notatTekst: string) => {
    setCoachSendStatus("Sender til coach …");
    try {
      const res = await sendOktNotatTilCoach({ sessionId: data.sessionId, tekst: notatTekst, drillNavn: active?.name });
      if (res.ok) {
        setCoachSendStatus("Sendt til coach");
        setTimeout(() => setCoachSendStatus(null), 3000);
      } else {
        setCoachSendStatus(res.error ?? "Kunne ikke sende");
      }
    } catch {
      setCoachSendStatus("Sending feilet");
    }
  };

  /** Neste drill som verken er ferdig eller hoppet over, fra og med etter `fra`. */
  const nesteApne = (fra: number, ferdige: string[], hopp: string[]) => {
    const n = live.drills.length;
    for (let i = 1; i < n; i++) {
      const d = live.drills[(fra + i) % n];
      if (d && d.status !== "done" && !ferdige.includes(d.id) && !hopp.includes(d.id)) return d;
    }
    return undefined;
  };
  const ferdigMedDrill = () => {
    if (!selected || !enabled) return;
    const sek = selected.status === "active" ? live.drillSec : selected.actualDurationSec ?? 0;
    setKvittering({
      navn: selected.name, tid: fmt(sek), planTid: fmt(selected.durationMinutes * 60),
      fikk: selected.repsTotal, plan: selected.plannedReps > 0 ? selected.plannedReps : null,
    });
    live.mark(selected.id, true);
    const neste = nesteApne(valgt, [selected.id], hoppet);
    if (!neste) { setConfirm(true); return; }
    setSelectedId(neste.id);
  };
  const hoppOver = (id: string) => {
    const hopp = [...hoppet, id];
    live.skip(id);
    if (id === selected?.id) {
      const neste = nesteApne(valgt, [], hopp);
      if (neste) setSelectedId(neste.id);
    }
  };

  const drills: PH05Drill[] = live.drills.map((d) => ({
    id: d.id, akse: AKSE[d.pyramide], navn: d.name, beskrivelse: d.description ?? d.notes,
    arkMeta: d.status === "active" ? "PÅGÅR" : [d.plannedReps > 0 ? `${d.plannedReps} REPS` : null, d.durationMinutes > 0 ? `${d.durationMinutes} MIN` : null].filter(Boolean).join(" · ") || "—",
    ferdig: d.status === "done", hoppet: hoppet.includes(d.id) && d.status !== "done", fys: d.pyramide === "FYS",
  }));
  const status = live.phase === "finished" ? "Åpner oppsummeringen …"
    : live.saving === "local-error" ? "Kunne ikke lagre på denne enheten. Hold siden åpen og prøv igjen."
    : live.saving === "offline" ? "Uten nett. Registreringene venter på sending."
    : live.saving === "error" ? "Ikke sendt. Registreringene er lagret på denne enheten."
    : live.saving === "saving" ? "Lagrer registreringer …" : null;
  const kanProveLagring = enabled && (live.saving === "error" || live.saving === "local-error");
  const tilstand = live.phase === "starting" ? "laster" : live.phase === "start-error" ? "feil" : totalReps === 0 && completedCount === 0 ? "tom" : "data";
  const volum = selected ? plannedVolumText(selected) : null;

  const ekstra = <>
    {(selected?.notes || data.maalsetning || data.coachComment || volum) && <details className="pa-card">
      <summary style={sammendrag}>Øvelsen og coachens beskjed</summary>
      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8, font: "var(--type-body)", color: "var(--text-body)", overflowWrap: "anywhere" }}>
        {volum && <p style={{ margin: 0 }}>Planlagt: {volum}</p>}
        {selected?.notes && selected.notes !== selected.description && <p style={{ margin: 0 }}>{selected.notes}</p>}
        {data.maalsetning && <p style={{ margin: 0 }}>{data.maalsetning}</p>}
        {data.coachComment && <p style={{ margin: 0 }}>{data.coachComment}</p>}
      </div>
    </details>}
    <details className="pa-card">
      <summary style={sammendrag}>Notater{notes.length > 0 ? ` (${notes.length})` : ""}</summary>
      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        <VoiceRangeRecorder
          sessionId={data.sessionId}
          compact
          onMemoSaved={(obs) => {
            if (obs.suggestedReps && active) {
              const r = obs.suggestedReps;
              if (r.dry > 0) live.adjust(active.id, "repsWithoutBall", r.dry);
              if (r.lav > 0) live.adjust(active.id, "repsLowSpeed", r.lav);
              if (r.full > 0) live.adjust(active.id, "repsAutomatic", r.full);
            }
            lagreNotater([{ t: fmt(live.totalSec), tekst: `[Tale] ${obs.club ?? ""}${obs.position ? ` · ${obs.position}` : ""}: ${obs.rawTranscript}`.trim() }, ...notes]);
          }}
        />
        <label htmlFor="live-note" style={etikett}>Skriv eller rediger notat</label>
        <textarea id="live-note" ref={noteInput} rows={4} value={text} disabled={!enabled} onChange={(event) => setText(event.target.value)} placeholder="Hva vil du huske?" style={{ ...felt, resize: "vertical" }} />
        <Knapp variant="secondary" disabled={!enabled || !text.trim()} onClick={addNote}>Legg til notat</Knapp>
        <Meta>NOTATENE BEHOLDES I DENNE FANEN OG FØLGER MED TIL OPPSUMMERINGEN</Meta>
        {noteError && <p role="alert" style={{ margin: 0, color: "var(--text-primary)" }}>Notatet kunne ikke lagres. Teksten står igjen; prøv på nytt.</p>}
        {coachSendStatus && <p role="status" style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-primary)" }}>{coachSendStatus}</p>}
        {notes.length === 0 ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen notater ennå.</p> : <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>{notes.map((note, index) => <li key={`${note.t}-${index}`} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 0", borderTop: "1px solid var(--border-hairline)", minWidth: 0 }}>
          <Meta>{note.t}</Meta>
          <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{note.tekst}</p>
          <div><Knapp variant="ghost" onClick={() => handleSendNoteToCoach(note.tekst)}>Send notat til trenerens innboks</Knapp></div>
        </li>)}</ol>}
      </div>
    </details>
  </>;

  const leggTil = <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
    {editError && <p role="alert">{editError}</p>}
    {!showAddDrill
      ? <Knapp variant="secondary" fullWidth disabled={!enabled} onClick={() => setShowAddDrill(true)}>Legg til drill underveis</Knapp>
      : <>
        <label htmlFor="new-drill-name" style={etikett}>Navn på ny drill</label>
        <input id="new-drill-name" type="text" value={newDrillName} onChange={(e) => setNewDrillName(e.target.value)} placeholder="f.eks. Putting 3 meter, Wedges 60m" style={felt} />
        <label htmlFor="new-drill-min" style={etikett}>Varighet (min)</label>
        <input id="new-drill-min" type="number" min={1} max={120} value={newDrillMinutes} onChange={(e) => setNewDrillMinutes(Number(e.target.value))} style={{ ...felt, width: 96 }} />
        <div role="group" aria-label="Akse" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["TEK", "SLAG", "SPILL", "FYS", "TURN"] as const).map((a) => <Knapp key={a} variant={newDrillAkse === a ? "primary" : "secondary"} aria-pressed={newDrillAkse === a} onClick={() => setNewDrillAkse(a)}>{a}</Knapp>)}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Knapp variant="ghost" onClick={() => setShowAddDrill(false)}>Avbryt</Knapp>
          <Knapp disabled={editing || !newDrillName.trim()} onClick={handleAddDrill}>Legg til</Knapp>
        </div>
      </>}
  </div>;

  return <>
    <PH05LiveAktiv
      tilstand={tilstand}
      klokke={fmt(live.totalSec)}
      pauset={live.paused}
      planlagtMin={planned > 0 ? planned : null}
      drills={drills}
      valgt={valgt}
      drillKlokke={selected ? (selected.status === "active" ? fmt(live.drillSec) : selected.actualDurationSec != null ? fmt(selected.actualDurationSec) : "—") : "—"}
      drillPlan={selected && selected.durationMinutes > 0 ? `AV ${selected.durationMinutes}:00` : "—"}
      totalt={selected?.repsTotal ?? 0}
      planlagtTotalt={selected && selected.plannedReps > 0 ? selected.plannedReps : null}
      tellere={selected ? TELLERE.map(([bucket, label]) => ({ id: bucket, label, verdi: selected[bucket], onEndre: (n: number) => live.adjust(selected.id, bucket, n) })) : []}
      kvittering={kvittering}
      status={status}
      statusHandling={kanProveLagring ? { label: "Prøv lagring igjen", onClick: live.retrySync } : undefined}
      feilKode="FEIL · START AV ØKT"
      onProv={live.retryStart}
      kanRegistrere={enabled && !editing}
      slagtellerHref={`/portal/live/${data.sessionId}/tapper`}
      onPause={live.togglePause}
      onAvslutt={() => setConfirm(true)}
      onVelg={(i) => { const d = live.drills[i]; if (d) { live.select(d.id); setSelectedId(d.id); } }}
      onFerdig={ferdigMedDrill}
      onHopp={hoppOver}
      onFjern={async (id) => {
        if (editing) return;
        setEditing(true); setEditError(null);
        try { await live.removeDrill(id); }
        catch { setEditError("Øvelsen kunne ikke fjernes. Øvelser med registrert tid eller resultater må beholdes; bruk hopp over. Kontroller også nettforbindelsen."); }
        finally { setEditing(false); }
      }}
      fullforer={finishing}
      dialog={{ open: confirm, ferdige: completedCount, totalt: live.drills.length, lagrer: finishing, feil: live.phase === "finish-error", notatVarsel: !!text.trim(), onFortsett: close, onBekreft: () => { void live.finish(); } }}
      arkEkstra={leggTil}
      fysInnhold={selected && selected.pyramide === "FYS"
        ? <DrillLogger drill={selected} state={selected} onChange={(value) => live.change(selected.id, value)} onAdjust={(bucket, delta) => live.adjust(selected.id, bucket, delta)} onComplete={() => { live.mark(selected.id, selected.status !== "done"); setSelectedId(null); }} done={selected.status === "done"} />
        : undefined}
      ekstra={ekstra}
    />
    <LiveCoachPanel data={coachPanel} activeDrillId={active?.id} bunnLoft={104} />
  </>;
}
