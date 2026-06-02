"use client";

/**
 * PlayerHQ · Live-økt — auto-save-hook.
 *
 * Per-økt timer (60s) som POST-er gjeldende snapshot til auto-save-route, og en
 * `beforeunload`-handler som synkront pauser via `navigator.sendBeacon` (vanlig
 * async fetch dør ved unload). Begge ryddes på unmount. Content-hash dedupe:
 * uendret snapshot innen samme tick lagres ikke på nytt.
 */

import { useEffect, useRef } from "react";
import type { LiveSnapshotData } from "@/lib/portal-live/types";

const AUTOSAVE_MS = 60_000;

/** Snapshot-innhold uten tidsstempel — `updatedAtISO` settes ved sending. */
export type LiveSnapshotContent = Omit<LiveSnapshotData, "updatedAtISO">;

export function useLiveAutosave({
  sessionId,
  enabled,
  getSnapshot,
}: {
  sessionId: string;
  enabled: boolean;
  getSnapshot: () => LiveSnapshotContent;
}) {
  // getSnapshot endres hver render — hold siste i ref så effekten er stabil.
  const getRef = useRef(getSnapshot);
  useEffect(() => {
    getRef.current = getSnapshot;
  });
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;
    const url = `/api/portal/live/${sessionId}/snapshot`;

    function stamp(content: LiveSnapshotContent): LiveSnapshotData {
      return { ...content, updatedAtISO: new Date().toISOString() };
    }

    // 60s auto-save (per-økt). Dedupe på innhold (uten tidsstempel).
    const intervalId = window.setInterval(() => {
      const content = getRef.current();
      const hash = JSON.stringify(content);
      if (hash === lastSavedRef.current) return;
      lastSavedRef.current = hash;
      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stamp(content)),
        keepalive: true,
      }).catch(() => {
        // Nettverk nede — behold state, nullstill hash så neste tick prøver igjen.
        lastSavedRef.current = "";
      });
    }, AUTOSAVE_MS);

    // Synkron flush via sendBeacon (vanlig async fetch dør ved unload).
    // pause=true → sett PAUSED (siden forlates). pause=false → kun lagre snapshot.
    function flush(pause: boolean) {
      try {
        const blob = new Blob([JSON.stringify(stamp(getRef.current()))], {
          type: "application/json",
        });
        navigator.sendBeacon(pause ? `${url}?pause=1` : url, blob);
      } catch {
        /* sendBeacon utilgjengelig — ignorer */
      }
    }

    // beforeunload (desktop) + pagehide (pålitelig på mobil/iOS) → pause.
    const onUnload = () => flush(true);
    // visibilitychange→hidden (app til bakgrunn på mobil): lagre snapshot uten
    // å pause, så et kort fanebytte ikke trigger «Fortsett pågående?»-banneret.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush(false);
    };
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sessionId, enabled]);
}
