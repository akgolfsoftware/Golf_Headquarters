"use client";
import { T } from "@/lib/v2/tokens";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock } from "lucide-react";
import type { LiveV2Drill, LiveV2Session, DrillRepState, LiveCoachPanelData } from "./types";
import { plannedVolumText } from "./types";
import { fmtMSS } from "@/lib/portal-live/format";
import { DrillLogger } from "./DrillLogger";
import { SessionTimer } from "./SessionTimer";
import { LiveCoachPanel } from "./LiveCoachPanel";
import { LiveLoopNav } from "./LiveLoopNav";
import { completeDrill, completeSession, startSession, logDrillReps } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import {
  lagreLiveDrillUtkast,
  lesLiveDrillUtkast,
  slettLiveDrillUtkast,
  synkLiveDrillKo,
} from "@/lib/offline-queue/live-drill-queue";
import type { LiveDrillReps } from "@/lib/offline-queue/live-drill-kladd";

// Paper-fasit playerhq-live-okt.html — cream live-UNDER.
const LIVE_BG = "var(--v2-bg, #faf9f5)";

type DrillStatus = "done" | "active" | "queued";

type DrillState = LiveV2Drill & {
  status: DrillStatus;
} & DrillRepState;

function buildInitialDrills(data: LiveV2Session): DrillState[] {
  const drills: DrillState[] = data.drills.map((d, i) => {
    const log = data.existingLogs.find((l) => l.drillId === d.id);
    return {
      ...d,
      status: (log ? "done" : i === 0 ? "active" : "queued") as DrillStatus,
      repsTotal: log?.repsTotal ?? 0,
      repsWithoutBall: log?.repsWithoutBall ?? 0,
      repsLowSpeed: log?.repsLowSpeed ?? 0,
      repsAutomatic: log?.repsAutomatic ?? 0,
      repsHit: log?.repsHit ?? 0,
    };
  });
  // Normaliser: sørg for én aktiv drill hvis ikke-ferdige finnes.
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

// ── Confirm-overlay ──────────────────────────────────────────────────────────

type ConfirmOverlayProps = {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmOverlay({ show, onConfirm, onCancel }: ConfirmOverlayProps) {
  if (!show) return null;
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: T.farge.svartA55, backdropFilter: "blur(4px)" }}
     data-paper-slug="playerhq-live-okt">
      <div
        className="w-full max-w-[320px] rounded-[20px] p-6"
        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.fg }}
      >
        <div className="font-display text-[18px] font-semibold" style={{ color: T.fg }}>
          Avslutte økta?
        </div>
        <p className="mt-2 mb-5 text-[13.5px] leading-[1.55]" style={{ color: T.mut }}>
          Fremgangen din blir lagret. Du kan fortsette senere.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            data-paper-en-ting="true"
            className="w-full border-none py-[13px] font-sans text-[14px] font-semibold v2-press"
            style={{ background: T.handling, color: T.onHandling, minHeight: 52, borderRadius: 12 }}
          >
            Avslutt og logg
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-[13px] font-sans text-[13px] font-medium v2-press"
            style={{ border: `1px solid ${T.border}`, background: T.panel2, color: T.fg, borderRadius: 12 }}
          >
            Fortsett økta
          </button>
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ drill, onLogRep }: ChallengeCardProps) {
  const isActive = drill.status === "active";
  const isDone = drill.status === "done";

  const fysMaal = drill.pyramide === "FYS" ? drill.fysSett ?? drill.repSett ?? 0 : 0;
  const maal = drill.plannedReps > 0 ? drill.plannedReps : fysMaal;
  const progressPct = maal > 0 ? Math.min((drill.repsTotal / maal) * 100, 100) : 0;

  return (
    <div
      className="relative overflow-hidden rounded-[14px] border p-4 transition-all duration-200"
      style={{
        borderColor: isActive ? T.handling : T.border,
        background: isActive ? T.handlingSoft : isDone ? T.panel2 : T.panel,
        boxShadow: isActive ? "0 0 0 3px color-mix(in srgb, var(--v2-handling, #D97757) 18%, transparent)" : undefined,
        opacity: isDone ? 0.88 : 1,
      }}
    >
      <div
        className="mb-2 flex items-center gap-[6px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em]"
        style={{ color: T.mut }}
      >
        {isDone ? "Fullført" : isActive ? "Nå" : "Kø"}
        {drill.pyramide ? ` · ${drill.pyramide}` : ""}
      </div>
      <div
        className="mb-1 font-display text-[18px] font-bold leading-[1.15] -tracking-[0.02em]"
        style={{ color: T.fg }}
      >
        {drill.name}
      </div>
      {(drill.notes || drill.description) && (
        <div className="mb-3 text-[12.5px] leading-snug" style={{ color: T.mut, fontFamily: T.bodyFont }}>
          {drill.notes || drill.description}
        </div>
      )}
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.06em]" style={{ color: T.mut }}>
          Reps
        </span>
        <span className="font-mono text-[12px] font-semibold" style={{ color: T.fg }}>
          {drill.repsTotal}
          {maal > 0 && (
            <small className="font-normal" style={{ color: T.mut }}> / {maal}</small>
          )}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ border: `1px solid ${T.border}`, background: T.panel2 }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: isDone
              ? T.up
              : "linear-gradient(90deg, color-mix(in srgb, var(--v2-handling, #D97757) 55%, #141413), var(--v2-handling, #D97757))",
          }}
        />
      </div>
      {isActive && onLogRep && (
        <button
          type="button"
          onClick={onLogRep}
          className="mt-3 w-full rounded-[12px] border-none py-2.5 font-sans text-[13px] font-semibold active:scale-[0.98]"
          style={{ background: T.handling, color: T.onHandling, minHeight: 44 }}
          data-paper-en-ting="true"
        >
          Logg rep
        </button>
      )}
    </div>
  );
}

