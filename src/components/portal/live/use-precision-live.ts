"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveAktivData } from "@/lib/portal-live/ph04-07-data";
import type { LiveDrillReps } from "@/lib/offline-queue/live-drill-kladd";
import { lagreLiveDrillUtkast, lesLiveDrillUtkast, slettLiveDrillUtkast, synkLiveDrillKo } from "@/lib/offline-queue/live-drill-queue";
import { fullforLiveOkt, lagreLiveDrillSnapshot, pauseLiveOkt, resumeLiveOkt } from "@/lib/portal-live/session-actions";
import { fysLoggState, lesFysRegistrering, type FysRegistrering } from "@/lib/portal-live/fys-registrering";

type Item = { drillId: string; reps: number; kommentar: string; elapsedSec: number; status: "done" | "active" | "queued" };
const toQueue = (items: Item[]): LiveDrillReps[] => items.map((i) => ({
  drillId: i.drillId, repsTotal: i.reps, notes: i.kommentar, actualDurationSec: i.elapsedSec, status: i.status,
  repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 0,
  quantityOnly: true,
}));

export function usePrecisionLive(data: LiveAktivData) {
  const [items, setItems] = useState<Item[]>(() => data.drills.map((d, i) => ({
    drillId: d.id, reps: d.repsCompleted ?? 0, kommentar: d.kommentar ?? "", elapsedSec: d.elapsedSec ?? 0,
    status: d.status ?? (i === (data.currentDrillIndex ?? 0) ? "active" : "queued"),
  })));
  const [current, setCurrent] = useState(data.currentDrillIndex ?? 0);
  const [seconds, setSeconds] = useState(data.initialSeconds ?? 0);
  const [paused, setPaused] = useState(data.pauset ?? false);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [needsRetry, setNeedsRetry] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [pauseBusy, setPauseBusy] = useState(false);
  const itemsRef = useRef(items);
  const secondsRef = useRef(seconds);
  const pausedRef = useRef(paused);
  const finishingRef = useRef(false);
  const dirtyRef = useRef(false);

  const update = useCallback((fn: (value: Item[]) => Item[]) => {
    const next = fn(itemsRef.current);
    itemsRef.current = next;
    dirtyRef.current = true;
    setItems(next);
  }, []);

  const persist = useCallback(async (send = true) => {
    if (!data.eierUserId || !data.lagring) return false;
    const stored = await lagreLiveDrillUtkast(data.eierUserId, data.sessionId, toQueue(itemsRef.current), secondsRef.current, {
      paused: pausedRef.current, drillSec: itemsRef.current.find((i) => i.status === "active")?.elapsedSec ?? 0,
    });
    if (!send) return stored;
    if (!navigator.onLine) {
      setNeedsRetry(true);
      setFeedback(stored ? "Lagret på denne enheten. Venter på nett." : "Ikke lagret. Hold økta åpen og prøv igjen.");
      return false;
    }
    setSaving(true);
    try {
      if (stored) {
        const result = await synkLiveDrillKo(data.eierUserId, data.sessionId, (id, rows, snapshot) => lagreLiveDrillSnapshot(id, rows, snapshot.totalSec, snapshot.paused));
        const ok = result === "synket" || result === "tom";
        dirtyRef.current = !ok;
        setNeedsRetry(!ok);
        setFeedback(ok ? "Lagret" : "Endringene venter. Prøv lagring igjen.");
        return ok;
      }
      const result = await lagreLiveDrillSnapshot(data.sessionId, toQueue(itemsRef.current), secondsRef.current, pausedRef.current);
      dirtyRef.current = !result.ok;
      setNeedsRetry(!result.ok);
      setFeedback(result.ok ? "Lagret. Lokal lagring er ikke tilgjengelig." : result.error);
      return result.ok;
    } catch {
      setNeedsRetry(true);
      setFeedback(stored ? "Lagret på denne enheten. Sendingen venter." : "Ikke lagret. Prøv igjen før du forlater økta.");
      return false;
    } finally { setSaving(false); }
  }, [data.eierUserId, data.lagring, data.sessionId]);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const row = data.eierUserId ? await lesLiveDrillUtkast(data.eierUserId, data.sessionId) : null;
      if (!active) return;
      if (row && row.synketRevision !== row.revision) {
        const restored = itemsRef.current.map((i) => {
          const saved = row.drills.find((d) => d.drillId === i.drillId);
          return saved ? { ...i, reps: saved.repsTotal, kommentar: saved.notes ?? i.kommentar, elapsedSec: saved.actualDurationSec ?? i.elapsedSec, status: saved.status } : i;
        });
        itemsRef.current = restored;
        setItems(restored);
        // En usynket pause er den aktuelle registreringen på denne enheten.
        // Serverens veggklokke må ikke fylle pausen med oppdiktet treningstid.
        secondsRef.current = row.totalSec;
        setSeconds(secondsRef.current);
        pausedRef.current = row.paused ?? pausedRef.current;
        setPaused(pausedRef.current);
        const index = restored.findIndex((i) => i.status === "active");
        if (index >= 0) setCurrent(index);
        dirtyRef.current = true;
        setNeedsRetry(true);
        setFeedback("Gjenopptatt fra denne enheten. Endringer venter på sending.");
      }
      setReady(true);
    };
    void restore();
    return () => { active = false; };
  }, [data.eierUserId, data.sessionId, data.initialSeconds]);

  useEffect(() => {
    if (!ready || paused || !items.length) return;
    let last = Date.now();
    const tick = setInterval(() => {
      const now = Date.now();
      const delta = Math.max(0, Math.floor((now - last) / 1000));
      if (!delta) return;
      last += delta * 1000;
      secondsRef.current += delta;
      setSeconds(secondsRef.current);
      const next = itemsRef.current.map((i, index) => index === current ? { ...i, elapsedSec: i.elapsedSec + delta } : i);
      itemsRef.current = next;
      if (secondsRef.current % 5 === 0) void persist(false);
    }, 1000);
    return () => clearInterval(tick);
  }, [ready, paused, items.length, current, persist]);

  useEffect(() => {
    if (!ready || !dirtyRef.current) return;
    const timer = setTimeout(() => void persist(), 600);
    return () => clearTimeout(timer);
  }, [items, ready, persist]);

  useEffect(() => {
    if (!ready) return;
    const online = () => { void persist(); };
    const visibility = () => { void persist(document.visibilityState === "visible"); };
    window.addEventListener("online", online);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("online", online);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [ready, persist]);

  const select = (index: number) => {
    if (finishingRef.current || !itemsRef.current[index]) return;
    update((old) => old.map((i, n) => ({ ...i, status: n === index ? "active" : i.status === "active" ? "queued" : i.status })));
    setCurrent(index);
  };
  const add = (delta: number) => {
    if (finishingRef.current) return;
    update((old) => old.map((i, n) => n === current ? { ...i, reps: Math.max(0, i.reps + delta) } : i));
  };
  const comment = (value: string) => update((old) => old.map((i, n) => {
    if (n !== current) return i;
    const previous = lesFysRegistrering(i.kommentar);
    return { ...i, kommentar: previous ? fysLoggState({ ...previous, notat: value.slice(0, 1000) }).logNotes ?? "" : value.slice(0, 1000) };
  }));
  const fys = (registration: FysRegistrering) => {
    const log = fysLoggState(registration);
    update((old) => old.map((i, n) => n === current ? { ...i, reps: log.repsTotal, kommentar: log.logNotes ?? "" } : i));
  };
  const next = () => {
    update((old) => old.map((i, n) => ({ ...i, status: n === current ? (i.reps > 0 ? "done" : "queued") : n === current + 1 ? "active" : i.status })));
    setCurrent((n) => Math.min(itemsRef.current.length - 1, n + 1));
  };
  const togglePause = async () => {
    if (pauseBusy || finishingRef.current) return;
    setPauseBusy(true);
    const target = !pausedRef.current;
    pausedRef.current = target;
    setPaused(target);
    await persist(false);
    try {
      const result = await (target ? pauseLiveOkt(data.sessionId) : resumeLiveOkt(data.sessionId));
      if (!result.ok) {
        setNeedsRetry(true);
        setFeedback(result.error + " Pausen er bevart på denne enheten.");
      } else { setNeedsRetry(false); setFeedback(target ? "Økta er satt på pause" : "Økta fortsetter"); }
    } catch { setNeedsRetry(true); setFeedback("Pausen er bevart på denne enheten. Venter på nett."); }
    finally { setPauseBusy(false); }
  };
  const finish = async (): Promise<string | null> => {
    if (finishingRef.current) return null;
    finishingRef.current = true;
    setFinishing(true);
    pausedRef.current = true;
    setPaused(true);
    const completed = itemsRef.current.map((i) => i.status === "active" && i.reps > 0 ? { ...i, status: "done" as const } : i);
    itemsRef.current = completed;
    setItems(completed);
    await persist(false);
    try {
      if (!navigator.onLine) { setNeedsRetry(true); setFeedback("Økta er bevart på enheten. Koble til nett før du fullfører."); return null; }
      const result = await fullforLiveOkt(data.sessionId, itemsRef.current, secondsRef.current);
      if (!result.ok) { setNeedsRetry(true); setFeedback(result.error); return null; }
      if (data.eierUserId) await slettLiveDrillUtkast(data.eierUserId, data.sessionId);
      return result.href;
    } catch { setNeedsRetry(true); setFeedback("Økta ble ikke fullført. Registreringene er bevart; prøv igjen."); return null; }
    finally { finishingRef.current = false; setFinishing(false); }
  };
  return { items, current, seconds, paused, ready, feedback, needsRetry, saving, finishing, pauseBusy, select, add, comment, fys, next, togglePause, finish, persist };
}
