"use client";

/** PH-05 Aktiv økt i Precision Athletics (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-live.jsx).
 * Natt, en kolonne: klokke for hele økta, drillvelger, drill med egen klokke og fire tellere
 * (−1, +5, +1), «Ferdig med drillen» nederst. Faktiske rep-kategorier beholdes.
 *
 * Bevisste avvik fra tegningen:
 *   - Tellerne står mot totalt antall reps, ikke per kategori: økta lagrer bare planlagt total.
 *   - Fjerde teller heter «Treff» (modellen lagrer treff, ikke «Slag»). Se DrillLogger.
 *   - «Teknisk oppgave» fra teknisk plan vises ikke: live-økta har ikke koblingen ennå.
 *   - Rekkefølge kan ikke endres (bare hopp over/fjern) og Notater, Caddie og talenotat er beholdt. */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, ListChecks, Pause, Play, Plus } from "lucide-react";
import type { LiveV2Session, LiveCoachPanelData } from "./types";
import { plannedVolumText } from "./types";
import { fysVisningsrader, lesFysRegistrering } from "@/lib/portal-live/fys-registrering";
import { DrillLogger } from "./DrillLogger";
import { LiveCoachPanel } from "./LiveCoachPanel";
import { useLiveSession } from "./use-live-session";
import { AkseMerke, Knapp, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { PHFokus, mmss } from "@/components/portal/precision/PHFokus";
import { akseFraPyramide } from "./brief-akse";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { byggLagringsNokkel } from "@/lib/offline-queue/eier-scope";
import { sendOktNotatTilCoach } from "@/lib/portal-live/actions";
import { VoiceRangeRecorder } from "@/components/shared/VoiceRangeRecorder";
import type { PyramidArea } from "@/generated/prisma/enums";

type LiveNotat = { t: string; tekst: string };
type TaleObservasjon = Parameters<NonNullable<React.ComponentProps<typeof VoiceRangeRecorder>["onMemoSaved"]>>[0];
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


  const leggTilTaleNotat = (obs: TaleObservasjon) => {
    const ny: LiveNotat = {
      t: fmt(live.totalSec),
      tekst: `[Tale] ${obs.club ?? ""}${obs.position ? ` · ${obs.position}` : ""}: ${obs.rawTranscript}`.trim(),
    };
    const key = noteKey(eierId, data.sessionId);
    if (!key) return;
    try {
      sessionStorage.setItem(key, JSON.stringify([ny, ...notes]));
      window.dispatchEvent(new Event("akhq-live-notes"));
    } catch { /* Notatet kan legges til for hånd. */ }
  };
  const drill = selected;
  const drillErAktiv = Boolean(drill && active && drill.id === active.id);
  const [receipt, setReceipt] = useState<{ navn: string; sek: number; min: number; reps: number; plan: number } | null>(null);
  const [beskrivelse, setBeskrivelse] = useState(true);
  const ferdigMedDrill = () => {
    if (!drill) return;
    if (drill.status !== "done") setReceipt({ navn: drill.name, sek: drillErAktiv ? live.drillSec : drill.actualDurationSec ?? 0, min: drill.durationMinutes, reps: drill.repsTotal, plan: drill.plannedReps });
    else setReceipt(null);
    live.mark(drill.id, drill.status !== "done");
    setSelectedId(null);
  };
  const statusTekst = live.phase === "starting" ? "Klargjør økta …" : live.phase === "start-error" ? "Økta kunne ikke åpnes. Prøv igjen når du har nett." : live.phase === "finished" ? "Åpner oppsummeringen …" : null;

  const topp = <>
    <StatusPille tone="live">Live</StatusPille>
    <span className="pa-okt-klokke" data-testid="live-clock" data-pause={live.paused} aria-label={`${fmt(live.totalSec)} medgått tid`}>{fmt(live.totalSec)}</span>
    {planned > 0 && <Meta>AV {planned} MIN</Meta>}
    <span style={{ flex: 1 }} />
    <button type="button" className="pa-iconbtn pa-iconbtn--secondary pa-iconbtn--stor" disabled={!enabled} onClick={live.togglePause} aria-pressed={live.paused} aria-label={live.paused ? "Fortsett" : "Pause"}>
      {live.paused ? <Play size={20} aria-hidden /> : <Pause size={20} aria-hidden />}
    </button>
    <button ref={finishButton} type="button" className="pa-btn pa-btn--ghost" style={{ height: 56 }} disabled={!enabled} onClick={() => setConfirm(true)}>Avslutt</button>
  </>;
  const handling = ready
    ? <Knapp size="xl" fullWidth icon={Check} iconName="check" disabled={!enabled} onClick={() => setConfirm(true)}>Avslutt og se oppsummering</Knapp>
    : mode === "now" && drill
      ? <Knapp size="xl" fullWidth icon={Check} iconName="check" disabled={!enabled} onClick={ferdigMedDrill}>{drill.status === "done" ? "Fjern ferdigmarkering" : "Ferdig med drillen"}</Knapp>
      : null;

  return <>
    <PHFokus odId="playerhq-live-active" label="Aktiv økt" topp={topp} handling={handling} attr={{ "data-phase": live.phase, "data-surface": "live" }}>
      <div role="status" className="pa-okt-statuslinje">
        {statusTekst && <span className="pa-okt-dempet">{statusTekst}</span>}
        {live.paused && enabled && <Meta>PÅ PAUSE</Meta>}
        {live.saving === "offline" && <Meta>FRAKOBLET · REPETISJONENE LAGRES PÅ TELEFONEN</Meta>}
        {live.saving === "saving" && <Meta>LAGRER …</Meta>}
        {live.saving === "error" && <span className="pa-okt-dempet">Kunne ikke lagre til serveren. Repetisjonene ligger trygt på telefonen.</span>}
        {live.saving === "local-error" && <span className="pa-okt-dempet">Kunne ikke lagre på telefonen. Hold siden åpen.</span>}
        {live.phase === "start-error" && <button type="button" className="pa-btn pa-btn--secondary" onClick={live.retryStart}>Prøv å åpne igjen</button>}
        {enabled && ["error", "local-error"].includes(live.saving) && <button type="button" className="pa-btn pa-btn--secondary" onClick={live.retrySync}>Prøv lagring igjen</button>}
      </div>

      {live.drills.length > 0 && <div className="pa-okt-steg">
        <div role="list" aria-label="Øvelser" className="pa-okt-steg__liste">
          {live.drills.map((d, i) => <button key={d.id} role="listitem" type="button" className="pa-okt-steg__knapp" aria-current={drill?.id === d.id ? "step" : undefined}
            aria-label={`Øvelse ${i + 1}${d.status === "done" ? " ferdig" : ""}`} onClick={() => { setSelectedId(d.id); setMode("now"); }}>
            {d.status === "done" ? <Check size={16} aria-hidden /> : String(i + 1).padStart(2, "0")}
          </button>)}
        </div>
      </div>}

      <div className="pa-okt-fane" role="group" aria-label="Visning i økta">
        {([["now", "Registrer"], ["list", `Øvelser (${live.drills.length})`], ["notes", "Notater"]] as const).map(([id, label]) =>
          <button key={id} type="button" className="pa-btn pa-btn--secondary pa-btn--lg" aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>)}
      </div>

      {receipt && mode === "now" && <div role="status" className="pa-okt-kvittering">
        <span className="pa-okt-rad__navn">Ferdig: {receipt.navn}</span>
        <Meta>{mmss(receipt.sek)} AV {mmss(receipt.min * 60)} · {receipt.reps}{receipt.plan > 0 ? ` AV ${receipt.plan}` : ""} REPS</Meta>
      </div>}

      <div hidden={mode !== "now"} style={{ display: mode === "now" ? "flex" : "none", flexDirection: "column", gap: 16 }}>
        {!drill ? <TomTilstand icon={ListChecks} title="Ingen øvelser å registrere på" text="Du kan bruke notater og Caddie, og avslutte økta når du er klar." />
          : <section aria-label={`Øvelse ${drill.index}`} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="pa-okt-merker">
              {akseFraPyramide(drill.pyramide) && <AkseMerke axis={akseFraPyramide(drill.pyramide)!} />}
              <Meta>ØVELSE {drill.index} AV {live.drills.length}{drill.durationMinutes > 0 ? ` · ${drill.durationMinutes} MIN` : ""}</Meta>
              <span style={{ flex: 1 }} />
              {drillErAktiv && <><span className="pa-okt-klokke" aria-label={`Øvelsen ${fmt(live.drillSec)}`}>{fmt(live.drillSec)}</span>{drill.durationMinutes > 0 && <Meta>AV {drill.durationMinutes}:00</Meta>}</>}
            </div>
            <h1 className="pa-okt-tittel">{drill.name}</h1>
            {(plannedVolumText(drill) || aktivFys) && drillErAktiv && <Meta>{[plannedVolumText(drill), aktivFys ? fysVisningsrader(aktivFys).map((rad) => `${rad.label}: ${rad.verdi}`).join(" · ") : null].filter(Boolean).join(" · ").toUpperCase()}</Meta>}
            {(drill.description || drill.notes || data.maalsetning || data.coachComment) && <>
              <button type="button" className="pa-okt-veksle" aria-expanded={beskrivelse} onClick={() => setBeskrivelse(!beskrivelse)}>
                <span aria-hidden>{beskrivelse ? "▴" : "▾"}</span>Beskrivelse og coachens beskjed
              </button>
              {beskrivelse && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {drill.description && <p className="pa-okt-tekst">{drill.description}</p>}
                {drill.notes && drill.notes !== drill.description && <p className="pa-okt-tekst">{drill.notes}</p>}
                {data.maalsetning && <p className="pa-okt-dempet"><strong>Mål for økta:</strong> {data.maalsetning}</p>}
                {data.coachComment && <p className="pa-okt-dempet"><strong>Fra coachen:</strong> {data.coachComment}</p>}
              </div>}
            </>}
            <fieldset disabled={!enabled} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
              {live.drills.map((d) => <div key={d.id} hidden={d.id !== drill.id}>
                <DrillLogger drill={d} state={d} onChange={(value) => live.change(d.id, value)} onAdjust={(bucket, delta) => live.adjust(d.id, bucket, delta)} />
              </div>)}
            </fieldset>
            <div>
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
                  leggTilTaleNotat(obs);
                }}
              />
            </div>
          </section>}
      </div>

      <div hidden={mode !== "list"} style={{ display: mode === "list" ? "flex" : "none", flexDirection: "column", gap: 16 }}>
        <section aria-label="Øvelser" className="pa-card pa-okt-kort"><ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {live.drills.map((d) => <li key={d.id} className="pa-okt-rad pa-okt-rad--hoy" style={{ ["--rad-mal" as string]: "48px minmax(0,1fr) auto" }}>
            <button type="button" className="pa-iconbtn pa-iconbtn--secondary" style={{ width: 48, height: 48 }} aria-label={`${d.status === "done" ? "Fjern ferdigmarkering for" : "Marker ferdig"} ${d.name}`} aria-pressed={d.status === "done"} disabled={!enabled} onClick={() => live.mark(d.id, d.status !== "done")}>
              {d.status === "done" ? <Check size={18} aria-hidden /> : <span aria-hidden style={{ font: "600 13px/1 var(--font-mono)" }}>{String(d.index).padStart(2, "0")}</span>}
            </button>
            <span className="pa-okt-rad__tekst"><h3 className="pa-okt-rad__navn" style={{ margin: 0 }}>{d.name}</h3><Meta>{d.repsTotal} REGISTRERT{d.status === "active" ? " · PÅGÅR" : d.status === "done" ? " · FERDIG" : ""}</Meta></span>
            <span style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button type="button" className="pa-btn pa-btn--ghost pa-btn--sm" onClick={() => { setSelectedId(d.id); setMode("now"); }}>Registrer<span className="pa-sr"> på {d.name}</span></button>
              {d.status !== "done" && live.drills.length > 1 && <button type="button" className="pa-btn pa-btn--ghost pa-btn--sm" title="Fjern øvelse fra denne økta" onClick={() => live.removeDrill(d.id)}>Fjern<span className="pa-sr"> {d.name}</span></button>}
            </span>
          </li>)}
        </ol></section>
        {!showAddDrill
          ? <Knapp variant="secondary" size="lg" fullWidth icon={Plus} iconName="plus" disabled={!enabled} onClick={() => setShowAddDrill(true)}>Legg til øvelse underveis</Knapp>
          : <section className="pa-card pa-okt-kort" style={{ padding: 16, gap: 12 }} aria-label="Ny øvelse">
            <label className="pa-okt-dempet" htmlFor="new-drill-name">Navn på ny øvelse</label>
            <input id="new-drill-name" type="text" className="pa-okt-felt" value={newDrillName} onChange={(e) => setNewDrillName(e.target.value)} placeholder="f.eks. Putting 3 meter, Wedges 60m" />
            <label className="pa-okt-dempet" htmlFor="new-drill-min">Varighet (minutter)</label>
            <input id="new-drill-min" type="number" min={1} max={120} inputMode="numeric" className="pa-okt-felt" value={newDrillMinutes} onChange={(e) => setNewDrillMinutes(Number(e.target.value))} />
            <div role="group" aria-label="Akse" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["TEK", "SLAG", "SPILL", "FYS", "TURN"] as const).map((a) => <button key={a} type="button" className={`pa-choice pa-choice--axis pa-choice--${a.toLowerCase()}`} aria-pressed={newDrillAkse === a} onClick={() => setNewDrillAkse(a)}><span className="pa-choice__dot" />{a}</button>)}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Knapp variant="ghost" onClick={() => setShowAddDrill(false)}>Avbryt</Knapp>
              <Knapp disabled={!newDrillName.trim()} onClick={handleAddDrill}>Legg til</Knapp>
            </div>
          </section>}
      </div>

      <div hidden={mode !== "notes"} style={{ display: mode === "notes" ? "flex" : "none", flexDirection: "column", gap: 12 }}>
        <VoiceRangeRecorder sessionId={data.sessionId} onMemoSaved={leggTilTaleNotat} />
        <label className="pa-okt-dempet" htmlFor="live-note">Skriv eller rediger notat</label>
        <textarea id="live-note" ref={noteInput} rows={4} className="pa-okt-felt" value={text} disabled={!enabled} onChange={(event) => setText(event.target.value)} placeholder="Hva vil du huske?" />
        <Knapp size="lg" fullWidth disabled={!enabled || !text.trim()} onClick={addNote}>Legg til notat</Knapp>
        <Meta>NOTATENE BEHOLDES I DENNE FANEN OG FØLGER MED TIL OPPSUMMERINGEN</Meta>
        {noteError && <p role="alert" className="pa-okt-dempet">Notatet kunne ikke lagres. Teksten står igjen; prøv på nytt.</p>}
        {coachSendStatus && <p role="status" className="pa-okt-dempet">{coachSendStatus}</p>}
        {notes.length === 0 ? <p className="pa-okt-dempet">Ingen notater ennå.</p> : <ol style={{ listStyle: "none", margin: 0, padding: 0 }} className="pa-card pa-okt-kort">{notes.map((note, index) => <li key={`${note.t}-${index}`} className="pa-okt-rad" style={{ ["--rad-mal" as string]: "minmax(0,1fr)", paddingBlock: 12 }}>
          <span className="pa-okt-rad__tekst"><Meta>{note.t} INN I ØKTA</Meta><span className="pa-okt-tekst">{note.tekst}</span>
            <button type="button" className="pa-btn pa-btn--ghost pa-btn--sm" style={{ alignSelf: "flex-start" }} onClick={() => handleSendNoteToCoach(note.tekst)}>Send notat til trenerens innboks</button></span>
        </li>)}</ol>}
      </div>
    </PHFokus>
    <LiveCoachPanel data={coachPanel} activeDrillId={active?.id} loft={112} />
    <dialog ref={dialog} className="pa-root pa-okt-dialog" data-theme="night" tabIndex={-1} onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const target = event.shiftKey ? buttons.at(-1) : buttons[0];
      if (!buttons.length || (event.shiftKey ? document.activeElement === buttons[0] : document.activeElement === buttons.at(-1))) { event.preventDefault(); (target ?? event.currentTarget).focus(); }
    }} aria-labelledby="live-finish-title" onCancel={(event) => { event.preventDefault(); close(); }} onClose={() => { if (!finishing) setConfirm(false); }}>
      <h2 id="live-finish-title">Avslutte økta?</h2>
      <p>{completedCount} av {live.drills.length} øvelser markert ferdige. Registreringene lagres før oppsummeringen åpnes. Resten lagres som ikke gjennomført.</p>
      {text.trim() && <p>Du har et notat som ikke er lagt til. Fortsett økta for å ta det med.</p>}
      {live.phase === "finish-error" && <p className="pa-okt-dempet" role="alert" style={{ padding: 12, borderRadius: 8, background: "var(--signal-tint)", color: "var(--text-primary)" }}>Fullføringen ble ikke bekreftet. Hold siden åpen. Prøv igjen når du har nett, eller fortsett økta.</p>}
      <div className="pa-okt-dialog__foot">
        <button ref={cancelButton} type="button" className="pa-btn pa-btn--secondary pa-btn--lg" disabled={finishing} onClick={close}>Fortsett økta</button>
        <button type="button" className="pa-btn pa-btn--primary pa-btn--lg" disabled={finishing} onClick={() => { void live.finish(); }}>{finishing ? "Lagrer og fullfører …" : live.phase === "finish-error" ? "Prøv fullføring igjen" : "Avslutt og logg økta"}</button>
      </div>
    </dialog>
  </>;
}
