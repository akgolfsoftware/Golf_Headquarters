"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { LiveV2Drill, LiveV2Session, DrillRepState, LiveCoachPanelData } from "./types";
import { plannedVolumText } from "./types";
import { DrillLogger } from "./DrillLogger";
import { SessionTimer } from "./SessionTimer";
import { LiveCoachPanel } from "./LiveCoachPanel";
import { completeDrill, completeSession, startSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

// Samme mørke forest-gradient som brief/logger/oppsummering (LiveSessionShell
// "dark"-variant) — hele live-flyten er bevisst alltid mørk uansett appens
// lys/mørk-tema (immersivt treningsmodus-fokus). Atmosfære-fargene under er
// pinnet hex (ingen palett-token), mens merkevarefargene forest/lime bruker de
// mode-invariante palett-primitivene var(--forest-700)/var(--lime-500) — de
// bytter ALDRI per tema, så mørk-utseendet bevares uten rå hex. Bruk aldri
// semantiske tokens (var(--signal)/var(--v2-lime)) her — de byttes i lys modus.
const LIVE_BG_GRADIENT = "radial-gradient(120% 80% at 50% 0%, #0d2218, #0A1F17 70%)";

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
      style={{ background: "rgba(10, 31, 23, 0.70)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-[320px] rounded-[20px] border border-background/10 p-6" style={{ background: "#12271E" }}>
        <div className="font-display text-[18px] font-bold text-background">
          Avslutt økt?
        </div>
        <p className="mt-2 mb-5 text-[13.5px] leading-[1.55] text-background/60">
          Fremgangen din blir lagret. Du kan fortsette senere.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-full border border-destructive/25 bg-destructive/10 py-[13px] font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-destructive"
          >
            Avslutt og lagre
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-full py-[13px] font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent"
            style={{ background: "var(--forest-700)" }}
          >
            Fortsett økt
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Challenge card (drill-rad i aktiv økt) ──────────────────────────────────

const AXIS_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

type ChallengeCardProps = {
  drill: DrillState;
  onLogRep?: () => void;
};

function ChallengeCard({ drill, onLogRep }: ChallengeCardProps) {
  const isActive = drill.status === "active";
  const isDone = drill.status === "done";
  const isQueued = drill.status === "queued";

  // FYS-drills har ofte ikke plannedReps (repetitions) satt — bruk repSett/
  // fysSett som mål-proxy (antall sett) i stedet for å vise en tom 0/0-bar.
  const fysMaal = drill.pyramide === "FYS" ? drill.fysSett ?? drill.repSett ?? 0 : 0;
  const maal = drill.plannedReps > 0 ? drill.plannedReps : fysMaal;
  const progressPct = maal > 0 ? Math.min((drill.repsTotal / maal) * 100, 100) : 0;

  let cardClasses =
    "relative overflow-hidden rounded-[14px] border p-4 transition-all duration-200";
  if (isActive) {
    cardClasses +=
      " border-accent bg-background/8 shadow-[0_0_0_4px_rgba(209,248,67,0.12)]";
    // lime border for active
  } else if (isDone) {
    cardClasses += " border-background/15 bg-background/5 opacity-85";
  } else {
    // queued
    cardClasses += " border-background/10 bg-background/4 opacity-55";
  }

  return (
    <div className={cardClasses} style={isActive ? { borderColor: "var(--lime-500)" } : undefined}>
      {/* Eyebrow */}
      <div className="mb-2 flex items-center gap-[6px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em] text-background/60">
        <span className="h-[6px] w-[6px] rounded-full bg-accent" aria-hidden />
        {AXIS_LABEL[drill.pyramide] ?? drill.pyramide}
      </div>

      {/* Title */}
      <div className="mb-1 font-display text-[18px] font-bold leading-[1.15] -tracking-[0.02em] text-background">
        {drill.name}
      </div>

      {/* Planlagt rep-type + volum (bølge 2) — det coachen la inn */}
      {plannedVolumText(drill) && (
        <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-background/60">
          Planlagt: {plannedVolumText(drill)}
        </div>
      )}

      {/* Fremdrift */}
      <div className="mb-[7px] flex items-center justify-between">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-background/60">
          Fremdrift
        </span>
        <span className="font-mono text-[12px] font-semibold text-background">
          {drill.repsTotal}
          {drill.plannedReps > 0 && (
            <small className="font-normal text-background/60"> / {drill.plannedReps}</small>
          )}
        </span>
      </div>

      {/* Progress bar — forest→lime gradient */}
      <div className="h-2 overflow-hidden rounded-full border border-background/10 bg-background/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${isDone ? 100 : progressPct}%`,
            background: isDone
              ? "linear-gradient(90deg, #1A7D56, var(--forest-700))"
              : "linear-gradient(90deg, var(--forest-700), var(--lime-500))",
          }}
        />
      </div>

      {/* Status + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.06em]"
          style={{
            // Lys status-tekst på den mørke forest-flata.
            color: isActive ? "var(--lime-500)" : isDone ? "rgba(247,247,244,0.65)" : "rgba(247,247,244,0.45)",
          }}
        >
          {isActive ? "Pågår" : isDone ? "Fullført" : isQueued ? "Venter" : ""}
        </span>

        {isActive && onLogRep && (
          <button
            type="button"
            onClick={onLogRep}
            className="rounded-full border-none px-5 py-[9px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-accent-foreground"
            style={{ background: "var(--lime-500)" }}
          >
            Logg rep
          </button>
        )}

        {isDone && (
          // Lys suksess-grønn (DS mørk-verdi) — .dark-klassen finnes ikke her.
          <span className="flex items-center gap-[5px] font-mono text-[10px] font-bold" style={{ color: "#84D2A5" }}>
            <Check className="h-[13px] w-[13px]" strokeWidth={2.5} aria-hidden />
            Fullført
          </span>
        )}
      </div>
    </div>
  );
}

// ── LiveActive — hoved-komponent ─────────────────────────────────────────────

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
      setDrills((prev) => prev.map((d) => (d.id === active.id ? { ...d, ...state } : d)));
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
        successRate:
          active.repsTotal > 0 ? Math.round((active.repsHit / active.repsTotal) * 100) : 0,
        notes: active.logNotes,
      });
    } catch (err) {
      console.error("[LiveActive] completeDrill feilet", err);
    } finally {
      setIsCompleting(false);
    }

    setDrills((prev) =>
      prev.map((d, i) => {
        if (d.id === active.id) return { ...d, status: "done" as const };
        if (i === activeIdx + 1) return { ...d, status: "active" as const };
        return d;
      }),
    );
    setDrillSec(0);
    setShowDrillLogger(false);
    vibrate([60, 40]);

    if (activeIdx === drills.length - 1) {
      await completeSession(data.sessionId, totalSec);
    }
  }, [active, activeIdx, data.sessionId, drills.length, isCompleting, totalSec]);

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

  if (showDrillLogger && active && activeState) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: LIVE_BG_GRADIENT }}
      >
        {/* Mini topbar for logger-overlay */}
        <header
          className="flex flex-shrink-0 items-center justify-between gap-4 px-5 py-3"
          style={{ paddingTop: "max(env(safe-area-inset-top) + 12px, 52px)" }}
        >
          <button
            type="button"
            onClick={() => setShowDrillLogger(false)}
            className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-background/60"
          >
            Tilbake
          </button>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
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
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        // Samme mørke forest-flate som resten av live-flyten (brief/logger/
        // oppsummering) — komponenten sto tidligere i lyse shadcn-tokens.
        background: LIVE_BG_GRADIENT,
        isolation: "isolate",
      }}
    >
      {/* Confirm-overlay */}
      <ConfirmOverlay
        show={showConfirm}
        onConfirm={() => {
          setShowConfirm(false);
          router.replace("/portal/planlegge");
        }}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Topbar */}
      <header
        className="flex flex-shrink-0 items-center justify-between border-b border-background/10 px-[18px] py-[10px]"
        style={{ paddingTop: "max(env(safe-area-inset-top) + 10px, 54px)" }}
      >
        <div>
          <div className="font-display text-[16px] font-bold leading-tight -tracking-[0.01em] text-background">
            {data.title}
          </div>
          <div className="mt-[2px] font-mono text-[9.5px] font-semibold text-background/60">
            {sessionMeta}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="rounded-full border border-destructive/20 bg-destructive/8 px-3 py-[6px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-destructive"
        >
          Avslutt
        </button>
      </header>

      {/* Scrollbart innhold */}
      <main className="flex flex-1 flex-col overflow-y-auto px-[14px] py-[14px]" style={{ minHeight: 0 }}>

        {/* Tom-tilstand: økt uten drills — ærlig melding + vei videre, i
            stedet for «Trykk Logg rep»-copy som pekte på en knapp som ikke
            fantes. */}
        {drills.length === 0 && (
          <div className="mb-[14px] rounded-[14px] border border-dashed border-background/20 p-[18px] text-center">
            <div className="font-display text-[17px] font-bold text-background">
              Ingen drills i denne økta
            </div>
            <p className="mt-[6px] text-[12.5px] leading-[1.5] text-background/60">
              Åpne økta i planen og legg til driller («Rediger økt»), så dukker
              de opp her — eller tren fritt og avslutt når du er ferdig.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/portal/planlegge/workbench")}
              className="mt-[14px] rounded-full border-none px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-accent-foreground"
              style={{ background: "var(--lime-500)" }}
            >
              Til planen
            </button>
          </div>
        )}

        {/* GoalProgress-kort */}
        {drills.length > 0 && (
        <div className="mb-[14px] rounded-[14px] border border-background/10 bg-background/5 p-[14px]">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-background/60">
              Fremdrift
            </span>
            <span className="font-mono text-[13px] font-semibold text-background">
              {completedCount}
              <small className="font-normal text-background/60"> / {drills.length} drills</small>
            </span>
          </div>
          {/* progress bar */}
          <div className="h-[10px] overflow-hidden rounded-full border border-background/10 bg-background/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, var(--forest-700), var(--lime-500))",
              }}
            />
          </div>
          <div className="mt-[7px] text-[12px] text-background/60">
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
        </div>

        {/* Alle drills ferdige — grønt banner */}
        {allDone && (
          <div
            className="mb-[14px] rounded-[14px] p-[18px] text-center"
            style={{ background: "var(--forest-700)" }}
          >
            <div className="font-display text-[20px] font-bold text-white">
              Alle drills fullført
            </div>
            <div className="mt-[6px] text-[13px] text-white/75">{data.title}</div>
            <button
              type="button"
              onClick={() => void completeSession(data.sessionId, totalSec)}
              className="mt-[14px] rounded-full border-none px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent-foreground"
              style={{ background: "var(--lime-500)" }}
            >
              Se oppsummering
            </button>
          </div>
        )}

        {/* Drill-kort */}
        <div className="flex flex-col gap-[10px]">
          {drills.map((drill) => (
            <ChallengeCard
              key={drill.id}
              drill={drill}
              onLogRep={drill.status === "active" ? handleLogRep : undefined}
            />
          ))}
        </div>

        {/* Neste opp — hint om neste drill i køen (matcher phq-live.jsx) */}
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
            <div className="mt-[10px] flex items-center gap-3 rounded-[14px] border border-background/10 bg-background/5 px-[14px] py-[11px]">
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.09em] text-background/45">
                  Neste opp
                </span>
                <span className="mt-[2px] block truncate text-[13.5px] font-semibold text-background">
                  {neste.name}
                </span>
              </span>
              {nesteMaal && (
                <span className="flex-shrink-0 font-mono text-[10.5px] text-background/60">{nesteMaal}</span>
              )}
            </div>
          );
        })()}

        {/* Fullfør aktiv drill — sticky-knapp */}
        {active && !allDone && (
          <button
            type="button"
            onClick={handleCompleteDrill}
            disabled={isCompleting}
            className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-full font-mono text-[12.5px] font-bold uppercase tracking-[0.04em] text-accent-foreground disabled:opacity-50"
            style={{ background: "var(--lime-500)" }}
          >
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            {activeIdx === drills.length - 1 ? "Fullfør økt" : "Fullfør drill"}
          </button>
        )}

        <div className="h-4" />
      </main>

      <LiveCoachPanel data={coachPanel} activeDrillId={active?.id ?? null} />
    </div>
  );
}
