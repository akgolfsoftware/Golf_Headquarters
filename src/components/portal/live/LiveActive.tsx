"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { LiveV2Drill, LiveV2Session, DrillRepState } from "./types";
import { LiveSessionShell } from "./LiveSessionShell";
import { SessionTimer } from "./SessionTimer";
import { DrillLogger } from "./DrillLogger";
import { completeDrill, completeSession, startSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

type DrillState = LiveV2Drill & {
  status: "done" | "active" | "queued";
} & DrillRepState;

function buildInitialDrills(data: LiveV2Session): DrillState[] {
  const drills: DrillState[] = data.drills.map((d, i) => {
    const log = data.existingLogs.find((l) => l.drillId === d.id);
    return {
      ...d,
      status: log ? "done" : i === 0 ? "active" : "queued",
      repsTotal: log?.repsTotal ?? 0,
      repsWithoutBall: log?.repsWithoutBall ?? 0,
      repsLowSpeed: log?.repsLowSpeed ?? 0,
      repsAutomatic: log?.repsAutomatic ?? 0,
      repsHit: log?.repsHit ?? 0,
    };
  });
  // Normaliser: sørg for én aktiv drill hvis det finnes ikke-ferdige.
  if (!drills.some((d) => d.status === "active")) {
    const firstQueued = drills.find((d) => d.status === "queued");
    if (firstQueued) firstQueued.status = "active";
  }
  return drills;
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }).vibrate?.(pattern);
    } catch {
      /* ignore */
    }
  }
}

export function LiveActive({ data }: { data: LiveV2Session }) {
  const router = useRouter();
  const [drills, setDrills] = useState<DrillState[]>(() => buildInitialDrills(data));
  const [paused, setPaused] = useState(false);
  const [totalSec, setTotalSec] = useState(0);
  const [drillSec, setDrillSec] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const activeIdx = useMemo(() => drills.findIndex((d) => d.status === "active"), [drills]);
  const active = activeIdx >= 0 ? drills[activeIdx] : null;

  // Start sesjonen ved mount (idempotent).
  const activatedRef = useRef(false);
  useEffect(() => {
    if (activatedRef.current) return;
    activatedRef.current = true;
    let cancelled = false;
    void startSession(data.sessionId).then((res) => {
      if (cancelled) return;
      if (res.state === "completed") router.replace(`/portal/live/${data.sessionId}/summary`);
      if (res.state === "unavailable") router.replace("/portal/planlegge");
    });
    return () => {
      cancelled = true;
    };
  }, [data.sessionId, router]);

  // Timer — total + aktiv drill.
  useEffect(() => {
    if (paused || !active) return;
    const id = setInterval(() => {
      setTotalSec((t) => t + 1);
      setDrillSec((d) => d + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [paused, active]);

  // Wake-lock — hold skjermen våken under aktiv økt.
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function acquire() {
      try {
        const wl = (navigator as Navigator & {
          wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> };
        }).wakeLock;
        if (wl) {
          const sentinel = await wl.request("screen");
          if (!cancelled) wakeRef.current = sentinel;
        }
      } catch {
        /* ignore */
      }
    }
    acquire();
    return () => {
      cancelled = true;
      wakeRef.current?.release().catch(() => {});
      wakeRef.current = null;
    };
  }, []);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const handleDrillChange = useCallback(
    (state: DrillRepState) => {
      if (!active) return;
      setDrills((prev) =>
        prev.map((d) => (d.id === active.id ? { ...d, ...state } : d)),
      );
    },
    [active],
  );

  const handleCompleteDrill = useCallback(async () => {
    if (!active || isCompleting) return;
    setIsCompleting(true);
    vibrate(40);

    try {
      await completeDrill({
        sessionId: data.sessionId,
        drillId: active.id,
        repsTotal: active.repsTotal,
        repsWithoutBall: active.repsWithoutBall,
        repsLowSpeed: active.repsLowSpeed,
        repsAutomatic: active.repsAutomatic,
        repsHit: active.repsHit,
        successRate: active.repsTotal > 0 ? Math.round((active.repsHit / active.repsTotal) * 100) : 0,
      });
    } catch (err) {
      // Fortsett lokalt selv om server-kallet feiler — bruker får fullført drill.
      console.error("[LiveActive] completeDrill feilet", err);
    } finally {
      setIsCompleting(false);
    }

    setDrills((prev) => {
      const next = prev.map((d, i) => {
        if (d.id === active.id) return { ...d, status: "done" as const };
        if (i === activeIdx + 1) return { ...d, status: "active" as const };
        return d;
      });
      return next;
    });
    setDrillSec(0);
    vibrate([60, 40]);

    // Siste drill → fullfør økt (server redirect håndterer navigering).
    if (activeIdx === drills.length - 1) {
      await completeSession(data.sessionId, totalSec + drillSec);
    }
  }, [active, activeIdx, data.sessionId, drills.length, isCompleting, totalSec, drillSec]);

  const activeState: DrillRepState | undefined = active
    ? {
        repsTotal: active.repsTotal,
        repsWithoutBall: active.repsWithoutBall,
        repsLowSpeed: active.repsLowSpeed,
        repsAutomatic: active.repsAutomatic,
        repsHit: active.repsHit,
      }
    : undefined;

  const completedCount = drills.filter((d) => d.status === "done").length;

  return (
    <LiveSessionShell
      title={data.title}
      subtitle="Live-økt"
      closeHref="/portal/planlegge"
      footer={
        <div className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-background/45">
          {completedCount}/{drills.length} fullført · hold skjermen våken
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="px-4">
          <SessionTimer
            seconds={totalSec}
            paused={paused}
            onTogglePause={togglePause}
            label="Økt-tid"
          />
        </div>

        {active && activeState ? (
          <DrillLogger
            drill={active}
            state={activeState}
            onChange={handleDrillChange}
            onComplete={handleCompleteDrill}
            isLast={activeIdx === drills.length - 1}
            completedCount={completedCount}
            totalCount={drills.length}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-accent/15">
              <CheckCircle2 className="h-8 w-8 text-accent" strokeWidth={2} aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-bold text-background">
              Alle drills fullført
            </h2>
            <p className="mt-2 text-sm text-background/65">
              Økta logges — du sendes til oppsummering.
            </p>
          </div>
        )}
      </div>
    </LiveSessionShell>
  );
}
