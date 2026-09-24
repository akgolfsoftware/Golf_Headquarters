"use client";

/** PH-05 Live + B2 iPad/Mac fra valgt Trainlock ZIP (4), med v3-tema.
 * Faktiske rep-kategorier beholdes; Treff/Kant/Bom krever egne produktfelt.
 * Kontroll og åpne avvik: docs/design-audit/portering-fire-flater-2026-09-10.md. */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, Pause, Play } from "lucide-react";
import type { LiveV2Session, LiveCoachPanelData } from "./types";
import { plannedVolumText } from "./types";
import { fysVisningsrader, lesFysRegistrering } from "@/lib/portal-live/fys-registrering";
import { DrillLogger } from "./DrillLogger";
import { LiveCoachPanel } from "./LiveCoachPanel";
import { useLiveSession } from "./use-live-session";
import s from "./live-active.module.css";
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


  return <div className={s.page} data-od-id="playerhq-live-active" data-phase={live.phase}>
    <header className={s.header}>
      <h1 className={s.eyebrow}>Live · {data.title}</h1>
      <button ref={finishButton} className={s.secondary} disabled={!enabled} onClick={() => setConfirm(true)}>Avslutt</button>
    </header>
    <main className={s.main}>
      <div className={s.status} role="status">
        {live.phase === "starting" ? "Klargjør økta …" : live.phase === "start-error" ? "Økta kunne ikke åpnes. Prøv igjen når du har nett." : live.phase === "finished" ? "Åpner oppsummeringen …" : live.saving === "local-error" ? "Kunne ikke lagre på denne enheten. Hold siden åpen og prøv igjen." : live.saving === "offline" ? "Uten nett. Registreringene venter på sending." : live.saving === "error" ? "Ikke sendt. Registreringene er lagret på denne enheten." : live.saving === "saving" ? "Lagrer registreringer …" : "Registreringene er lagret."}
        {live.phase === "start-error" && <button className={s.textButton} onClick={live.retryStart}>Prøv å åpne igjen</button>}
        {enabled && ["error", "local-error"].includes(live.saving) && <button className={s.textButton} onClick={live.retrySync}>Prøv lagring igjen</button>}
      </div>
      <div className={s.columns}>
        <section aria-label="Økta nå" className={s.overview}>
          <div className={s.clock} data-testid="live-clock" aria-label={`${fmt(live.totalSec)} medgått tid`}>{fmt(live.totalSec)}</div>
          <div className={s.clockMeta}>
            <span>{live.paused ? "På pause" : "Medgått tid"}{planned > 0 ? ` · ${planned} min planlagt` : ""}</span>
            <button className={s.textButton} disabled={!enabled} onClick={live.togglePause} aria-pressed={live.paused}>
              {live.paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}{live.paused ? "Fortsett" : "Pause"}
            </button>
          </div>
          <div className={s.now}>
            <p className={s.eyebrow}>{ready ? "Klar til fullføring" : active ? `Nå · øvelse ${active.index} av ${live.drills.length}` : "Økta di"}</p>
            <h2>{ready ? "Alle øvelsene er markert ferdige" : active?.name ?? "Ingen øvelser i planen"}</h2>
            {active && <>
              <p className={s.meta}>{[active.durationMinutes > 0 ? `${active.durationMinutes} min` : null, plannedVolumText(active)].filter(Boolean).join(" · ")}</p>
              {active.pyramide === "FYS" ? <p className={s.description}>{aktivFys
                ? fysVisningsrader(aktivFys).map(rad => `${rad.label}: ${rad.verdi}`).join(" · ")
                : active.logNotes || "Ingen detaljer registrert"}</p> :
                <div className={s.count}><strong>{active.repsTotal}</strong><span>{active.plannedReps > 0 ? `av ${active.plannedReps} reps` : "registrert"}{active.repsHit > 0 ? ` · ${active.repsHit} treff` : ""}</span></div>}
              {active.pyramide !== "FYS" && active.plannedReps > 0 && <progress aria-label="Registreringer i aktiv øvelse" max={active.plannedReps} value={Math.min(active.repsTotal, active.plannedReps)} />}
            </>}
            {!active && <p className={s.description}>{ready ? "Du kan rette registreringene eller avslutte når du er klar." : "Du kan bruke notater og Caddie, og avslutte økta når du er klar."}</p>}
            {ready && <button className={s.primary} disabled={!enabled} onClick={() => setConfirm(true)}>Avslutt og se oppsummering</button>}
          </div>
        </section>
        <section className={s.registration} aria-label="Registrering">
          <div className={s.modes} role="group" aria-label="Visning i økta">
            {([['now', 'Registrer'], ['list', 'Øvelser'], ['notes', 'Notater']] as const).map(([id, label]) => <button key={id} className={s.mode} aria-pressed={mode === id} onClick={() => setMode(id)}>{label}{id === "list" && ` ${completedCount}/${live.drills.length}`}</button>)}
          </div>
          <div hidden={mode !== "now"}>
            {selected ? <>
              <label className={s.selectLabel} htmlFor="live-drill">Registrer på øvelse</label>
              <select className={s.select} id="live-drill" value={selected.id} disabled={!enabled} onChange={(event) => setSelectedId(event.target.value)}>{live.drills.map((d) => <option key={d.id} value={d.id}>{d.index}. {d.name}{d.status === "done" ? " · ferdig" : ""}</option>)}</select>
              <fieldset className={s.fieldset} disabled={!enabled}>
                {live.drills.map((d) => <div key={d.id} hidden={d.id !== selected.id}>
                  <DrillLogger drill={d} state={d} onChange={(value) => live.change(d.id, value)} onAdjust={(bucket, delta) => live.adjust(d.id, bucket, delta)} onComplete={() => { live.mark(d.id, d.status !== "done"); setSelectedId(null); }} done={d.status === "done"} />
                </div>)}
              </fieldset>
            </> : <p className={s.description}>Det er ingen øvelser å registrere på.</p>}
          </div>
          {(active?.description || active?.notes || data.maalsetning || data.coachComment) && <details className={s.context}><summary>Øvelsen og coachens beskjed</summary>{active?.description && <p>{active.description}</p>}{active?.notes && active.notes !== active.description && <p>{active.notes}</p>}{data.maalsetning && <p>{data.maalsetning}</p>}{data.coachComment && <p>{data.coachComment}</p>}</details>}
          <div hidden={mode !== "list"}>
            <ol className={s.drills}>
              {live.drills.map((d) => <li key={d.id} className={s.drill}>
                <button className={s.check} aria-label={`${d.status === "done" ? "Fjern ferdigmarkering for" : "Marker ferdig"} ${d.name}`} aria-pressed={d.status === "done"} disabled={!enabled} onClick={() => live.mark(d.id, d.status !== "done")}>{d.status === "done" ? <Check size={20} aria-hidden /> : d.index}</button>
                <div><h3>{d.name}</h3><p className={s.meta}>{d.repsTotal} registrert{d.status === "active" ? " · pågår" : d.status === "done" ? " · ferdig" : ""}</p></div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button className={s.textButton} onClick={() => { setSelectedId(d.id); setMode("now"); }}>Registrer<span className={s.srOnly}> på {d.name}</span></button>
                  {d.status !== "done" && live.drills.length > 1 && (
                    <button
                      className={s.textButton}
                      style={{ color: "var(--tl-mute)", padding: "4px 8px" }}
                      title="Fjern øvelse fra denne økta"
                      onClick={() => live.removeDrill(d.id)}
                    >
                      Fjern
                    </button>
                  )}
                </div>
              </li>)}
            </ol>
            <div style={{ marginTop: 16 }}>
              {!showAddDrill ? (
                <button
                  className={s.secondary}
                  style={{ width: "100%" }}
                  disabled={!enabled}
                  onClick={() => setShowAddDrill(true)}
                >
                  + Legg til øvelse underveis
                </button>
              ) : (
                <div style={{ padding: 14, borderRadius: 16, background: "var(--tl-elev)", border: "1px solid var(--tl-hair)", display: "flex", flexDirection: "column", gap: 10 }}>
                  <label className={s.selectLabel} htmlFor="new-drill-name">Navn på ny øvelse</label>
                  <input
                    id="new-drill-name"
                    type="text"
                    value={newDrillName}
                    onChange={(e) => setNewDrillName(e.target.value)}
                    placeholder="f.eks. Putting 3 meter, Wedges 60m"
                    style={{ width: "100%", minHeight: 40, padding: "8px 12px", border: "1px solid var(--tl-hair)", background: "var(--tl-scene)", color: "var(--tl-text)", borderRadius: 8 }}
                  />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label className={s.selectLabel} htmlFor="new-drill-min" style={{ margin: 0 }}>Varighet (min):</label>
                    <input
                      id="new-drill-min"
                      type="number"
                      min={1}
                      max={120}
                      value={newDrillMinutes}
                      onChange={(e) => setNewDrillMinutes(Number(e.target.value))}
                      style={{ width: 64, minHeight: 36, padding: "4px 8px", border: "1px solid var(--tl-hair)", background: "var(--tl-scene)", color: "var(--tl-text)", borderRadius: 8 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {(["TEK", "SLAG", "SPILL", "FYS", "TURN"] as const).map((a) => {
                      const on = newDrillAkse === a;
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setNewDrillAkse(a)}
                          style={{
                            appearance: "none",
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1px solid var(--tl-hair)",
                            background: on ? "var(--tl-dim)" : "transparent",
                            color: on ? "var(--tl-text)" : "var(--tl-mute)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            fontFamily: "var(--tl-font-mono)",
                            cursor: "pointer",
                          }}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                    <button className={s.textButton} onClick={() => setShowAddDrill(false)}>Avbryt</button>
                    <button className={s.primary} style={{ width: "auto", minHeight: 38, padding: "8px 16px", marginTop: 0 }} disabled={!newDrillName.trim()} onClick={handleAddDrill}>Legg til</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div hidden={mode !== "notes"} className={s.notes}>
            <div style={{ marginBottom: 16 }}>
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
            <label className={s.selectLabel} htmlFor="live-note">Skriv eller rediger notat</label>
            <textarea id="live-note" ref={noteInput} rows={4} value={text} disabled={!enabled} onChange={(event) => setText(event.target.value)} placeholder="Hva vil du huske?" />
            <button className={s.primary} disabled={!enabled || !text.trim()} onClick={addNote}>Legg til notat</button>
            <p className={s.meta}>Notatene beholdes i denne fanen og følger med til oppsummeringen.</p>
            {noteError && <p role="alert">Notatet kunne ikke lagres. Teksten står igjen; prøv på nytt.</p>}
            {coachSendStatus && <p role="status" style={{ fontSize: "0.8125rem", color: "var(--tl-text)", margin: "6px 0", fontStyle: "italic" }}>{coachSendStatus}</p>}
            {notes.length === 0 ? <p className={s.description}>Ingen notater ennå.</p> : <ol className={s.noteList}>{notes.map((note, index) => <li key={`${note.t}-${index}`}>
              <time>{note.t}</time>
              <p>{note.tekst}</p>
              <button
                className={s.textButton}
                style={{ fontSize: "0.75rem", padding: "4px 0", color: "var(--tl-mute)" }}
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
    <dialog ref={dialog} className={s.dialog} tabIndex={-1} onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const target = event.shiftKey ? buttons.at(-1) : buttons[0];
      if (!buttons.length || (event.shiftKey ? document.activeElement === buttons[0] : document.activeElement === buttons.at(-1))) { event.preventDefault(); (target ?? event.currentTarget).focus(); }
    }} aria-labelledby="live-finish-title" onCancel={(event) => { event.preventDefault(); close(); }} onClose={() => { if (!finishing) setConfirm(false); }}>
      <h2 id="live-finish-title">Avslutte økta?</h2>
      <p>{completedCount} av {live.drills.length} øvelser markert ferdige. Registreringene lagres før oppsummeringen åpnes.</p>
      {text.trim() && <p>Du har et notat som ikke er lagt til. Fortsett økta for å ta det med.</p>}
      {live.phase === "finish-error" && <p className={s.error} role="alert">Fullføringen ble ikke bekreftet. Hold siden åpen. Prøv igjen når du har nett, eller fortsett økta.</p>}
      <button className={s.primary} disabled={finishing} onClick={() => { void live.finish(); }}>{finishing ? "Lagrer og fullfører …" : live.phase === "finish-error" ? "Prøv fullføring igjen" : "Avslutt og logg økta"}</button>
      <button ref={cancelButton} className={s.textButton} disabled={finishing} onClick={close}>Fortsett økta</button>
    </dialog>
  </div>;
}
