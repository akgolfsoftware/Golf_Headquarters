"use client";

/**
 * Wave C — portal-wide offline → DB flush.
 * Live session shells flush per session on "online". This mounts under /portal
 * and retries any IndexedDB rows when the app regains network or becomes
 * visible — so leaving mid-session still syncs later.
 *
 * Fail UX: one toast if items remain after flush (never spam).
 */

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { tomKo, listTapperKo } from "@/lib/offline-queue/tapper-queue";
import { synkLiveDrillKo, listLiveDrillKo } from "@/lib/offline-queue/live-drill-queue";
import { saveTapperCounts } from "@/app/portal/(fullscreen)/live/[sessionId]/tapper/actions";
import { logDrillReps } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

async function flushAll(): Promise<{ remaining: number; synced: number }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { remaining: 0, synced: 0 };
  }

  let synced = 0;

  const tapper = await listTapperKo().catch(() => []);
  for (const rad of tapper) {
    try {
      await tomKo(rad.sessionId, saveTapperCounts);
      synced += 1;
    } catch {
      /* keep queue row */
    }
  }

  const drills = await listLiveDrillKo().catch(() => []);
  for (const rad of drills) {
    try {
      const res = await synkLiveDrillKo(rad.sessionId, async (sessionId, items) => {
        for (const d of items) {
          if (d.repsTotal <= 0 && d.status !== "done") continue;
          const r = await logDrillReps({
            sessionId,
            drillId: d.drillId,
            repsTotal: d.repsTotal,
            repsWithoutBall: d.repsWithoutBall,
            repsLowSpeed: d.repsLowSpeed,
            repsAutomatic: d.repsAutomatic,
            repsHit: d.repsHit,
            notes: d.notes,
            actualDurationSec: d.actualDurationSec,
          }).catch(() => ({ ok: false as const }));
          if (!r.ok) return { ok: false as const };
        }
        return { ok: true as const };
      });
      if (res) synced += 1;
    } catch {
      /* keep */
    }
  }

  const leftTapper = (await listTapperKo().catch(() => [])).length;
  const leftDrill = (await listLiveDrillKo().catch(() => [])).length;
  return { remaining: leftTapper + leftDrill, synced };
}

export function OfflineSyncBootstrap() {
  const warned = useRef(false);

  useEffect(() => {
    const run = async () => {
      const { remaining, synced } = await flushAll();
      if (synced > 0 && remaining === 0) {
        // silent success — avoid noise on every visit
      } else if (remaining > 0 && !warned.current) {
        warned.current = true;
        toast.message("Noen offline-logger venter fortsatt", {
          description: "Vi prøver igjen når du er online. Sjekk live-økten om tall mangler.",
        });
      }
    };
    void run();
    const onOnline = () => {
      warned.current = false;
      void run();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") void run();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