export function LiveActive({ data, coachPanel }: { data: LiveV2Session; coachPanel: LiveCoachPanelData }) {
  const router = useRouter();
  const [drills, setDrills] = useState<DrillState[]>(() => buildInitialDrills(data));
  const [paused, setPaused] = useState(false);
  const [totalSec, setTotalSec] = useState(0);
  const [drillSec, setDrillSec] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDrillLogger, setShowDrillLogger] = useState(false);

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

  // Gjenopprett midlertidige reps fra IndexedDB (overlever refresh/offline).
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    void lesLiveDrillUtkast(data.sessionId).then((utkast) => {
      if (!utkast?.drills.length) return;
      setDrills((prev) =>
        prev.map((d) => {
          const u = utkast.drills.find((x) => x.drillId === d.id);
          if (!u) return d;
          // Fullførte drills i DB vinner; ellers gjenopprett lokale tellinger.
          if (d.status === "done") return d;
          return {
            ...d,
            status: u.status === "done" ? "done" : d.status,
            repsTotal: Math.max(d.repsTotal, u.repsTotal),
            repsWithoutBall: Math.max(d.repsWithoutBall, u.repsWithoutBall),
            repsLowSpeed: Math.max(d.repsLowSpeed, u.repsLowSpeed),
            repsAutomatic: Math.max(d.repsAutomatic, u.repsAutomatic),
            repsHit: Math.max(d.repsHit, u.repsHit),
            logNotes: u.notes ?? d.logNotes,
          };
        }),
      );
      if (utkast.totalSec > 0) setTotalSec((t) => Math.max(t, utkast.totalSec));
    });
  }, [data.sessionId]);

  // Debounce: lagre lokal utkast + forsøk synk når online.
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistDrills = useCallback(
    (neste: DrillState[], sec: number, drillVarigheter?: Record<string, number>) => {
      const payload: LiveDrillReps[] = neste.map((d) => ({
        drillId: d.id,
        repsTotal: d.repsTotal,
        repsWithoutBall: d.repsWithoutBall,
        repsLowSpeed: d.repsLowSpeed,
        repsAutomatic: d.repsAutomatic,
        repsHit: d.repsHit,
        notes: d.logNotes,
        status: d.status,
        actualDurationSec: drillVarigheter?.[d.id],
      }));
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        void lagreLiveDrillUtkast(data.sessionId, payload, sec).then(() => {
          if (typeof navigator !== "undefined" && !navigator.onLine) return;
          void synkLiveDrillKo(data.sessionId, async (sessionId, drills) => {
            for (const d of drills) {
              if (d.repsTotal <= 0 && d.status !== "done") continue;
              const res = await logDrillReps({
                sessionId,
                drillId: d.drillId,
                repsTotal: d.repsTotal,
                repsWithoutBall: d.repsWithoutBall,
                repsLowSpeed: d.repsLowSpeed,
                repsAutomatic: d.repsAutomatic,
                repsHit: d.repsHit,
                notes: d.notes,
                actualDurationSec: d.actualDurationSec,
              }).catch(() => ({ ok: false }));
              if (!res.ok) return { ok: false };
            }
            return { ok: true };
          });
        });
      }, 800);
    },
    [data.sessionId],
  );

  useEffect(() => {
    function onOnline() {
      void synkLiveDrillKo(data.sessionId, async (sessionId, drills) => {
        for (const d of drills) {
          if (d.repsTotal <= 0 && d.status !== "done") continue;
          const res = await logDrillReps({
            sessionId,
            drillId: d.drillId,
            repsTotal: d.repsTotal,
            repsWithoutBall: d.repsWithoutBall,
            repsLowSpeed: d.repsLowSpeed,
            repsAutomatic: d.repsAutomatic,
            repsHit: d.repsHit,
            notes: d.notes,
          }).catch(() => ({ ok: false }));
          if (!res.ok) return { ok: false };
        }
        return { ok: true };
      });
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [data.sessionId]);

  // Timer — økt-tid tikker fra start uavhengig av aktiv drill (0-drill-økter
  // sto tidligere fastfrosset på 00:00); stopper når alt er fullført.
  useEffect(() => {
    const ferdig = drills.length > 0 && drills.every((d) => d.status === "done");
    if (paused || ferdig) return;
    const id = setInterval(() => {
      setTotalSec((t) => t + 1);
      setDrillSec((d) => d + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [paused, drills]);

  // Wake-lock — hold skjermen våken.
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

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  const handleDrillChange = useCallback(
    (state: DrillRepState) => {
      if (!active) return;
      setDrills((prev) => {
        const neste = prev.map((d) => (d.id === active.id ? { ...d, ...state } : d));
        persistDrills(neste, totalSec);
        return neste;
      });
    },
    [active, persistDrills, totalSec],
  );

  const handleCompleteDrill = useCallback(async () => {
    if (!active || isCompleting) return;
    setIsCompleting(true);
    vibrate(40);

    // Fanges FØR setDrillSec(0) under — dette er tiden drillen faktisk tok,
    // og den mater varighetsestimatet neste gang drillen planlegges.
    const brukteSek = drillSec;

    try {
      const res = await completeDrill({
        sessionId: data.sessionId,
        drillId: active.id,
        repsTotal: active.repsTotal,
        repsWithoutBall: active.repsWithoutBall,
        repsLowSpeed: active.repsLowSpeed,
        repsAutomatic: active.repsAutomatic,
        repsHit: active.repsHit,
        successRate:
          active.repsTotal > 0 ? Math.round((active.repsHit / active.repsTotal) * 100) : 0,
        notes: active.logNotes,
        actualDurationSec: brukteSek,
      });
      if (!res.ok && typeof navigator !== "undefined" && !navigator.onLine) {
        // Offline: behold lokal state; synk ved online.
        persistDrills(
          drills.map((d) =>
            d.id === active.id ? { ...d, status: "done" as const } : d,
          ),
          totalSec,
          { [active.id]: brukteSek },
        );
      }
    } catch (err) {
      console.error("[LiveActive] completeDrill feilet", err);
      // Offline-fallback: lagre utkast så reps og tid ikke forsvinner.
      persistDrills(drills, totalSec, { [active.id]: brukteSek });
    } finally {
      setIsCompleting(false);
    }

    setDrills((prev) => {
      const neste = prev.map((d, i) => {
        if (d.id === active.id) return { ...d, status: "done" as const };
        if (i === activeIdx + 1) return { ...d, status: "active" as const };
        return d;
      });
      persistDrills(neste, totalSec, { [active.id]: brukteSek });
      return neste;
    });
    setDrillSec(0);
    setShowDrillLogger(false);
    vibrate([60, 40]);

    if (activeIdx === drills.length - 1) {
      await completeSession(data.sessionId, totalSec);
      await slettLiveDrillUtkast(data.sessionId);
    }
  }, [active, activeIdx, data.sessionId, drills, drillSec, isCompleting, persistDrills, totalSec]);

  const handleLogRep = useCallback(() => {
    setShowDrillLogger(true);
  }, []);

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
  const progressPct = drills.length > 0 ? (completedCount / drills.length) * 100 : 0;

  // Undertittelen skal aldri gjenta tittelen (sto dobbelt ved 0 drills).
  const sessionMeta =
    drills.length > 0
      ? `${completedCount} / ${drills.length} drills`
      : "Ingen drills i økta";

  // Alle drills ferdige — vis ferdigmelding.
  const allDone = completedCount === drills.length && drills.length > 0;
  /** Over planlagt tid på denne drillen? Kun visning — sperrer aldri noe. */
  const overPlanlagt =
    !!active && active.durationMinutes > 0 && drillSec > active.durationMinutes * 60;

  if (showDrillLogger && active && activeState) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col" data-paper-wave-c="live-active"
        style={{ background: LIVE_BG }}
      >
        {/* Mini topbar for logger-overlay */}
        <header
          className="flex flex-shrink-0 items-center justify-between gap-4 px-5 py-3"
          style={{ paddingTop: "max(env(safe-area-inset-top) + 12px, 14px)", borderBottom: `1px solid ${T.border}`, background: T.bg }}
        >
          <button
            type="button"
            onClick={() => setShowDrillLogger(false)}
            className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] v2-press"
            style={{ color: T.mut, background: "transparent", border: "none" }}
          >
            Tilbake
          </button>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: T.handling }}>
            Logger drill
          </span>
          <span className="w-16" />
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto" style={{ minHeight: 0 }}>
          <DrillLogger
            drill={active}
            state={activeState}
            onChange={handleDrillChange}
            onComplete={handleCompleteDrill}
            isLast={activeIdx === drills.length - 1}
            completedCount={completedCount}
            totalCount={drills.length}
            drillSeconds={drillSec}
          />
        </main>
      </div>
    );
  }

  return (
    <div
      data-paper-portal-live-active
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      data-paper-wave-c="live-active"
      style={{
        background: LIVE_BG,
        color: T.fg,
        isolation: "isolate",
        fontFamily: T.ui,
      }}
    >
      {/* Confirm-overlay */}
      <ConfirmOverlay
        show={showConfirm}
        onConfirm={() => {
          setShowConfirm(false);
          void completeSession(data.sessionId, totalSec);
        }}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Topbar */}
      <header
        data-paper-topp
        className="flex flex-shrink-0 items-center gap-2 px-4 py-3"
        style={{
          paddingTop: "max(env(safe-area-inset-top) + 10px, 14px)",
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 className="font-display text-[17px] font-semibold leading-tight" style={{ margin: 0, color: T.fg }}>
            Økta pågår
          </h1>
          <div className="mt-[2px] font-mono text-[10.5px]" style={{ color: T.mut }}>
            {data.title}{sessionMeta ? ` · ${sessionMeta}` : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="v2-press rounded-full px-3 py-[6px] font-mono text-[10px] font-bold uppercase tracking-[0.06em]"
          style={{ border: `1px solid ${T.border}`, background: T.panel, color: T.down }}
        >
          Avslutt
        </button>
      </header>

      {/* Scrollbart innhold */}
      <main className="flex flex-1 flex-col overflow-y-auto px-[14px] py-[14px]" style={{ minHeight: 0, maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <LiveLoopNav aktiv="under" sessionId={data.sessionId} />

        {/* Tom-tilstand: økt uten drills — ærlig melding + vei videre, i
            stedet for «Trykk Logg rep»-copy som pekte på en knapp som ikke
            fantes. */}
        {drills.length === 0 && (
          <div className="mb-[14px] rounded-[14px] p-[18px] text-center" style={{ border: `1px dashed ${T.border}`, background: T.panel2 }}>
            <div className="font-display text-[17px] font-semibold" style={{ color: T.fg }}>
              Ingen drills i denne økta
            </div>
            <p className="mt-[6px] text-[12.5px] leading-[1.5]" style={{ color: T.mut }}>
              Åpne økta i planen og legg til driller («Rediger økt»), så dukker
              de opp her — eller tren fritt og avslutt når du er ferdig.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/portal/planlegge/workbench")}
              className="mt-[14px] rounded-[12px] px-6 py-3 font-sans text-[13px] font-semibold v2-press"
              style={{ border: `1px solid ${T.border}`, background: T.panel, color: T.fg }}
            >
              Til planen
            </button>
          </div>
        )}

        {/* GoalProgress-kort */}
        {drills.length > 0 && (
        <div className="mb-[14px] rounded-[14px] p-[14px]" style={{ border: `1px solid ${T.border}`, background: T.panel }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em]" style={{ color: T.mut }}>
              Fremdrift
            </span>
            <span className="font-mono text-[13px] font-semibold" style={{ color: T.fg }}>
              {completedCount}
              <small className="font-normal" style={{ color: T.mut }}> / {drills.length} drills</small>
            </span>
          </div>
          <div className="h-[10px] overflow-hidden rounded-full" style={{ border: `1px solid ${T.border}`, background: T.panel2 }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, color-mix(in srgb, var(--v2-handling, #D97757) 40%, #141413), var(--v2-handling, #D97757))",
              }}
            />
          </div>
          <div className="mt-[7px] text-[12px]" style={{ color: T.mut }}>
            {allDone
              ? "Alle drills fullført — flott innsats!"
              : completedCount > 0
              ? `Drill ${completedCount + 1} av ${drills.length} pågår`
              : "Trykk «Logg rep» for å begynne"}
          </div>
        </div>
        )}

        {/* Timer */}
        <div className="mb-[14px]">
          <SessionTimer
            seconds={totalSec}
            paused={paused}
            onTogglePause={togglePause}
            label="Økt-tid"
          />
          {/* Tid på drillen du holder på med, mot det som var planlagt.
              Ambert når du er over — aldri sperrende, bare til orientering. */}
          {active && !allDone && (
            <div
              className="mt-[8px] flex items-center justify-center gap-[6px] rounded-full px-3 py-[6px] font-mono text-[11px]"
              style={{
                background: overPlanlagt ? `var(--amber-100, ${T.farge.varselBakgrunn})` : `var(--panel-2, ${T.farge.hvitA6})`,
                color: overPlanlagt ? `var(--amber-900, ${T.farge.varselTekst})` : "inherit",
              }}
            >
              <Clock size={11} aria-hidden />
              <span>
                {fmtMSS(drillSec)}
                {active.durationMinutes > 0 && ` / ${active.durationMinutes} min`}
              </span>
              {overPlanlagt && <span className="font-bold">over plan</span>}
            </div>
          )}
        </div>

        {/* Alle drills ferdige — grønt banner */}
        {allDone && (
          <div
            className="mb-[14px] rounded-[14px] p-[18px] text-center"
            style={{ background: T.handlingSoft, border: `1px solid ${T.border}` }}
          >
            <div className="font-display text-[20px] font-semibold" style={{ color: T.fg }}>
              Alle drills fullført
            </div>
            <div className="mt-[6px] text-[13px]" style={{ color: T.mut }}>{data.title}</div>
            <button
              type="button"
              onClick={() => void completeSession(data.sessionId, totalSec)}
              data-od-id="live-avslutt"
              data-paper-en-ting="true"
              className="mt-[14px] w-full border-none px-6 py-3 font-sans text-[14px] font-semibold"
              style={{ background: T.handling, color: T.onHandling, minHeight: 56, borderRadius: 12 }}
            >
              Avslutt og logg økta
            </button>
          </div>
        )}

        {/* Drill-kort — aktiv øvelse først (B: 5s ser hva som skjer nå) */}
        <div className="flex flex-col gap-[10px]">
          {drills
            .slice()
            .sort((a, b) => {
              const rank = (s: DrillStatus) => (s === "active" ? 0 : s === "queued" ? 1 : 2);
              return rank(a.status) - rank(b.status);
            })
            .map((drill) => (
            <ChallengeCard
              key={drill.id}
              drill={drill}
              onLogRep={drill.status === "active" ? handleLogRep : undefined}
            />
          ))}
        </div>

        {/* Neste opp — sekundær info */}
        {active && !allDone && activeIdx < drills.length - 1 && (() => {
          const neste = drills[activeIdx + 1];
          const nesteMaal =
            neste.pyramide === "FYS"
              ? neste.fysSett ?? neste.repSett
                ? `${neste.fysSett ?? neste.repSett} sett`
                : ""
              : neste.plannedReps > 0
                ? `${neste.plannedReps} reps`
                : "";
          return (
            <div className="mt-[10px] flex items-center gap-3 rounded-[14px] px-[14px] py-[11px]" style={{ border: `1px solid ${T.border}`, background: T.panel }}>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.09em]" style={{ color: T.mut }}>
                  Neste opp
                </span>
                <span className="mt-[2px] block truncate text-[13.5px] font-semibold" style={{ color: T.fg }}>
                  {neste.name}
                </span>
              </span>
              {nesteMaal && (
                <span className="flex-shrink-0 font-mono text-[10.5px]" style={{ color: T.mut }}>{nesteMaal}</span>
              )}
            </div>
          );
        })()}

        <div className="h-4" />
      </main>

      {/* Sticky primær CTA — B: én grønn jobb (tommel-sone) */}
      {active && !allDone && (
        <footer
          data-paper-dokk
          className="flex-shrink-0 px-4 pt-3"
          style={{
            paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
            borderTop: `1px solid ${T.border}`,
            background: T.bg,
            maxWidth: 720,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <button
            type="button"
            onClick={handleLogRep}
            data-od-id="live-logg-rep"
            data-paper-en-ting="true"
            className="w-full border-none py-3.5 font-sans text-[14px] font-semibold active:scale-[0.98] v2-press"
            style={{ background: T.handling, color: T.onHandling, minHeight: 56, borderRadius: 12 }}
          >
            Logg rep
          </button>
          <button
            type="button"
            onClick={() => void handleCompleteDrill()}
            disabled={isCompleting}
            className="mt-2 w-full py-3 font-sans text-[13px] font-semibold disabled:opacity-50 v2-press"
            style={{ minHeight: 48, borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel, color: T.fg }}
          >
            {activeIdx === drills.length - 1 ? "Fullfør siste drill" : "Fullfør drill · neste"}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            data-od-id="live-avslutt"
            className="mt-2 w-full py-2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] disabled:opacity-50"
            style={{ color: T.mut, background: "transparent", border: "none" }}
          >
            Avslutt og logg økta
          </button>
        </footer>
      )}

      <LiveCoachPanel data={coachPanel} activeDrillId={active?.id ?? null} />
    </div>
  );
}
