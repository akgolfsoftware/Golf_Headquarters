"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";
import { listTnDrafts, updateTnDraft, TnLocalConflict, TN_LOGOUT_EVENT } from "@/lib/offline-queue/tn-draft-store";
import { TnInputError, tnAcknowledge, tnNewDraft, tnPrepare, tnRaw, type TnDraft, type TnRaw } from "./tn-draft";
import { tnVersion, type TnProtocol } from "./tn-catalog";
import type { TnValues } from "./tn-scoring";
import type { TnSaveInput, TnSaveResult } from "./tn-session";

export type TnInitial = { sessionId: string; revision: number; values: TnValues; notes: string; status: string };
export function useTnDraft(protocol: TnProtocol, initialSnapshot: TnInitial | undefined, save: (input: TnSaveInput) => Promise<TnSaveResult>, localSessionId?: string) {
  const [{ p, initial }] = useState(() => ({ p: protocol, initial: initialSnapshot }));
  const ownerId = useLokalDataEier();
  const [sessionId] = useState(() => initial?.sessionId ?? localSessionId ?? crypto.randomUUID());
  const [raw, setRaw] = useState<TnRaw>(() => tnRaw(initial?.values ?? {}));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [revision, setRevision] = useState(initial?.revision ?? 0);
  const [status, setStatus] = useState(initial?.status ?? "IN_PROGRESS");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Åpner sikker lokal lagring…");
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const row = useRef<TnDraft | null>(null);
  const stopped = useRef(false);
  const busy = useRef(false);
  const unpersisted = useRef(0);
  const edits = useRef(Promise.resolve());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushRef = useRef<() => void>(() => {});

  const fail = useCallback((e: unknown) => {
    setError(e instanceof Error ? e.message : "Kunne ikke lagre på denne enheten. Ikke lukk fanen.");
    if (e instanceof TnLocalConflict) { stopped.current = true; setBlocked(true); }
  }, []);
  function change(transform: (draft: TnDraft) => TnDraft): Promise<void> {
    const task = edits.current.then(async () => {
      if (!ownerId || !row.current || stopped.current) throw new TnLocalConflict("Utkastet kan ikke endres i denne fanen. Åpne testen på nytt.");
      const current = row.current;
      row.current = await updateTnDraft(ownerId, sessionId, current.token, stored => transform(stored!));
    });
    edits.current = task.catch(e => {
      if (!(e instanceof TnInputError)) { stopped.current = true; setBlocked(true); }
      fail(e);
    });
    return task;
  }

  useEffect(() => {
    let active = true;
    if (!ownerId || initial?.status && initial.status !== "IN_PROGRESS") return;
    stopped.current = false;
    void (async () => {
      try {
        const drafts = await listTnDrafts(ownerId);
        const stored = drafts.find(d => d.sessionId === sessionId);
        if (!active) return;
        if (stored && (stored.protocolId !== p.id || stored.version !== tnVersion(p) || stored.count !== p.rows.length)) throw new TnLocalConflict("Utkastet tilhører en annen testvariant.");
        const next = stored ?? await updateTnDraft(ownerId, sessionId, null, () => tnNewDraft(ownerId, sessionId, p, initial?.revision, initial?.values, initial?.notes));
        if (!active) return;
        row.current = next;
        setRevision(next.revision);
        if (!initial) window.history.replaceState(null, "", `?test=${encodeURIComponent(p.id)}${p.variableCount ? `&count=${p.rows.length}` : ""}&version=${tnVersion(p)}&local=${sessionId}`);
        setRaw(next.raw); setNotes(next.notes); setStatus(next.status); setClosing(!!next.pending && next.pending.input.intent !== "draft"); setReady(true);
        setMessage(next.pending || next.localRevision !== next.syncedRevision ? "Registreringer gjenopprettet fra denne enheten. Venter på lagring på kontoen." : "Klar. Hvert forsøk lagres automatisk.");
      } catch (e) { if (active) fail(e); }
    })();
    const logout = () => { stopped.current = true; setBlocked(true); setRaw({}); setNotes(""); setError("Du er logget ut eller kontoen er endret. Åpne testen på nytt."); };
    const storage = (e: StorageEvent) => { if (e.key === TN_LOGOUT_EVENT) logout(); };
    window.addEventListener(TN_LOGOUT_EVENT, logout); window.addEventListener("storage", storage);
    return () => { active = false; stopped.current = true; window.removeEventListener(TN_LOGOUT_EVENT, logout); window.removeEventListener("storage", storage); if (timer.current) clearTimeout(timer.current); };
  }, [ownerId, sessionId, p, initial, fail]);

  async function flush(intent: TnSaveInput["intent"] = "draft") {
    if (!ready || busy.current || stopped.current || status !== "IN_PROGRESS") return;
    busy.current = true; setSending(true); setError(""); if (intent !== "draft") setClosing(true);
    try {
      // Drain a possibly unacknowledged draft before completing/aborting.
      for (let step = 0; step < 5; step++) {
        await edits.current;
        if (stopped.current) return;
        if (!navigator.onLine) { setMessage("Uten nett. Registreringene er lagret på denne enheten og sendes når nettet er tilbake."); return; }
        const currentDraft = row.current;
        if (!currentDraft) return;
        if (!currentDraft.pending && intent === "draft" && currentDraft.localRevision === currentDraft.syncedRevision) {
          setMessage(currentDraft.revision ? "Alle registreringer er lagret på kontoen." : "Klar. Hvert forsøk lagres automatisk."); return;
        }
        if (!currentDraft.pending) await change(d => tnPrepare(d, p, intent));
        const pending = row.current?.pending;
        if (!pending) { setMessage(row.current?.revision ? "Alle registreringer er lagret på kontoen." : "Klar. Hvert forsøk lagres automatisk."); return; }
        setMessage("Lagret på enheten. Lagrer på kontoen…");
        let response: TnSaveResult;
        try { response = await save(pending.input); }
        catch { setMessage("Lagret på enheten. Venter på nett eller svar fra serveren."); return; }
        if (stopped.current) return;
        if (!response.ok) {
          setError(response.error);
          if (!response.retryable) { stopped.current = true; setBlocked(true); }
          return;
        }
        await change(d => tnAcknowledge(d, pending.input.mutationId!, response));
        const current = row.current!;
        setRevision(current.revision);
        setStatus(current.status);
        if (current.status !== "IN_PROGRESS") { setMessage(current.status === "COMPLETED" ? "Resultatet er lagret på kontoen." : "Avsluttet ufullstendig. Registreringene er bevart uten testscore."); return; }
        if (intent === "draft" && current.localRevision === current.syncedRevision) { setMessage("Alle registreringer er lagret på kontoen."); return; }
      }
    } catch (e) { fail(e); }
    finally { busy.current = false; setSending(false); setClosing(!!row.current?.pending && row.current.pending.input.intent !== "draft"); }
  }
  useEffect(() => { flushRef.current = () => { void flush(); }; });
  useEffect(() => {
    if (!ready) return;
    const retry = () => flushRef.current();
    const interval = setInterval(retry, 10000);
    window.addEventListener("online", retry);
    const warn = (event: BeforeUnloadEvent) => {
      if (unpersisted.current || row.current && (row.current.pending || row.current.localRevision !== row.current.syncedRevision)) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warn);
    retry();
    return () => { clearInterval(interval); window.removeEventListener("online", retry); window.removeEventListener("beforeunload", warn); };
  }, [ready]);
  function edit(nextRaw: TnRaw, nextNotes: string) {
    if (!ready || stopped.current || closing) return;
    setRaw(nextRaw); setNotes(nextNotes); setError(""); setMessage("Lagrer på denne enheten…");
    unpersisted.current++;
    void change(d => ({ ...d, raw: nextRaw, notes: nextNotes, localRevision: d.localRevision + 1 })).then(() => {
      unpersisted.current--;
      setMessage("Lagret på denne enheten. Venter på lagring på kontoen.");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => flushRef.current(), 600);
    }).catch(fail);
  }
  return { sessionId, revision, raw, notes, status, ready, message, error, blocked, sending, closing, edit, flush };
}
