"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { startSession, logDrillReps, completeSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { lagreLiveDrillUtkast, lesLiveDrillUtkast, slettLiveDrillUtkast, synkLiveDrillKo } from "@/lib/offline-queue/live-drill-queue";
import { adjustLiveRep, livePayload, markLiveDrill, restoreLiveState, type LiveState, type RepBucket } from "@/lib/portal-live/live-state";
import type { LiveV2Session, DrillRepState } from "./types";

type Phase = "starting" | "active" | "start-error" | "finishing" | "finish-error" | "finished";
type Saving = "saved" | "saving" | "offline" | "error" | "local-error";

export function useLiveSession(data: LiveV2Session, eierId: string | null) {
  const router = useRouter();
  const initial = useRef(data);
  const [state, setState] = useState(() => restoreLiveState(data, null));
  const latest = useRef(state);
  const [phase, setPhaseState] = useState<Phase>("starting");
  const phaseRef = useRef<Phase>("starting");
  const [saving, setSaving] = useState<Saving>("saved");
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(false);
  const resuming = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRequest = useRef<ReturnType<typeof startSession> | null>(null);
  const restoreRequest = useRef<ReturnType<typeof lesLiveDrillUtkast> | null>(null);
  const phaseTo = useCallback((next: Phase) => { phaseRef.current = next; setPhaseState(next); }, []);
  const update = useCallback((next: LiveState) => { latest.current = next; setState(next); }, []);
  const saveLocal = useCallback((next: LiveState) => {
    if (!eierId) return Promise.resolve(false);
    return lagreLiveDrillUtkast(eierId, data.sessionId, livePayload(next), next.totalSec, { paused: next.paused, drillSec: next.drillSec }).catch(() => false);
  }, [data.sessionId, eierId]);

  const sync = useCallback(async () => {
    if (!navigator.onLine) { if (mounted.current) setSaving("offline"); return false; }
    if (mounted.current) setSaving("saving");
    if (!eierId) { if (mounted.current) setSaving("local-error"); return false; }
    const result = await synkLiveDrillKo(eierId, data.sessionId, async (sessionId, drills) => {
      for (const drill of drills) {
        const response = await logDrillReps({ sessionId, ...drill });
        if (!response.ok) return { ok: false };
      }
      return { ok: true };
    }).catch(() => "feilet" as const);
    if (mounted.current) setSaving(result === "synket" || result === "tom" ? "saved" : result === "venter" ? "saving" : "error");
    return result === "synket" || result === "tom";
  }, [data.sessionId, eierId]);

  const persist = useCallback((next: LiveState) => {
    update(next);
    setSaving(navigator.onLine ? "saving" : "offline");
    void saveLocal(next).then((ok) => {
      if (!ok && mounted.current) setSaving("local-error");
      if (!ok || !mounted.current || phaseRef.current !== "active") return;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => { void sync(); }, 400);
    });
  }, [saveLocal, sync, update]);

  useEffect(() => {
    mounted.current = true;
    let disposed = false;
    startRequest.current ??= startSession(data.sessionId);
    restoreRequest.current ??= eierId ? lesLiveDrillUtkast(eierId, data.sessionId) : Promise.resolve(null);
    void Promise.all([startRequest.current, restoreRequest.current]).then(async ([result, cached]) => {
      if (disposed) return;
      if (result.state !== "active") { phaseTo("finished"); router.replace(result.redirectTo); return; }
      const restored = resuming.current ? latest.current : restoreLiveState(initial.current, cached);
      update(restored);
      phaseTo("active");
      if (resuming.current) {
        resuming.current = false;
        void saveLocal(restored).then((ok) => { if (!mounted.current) return; if (ok) void sync(); else setSaving("local-error"); });
      } else if (cached && (cached.synketRevision == null || cached.synketRevision !== cached.revision)) void sync();
    }).catch(() => { if (!disposed) phaseTo("start-error"); });
    return () => { disposed = true; mounted.current = false; if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [data.sessionId, eierId, attempt, phaseTo, router, saveLocal, sync, update]);

  useEffect(() => {
    if (phase !== "active") return;
    let previous = Date.now();
    let persisted = previous;
    const tick = () => {
      if (phaseRef.current !== "active") return;
      const now = Date.now();
      const seconds = Math.floor((now - previous) / 1000);
      if (seconds > 0) {
        previous += seconds * 1000;
        if (!latest.current.paused) update({ ...latest.current, totalSec: latest.current.totalSec + seconds, drillSec: latest.current.drillSec + (latest.current.drills.some((d) => d.status === "active") ? seconds : 0) });
      }
      if (now - persisted >= 5000) { persisted = now; void saveLocal(latest.current).then((ok) => { if (!ok && mounted.current) setSaving("local-error"); }); }
    };
    const timer = setInterval(tick, 250);
    const leave = () => { tick(); void saveLocal(latest.current); };
    const online = () => { void sync(); };
    const offline = () => setSaving("offline");
    window.addEventListener("pagehide", leave); window.addEventListener("online", online); window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", leave);
    return () => { clearInterval(timer); window.removeEventListener("pagehide", leave); window.removeEventListener("online", online); window.removeEventListener("offline", offline); document.removeEventListener("visibilitychange", leave); };
  }, [phase, update, saveLocal, sync]);

  const finish = async () => {
    if (!["active", "finish-error"].includes(phaseRef.current)) return;
    phaseTo("finishing");
    if (syncTimer.current) clearTimeout(syncTimer.current);
    try {
      // Et tapt fullføringssvar skal kunne prøves igjen uten nye registreringer.
      const current = await startSession(data.sessionId);
      if (current.state !== "active") { phaseTo("finished"); if (current.state === "completed" && eierId) await slettLiveDrillUtkast(eierId, data.sessionId).catch(() => {}); router.replace(current.redirectTo); return; }
      const snapshot = latest.current;
      if (!(await saveLocal(snapshot))) { setSaving("local-error"); throw new Error("local-save"); }
      if (!(await sync())) throw new Error("sync");
      const result = await completeSession(data.sessionId, snapshot.totalSec, snapshot.drills.filter((d) => d.status === "done").map((d) => d.id));
      phaseTo("finished");
      if (eierId) await slettLiveDrillUtkast(eierId, data.sessionId).catch(() => {});
      router.replace(result.href);
    } catch { phaseTo("finish-error"); }
  };
  return { ...state, phase, saving, finish,
    retryStart: () => { if (phaseRef.current !== "start-error") return; startRequest.current = null; restoreRequest.current = null; phaseTo("starting"); setAttempt((n) => n + 1); },
    retrySync: () => { void saveLocal(latest.current).then((ok) => { if (ok) void sync(); else setSaving("local-error"); }); },
    resumeAfterError: () => { if (phaseRef.current === "finish-error") { resuming.current = true; startRequest.current = null; restoreRequest.current = null; phaseTo("starting"); setAttempt((n) => n + 1); } },
    togglePause: () => { if (phaseRef.current === "active") persist({ ...latest.current, paused: !latest.current.paused }); },
    change: (id: string, values: DrillRepState) => { if (phaseRef.current === "active") persist({ ...latest.current, drills: latest.current.drills.map((d) => d.id === id ? { ...d, ...values } : d) }); },
    adjust: (id: string, bucket: RepBucket, delta: number) => { if (phaseRef.current === "active") persist(adjustLiveRep(latest.current, id, bucket, delta)); },
    mark: (id: string, done: boolean) => { if (phaseRef.current === "active") persist(markLiveDrill(latest.current, id, done)); },
  };
}
