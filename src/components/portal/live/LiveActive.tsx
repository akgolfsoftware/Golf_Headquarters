"use client";

/**
 * PH-05 Live aktiv — Precision Athletics, natt.
 * Tegningen ui_kits/playerhq/screens/PH-05.jsx ligger ikke i git.
 * Timer, rep-modell, pause, notater, offline-kø og fullføring beholdes.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, Pause, Play } from "lucide-react";
import type { LiveV2Session, LiveCoachPanelData } from "./types";
import { plannedVolumText } from "./types";
import { fysVisningsrader, lesFysRegistrering } from "@/lib/portal-live/fys-registrering";
import { DrillLogger } from "./DrillLogger";
import { LiveCoachPanel } from "./LiveCoachPanel";
import { useLiveSession } from "./use-live-session";
import "@/styles/precision-athletics.css";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { byggLagringsNokkel } from "@/lib/offline-queue/eier-scope";
import { sendOktNotatTilCoach } from "@/lib/portal-live/actions";
import { VoiceRangeRecorder } from "@/components/shared/VoiceRangeRecorder";
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

export function LiveActive({ data, coachPanel }: { data: LiveV2Session; coachPanel: LiveCoachPanelData }) {
  const eierId = useLokalDataEier();
  const live = useLiveSession(data, eierId);
  const [mode, setMode] = useState<"now" | "list" | "notes">("now");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const getNotesSnapshot = useCallback(
    () => noteSnapshot(eierId, data.sessionId),
    [data.sessionId, eierId],
  );
  const rawNotes = useSyncExternalStore(subscribeNotes, getNotesSnapshot, () => "[]");
  const notes = useMemo(() => readNotes(rawNotes), [rawNotes]);
  const [text, setText] = useState("");
  const [noteError, setNoteError] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const finishButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const noteInput = useRef<HTMLTextAreaElement>(null);
  const active = live.drills.find((d) => d.status === "active");
  const aktivFys = active?.pyramide === "FYS" ? lesFysRegistrering(active.logNotes) : null;
  const selected = live.drills.find((d) => d.id === selectedId) ?? active ?? live.drills[0];
  const completedCount = live.drills.filter((d) => d.status === "done").length;
  const ready = live.drills.length > 0 && completedCount === live.drills.length;
  const enabled = live.phase === "active";
  const finishing = live.phase === "finishing" || live.phase === "finished";
  const planned = Math.max(0, Math.round((Date.parse(data.endTimeISO) - Date.parse(data.scheduledAtISO)) / 60000)) || data.drills.reduce((sum, d) => sum + d.durationMinutes, 0);

  useEffect(() => {
    const node = dialog.current;
    if (confirm && node && !node.open) { node.showModal(); cancelButton.current?.focus(); }
    if (!confirm && node?.open) node.close();
  }, [confirm]);
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
    finishButton.current?.focus();
  };
  const addNote = () => {
    const value = text.trim();
    if (!value || !enabled) return;
    const next = [{ t: fmt(live.totalSec), tekst: value }, ...notes];
    const key = noteKey(eierId, data.sessionId);
    if (!key) { setNoteError(true); return; }
    try { sessionStorage.setItem(key, JSON.stringify(next)); }
    catch { setNoteError(true); return; }
    window.dispatchEvent(new Event("akhq-live-notes")); setText(""); setNoteError(false); noteInput.current?.focus();
  };

  const [showAddDrill, setShowAddDrill] = useState(false);
  const [newDrillName, setNewDrillName] = useState("");
  const [newDrillMinutes, setNewDrillMinutes] = useState(15);
  const [newDrillAkse, setNewDrillAkse] = useState<PyramidArea>("TEK");
  const [coachSendStatus, setCoachSendStatus] = useState<string | null>(null);

  const handleAddDrill = () => {
    const name = newDrillName.trim();
    if (!name) return;
    live.addDrill({
      name,
      durationMinutes: Math.max(1, newDrillMinutes),
      pyramide: newDrillAkse,
      plannedReps: 20,
    });
    setNewDrillName("");
    setShowAddDrill(false);
  };

  const handleSendNoteToCoach = async (notatTekst: string) => {
    setCoachSendStatus("Sender til coach …");
    try {
      const res = await sendOktNotatTilCoach({
        sessionId: data.sessionId,
        tekst: notatTekst,
        drillNavn: active?.name,
      });
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


  return <div className="pa-root ph05" data-theme="night" data-od-id="playerhq-live-active" data-phase={live.phase}>
    <header className="ph05-top">
      <h1 className="ph05-kicker">Live · {data.title}</h1>
      <button ref={finishButton} className="pa-btn pa-btn--secondary" disabled={!enabled} onClick={() => setConfirm(true)}>Avslutt</button>
    </header>
    <main className="ph05-main">
      <div className="ph05-status" role="status">
        {live.phase === "starting" ? "Klargjør økta …" : live.phase === "start-error" ? "Økta kunne ikke åpnes. Prøv igjen når du har nett." : live.phase === "finished" ? "Åpner oppsummeringen …" : live.saving === "local-error" ? "Kunne ikke lagre på denne enheten. Hold siden åpen og prøv igjen." : live.saving === "offline" ? "Uten nett. Registreringene venter på sending." : live.saving === "error" ? "Ikke sendt. Registreringene er lagret på denne enheten." : live.saving === "saving" ? "Lagrer registreringer …" : "Registreringene er lagret."}
        {live.phase === "start-error" && <button className="pa-btn pa-btn--ghost" onClick={live.retryStart}>Prøv å åpne igjen</button>}
        {enabled && ["error", "local-error"].includes(live.saving) && <button className="pa-btn pa-btn--ghost" onClick={live.retrySync}>Prøv lagring igjen</button>}
      </div>
      <div className="ph05-kolonner">
        <section aria-label="Økta nå" className="ph05-oversikt">
          <div className="ph05-klokke" data-testid="live-clock" aria-label={`${fmt(live.totalSec)} medgått tid`}>{fmt(live.totalSec)}</div>
          <div className="ph05-klokkemeta">
            <span>{live.paused ? "På pause" : "Medgått tid"}{planned > 0 ? ` · ${planned} min planlagt` : ""}</span>
            <button className="pa-btn pa-btn--ghost" disabled={!enabled} onClick={live.togglePause} aria-pressed={live.paused}>
              {live.paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}{live.paused ? "Fortsett" : "Pause"}
            </button>
          </div>
          <div className="pa-card ph05-na">
            <p className="ph05-kicker">{ready ? "Klar til fullføring" : active ? `Nå · øvelse ${active.index} av ${live.drills.length}` : "Økta di"}</p>
            <h2>{ready ? "Alle øvelsene er markert ferdige" : active?.name ?? "Ingen øvelser i planen"}</h2>
            {active && <>
              <p className="ph05-meta">{[active.durationMinutes > 0 ? `${active.durationMinutes} min` : null, plannedVolumText(active)].filter(Boolean).join(" · ")}</p>
              {active.pyramide === "FYS" ? <p className="ph05-brod">{aktivFys
                ? fysVisningsrader(aktivFys).map(rad => `${rad.label}: ${rad.verdi}`).join(" · ")
                : active.logNotes || "Ingen detaljer registrert"}</p> :
                <div className="ph05-tall"><strong>{active.repsTotal}</strong><span>{active.plannedReps > 0 ? `av ${active.plannedReps} reps` : "registrert"}{active.repsHit > 0 ? ` · ${active.repsHit} treff` : ""}</span></div>}
              {active.pyramide !== "FYS" && active.plannedReps > 0 && <progress aria-label="Registreringer i aktiv øvelse" max={active.plannedReps} value={Math.min(active.repsTotal, active.plannedReps)} />}
            </>}
            {!active && <p className="ph05-brod">{ready ? "Du kan rette registreringene eller avslutte når du er klar." : "Du kan bruke notater og Caddie, og avslutte økta når du er klar."}</p>}
            {ready && <button className="pa-btn pa-btn--primary pa-btn--lg pa-btn--full" disabled={!enabled} onClick={() => setConfirm(true)}>Avslutt og se oppsummering</button>}
          </div>
        </section>
        <section className="ph05-reg" aria-label="Registrering">
          <div className="ph05-modus" role="group" aria-label="Visning i økta">
            {([['now', 'Registrer'], ['list', 'Øvelser'], ['notes', 'Notater']] as const).map(([id, label]) => <button key={id} className="ph05-modusknapp" aria-pressed={mode === id} onClick={() => setMode(id)}>{label}{id === "list" && ` ${completedCount}/${live.drills.length}`}</button>)}
          </div>
          <div hidden={mode !== "now"}>
            {selected ? <>
              <label className="ph05-feltlabel" htmlFor="live-drill">Registrer på øvelse</label>
              <select className="ph05-velger" id="live-drill" value={selected.id} disabled={!enabled} onChange={(event) => setSelectedId(event.target.value)}>{live.drills.map((d) => <option key={d.id} value={d.id}>{d.index}. {d.name}{d.status === "done" ? " · ferdig" : ""}</option>)}</select>
              <fieldset className="ph05-felt" disabled={!enabled}>
                {live.drills.map((d) => <div key={d.id} hidden={d.id !== selected.id}>
                  <DrillLogger drill={d} state={d} onChange={(value) => live.change(d.id, value)} onAdjust={(bucket, delta) => live.adjust(d.id, bucket, delta)} onComplete={() => { live.mark(d.id, d.status !== "done"); setSelectedId(null); }} done={d.status === "done"} />
                </div>)}
              </fieldset>
              <div className="ph05-tale">
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
                    const ny: LiveNotat = {
                      t: fmt(live.totalSec),
                      tekst: `[Tale] ${obs.club ?? ""}${obs.position ? ` · ${obs.position}` : ""}: ${obs.rawTranscript}`.trim(),
                    };
                    const updated = [ny, ...notes];
                    const key = noteKey(eierId, data.sessionId);
                    if (key) {
                      try {
                        sessionStorage.setItem(key, JSON.stringify(updated));
                        window.dispatchEvent(new Event("akhq-live-notes"));
                      } catch {}
                    }
                  }}
                />
              </div>
            </> : <p className="ph05-brod">Det er ingen øvelser å registrere på.</p>}
          </div>
          {(active?.description || active?.notes || data.maalsetning || data.coachComment) && <details className="ph05-kontekst"><summary>Øvelsen og coachens beskjed</summary>{active?.description && <p>{active.description}</p>}{active?.notes && active.notes !== active.description && <p>{active.notes}</p>}{data.maalsetning && <p>{data.maalsetning}</p>}{data.coachComment && <p>{data.coachComment}</p>}</details>}
          <div hidden={mode !== "list"}>
            <ol className="ph05-ovelser">
              {live.drills.map((d) => <li key={d.id} className="ph05-ovelse">
                <button className="ph05-sjekk" aria-label={`${d.status === "done" ? "Fjern ferdigmarkering for" : "Marker ferdig"} ${d.name}`} aria-pressed={d.status === "done"} disabled={!enabled} onClick={() => live.mark(d.id, d.status !== "done")}>{d.status === "done" ? <Check size={20} aria-hidden /> : d.index}</button>
                <div><h3>{d.name}</h3><p className="ph05-meta">{d.repsTotal} registrert{d.status === "active" ? " · pågår" : d.status === "done" ? " · ferdig" : ""}</p></div>
                <div className="ph05-handlinger">
                  <button className="pa-btn pa-btn--ghost" onClick={() => { setSelectedId(d.id); setMode("now"); }}>Registrer<span className="ph05-skjult"> på {d.name}</span></button>
                  {d.status !== "done" && live.drills.length > 1 && (
                    <button
                      className="pa-btn pa-btn--ghost"
                      title="Fjern øvelse fra denne økta"
                      onClick={() => live.removeDrill(d.id)}
                    >
                      Fjern
                    </button>
                  )}
                </div>
              </li>)}
            </ol>
            <div className="ph05-leggtil">
              {!showAddDrill ? (
                <button
                  className="pa-btn pa-btn--secondary pa-btn--full"
                  disabled={!enabled}
                  onClick={() => setShowAddDrill(true)}
                >
                  + Legg til øvelse underveis
                </button>
              ) : (
                <div className="ph05-ny">
                  <label className="ph05-feltlabel" htmlFor="new-drill-name">Navn på ny øvelse</label>
                  <input
                    id="new-drill-name"
                    className="ph05-input"
                    type="text"
                    value={newDrillName}
                    onChange={(e) => setNewDrillName(e.target.value)}
                    placeholder="f.eks. Putting 3 meter, Wedges 60m"
                  />
                  <div className="ph05-rad">
                    <label className="ph05-feltlabel" htmlFor="new-drill-min">Varighet (min):</label>
                    <input
                      id="new-drill-min"
                      className="ph05-input ph05-input--kort"
                      type="number"
                      min={1}
                      max={120}
                      value={newDrillMinutes}
                      onChange={(e) => setNewDrillMinutes(Number(e.target.value))}
                    />
                  </div>
                  <div className="ph05-akser">
                    {(["TEK", "SLAG", "SPILL", "FYS", "TURN"] as const).map((a) => (
                      <button
                        key={a}
                        type="button"
                        className="ph05-akse"
                        data-akse={a}
                        aria-pressed={newDrillAkse === a}
                        onClick={() => setNewDrillAkse(a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <div className="ph05-rad ph05-rad--slutt">
                    <button className="pa-btn pa-btn--ghost" onClick={() => setShowAddDrill(false)}>Avbryt</button>
                    <button className="pa-btn pa-btn--primary" disabled={!newDrillName.trim()} onClick={handleAddDrill}>Legg til</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div hidden={mode !== "notes"} className="ph05-notater">
            <div className="ph05-tale">
              <VoiceRangeRecorder
                sessionId={data.sessionId}
                onMemoSaved={(obs) => {
                  const ny: LiveNotat = {
                    t: fmt(live.totalSec),
                    tekst: `[Tale] ${obs.club ?? ""}${obs.position ? ` · ${obs.position}` : ""}: ${obs.rawTranscript}`.trim(),
                  };
                  const updated = [ny, ...notes];
                  const key = noteKey(eierId, data.sessionId);
                  if (key) {
                    try {
                      sessionStorage.setItem(key, JSON.stringify(updated));
                      window.dispatchEvent(new Event("akhq-live-notes"));
                    } catch {}
                  }
                }}
              />
            </div>
            <label className="ph05-feltlabel" htmlFor="live-note">Skriv eller rediger notat</label>
            <textarea id="live-note" ref={noteInput} rows={4} value={text} disabled={!enabled} onChange={(event) => setText(event.target.value)} placeholder="Hva vil du huske?" />
            <button className="pa-btn pa-btn--primary pa-btn--lg pa-btn--full" disabled={!enabled || !text.trim()} onClick={addNote}>Legg til notat</button>
            <p className="ph05-meta">Notatene beholdes i denne fanen og følger med til oppsummeringen.</p>
            {noteError && <p className="ph05-feil" role="alert">Notatet kunne ikke lagres. Teksten står igjen; prøv på nytt.</p>}
            {coachSendStatus && <p className="ph05-meta" role="status">{coachSendStatus}</p>}
            {notes.length === 0 ? <p className="ph05-brod">Ingen notater ennå.</p> : <ol className="ph05-notatliste">{notes.map((note, index) => <li key={`${note.t}-${index}`}>
              <time>{note.t}</time>
              <p>{note.tekst}</p>
              <button
                className="pa-btn pa-btn--ghost"
                onClick={() => handleSendNoteToCoach(note.tekst)}
              >
                Send notat til trenerens innboks
              </button>
            </li>)}</ol>}
          </div>
        </section>
      </div>
    </main>
    <LiveCoachPanel data={coachPanel} activeDrillId={active?.id} />
    <dialog ref={dialog} className="ph05-dialog" tabIndex={-1} onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const target = event.shiftKey ? buttons.at(-1) : buttons[0];
      if (!buttons.length || (event.shiftKey ? document.activeElement === buttons[0] : document.activeElement === buttons.at(-1))) { event.preventDefault(); (target ?? event.currentTarget).focus(); }
    }} aria-labelledby="live-finish-title" onCancel={(event) => { event.preventDefault(); close(); }} onClose={() => { if (!finishing) setConfirm(false); }}>
      <h2 id="live-finish-title">Avslutte økta?</h2>
      <p>{completedCount} av {live.drills.length} øvelser markert ferdige. Registreringene lagres før oppsummeringen åpnes.</p>
      {text.trim() && <p>Du har et notat som ikke er lagt til. Fortsett økta for å ta det med.</p>}
      {live.phase === "finish-error" && <p className="ph05-feil" role="alert">Fullføringen ble ikke bekreftet. Hold siden åpen. Prøv igjen når du har nett, eller fortsett økta.</p>}
      <button className="pa-btn pa-btn--primary pa-btn--lg pa-btn--full" disabled={finishing} onClick={() => { void live.finish(); }}>{finishing ? "Lagrer og fullfører …" : live.phase === "finish-error" ? "Prøv fullføring igjen" : "Avslutt og logg økta"}</button>
      <button ref={cancelButton} className="pa-btn pa-btn--ghost" disabled={finishing} onClick={close}>Fortsett økta</button>
    </dialog>
  </div>;
}
