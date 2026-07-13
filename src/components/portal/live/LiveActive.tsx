"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Plus } from "lucide-react";
import type { LiveV2Drill, LiveV2Session, DrillRepState, LiveCoachPanelData } from "./types";
import { plannedVolumText } from "./types";
import { DrillLogger } from "./DrillLogger";
import { SessionTimer } from "./SessionTimer";
import { LiveCoachPanel } from "./LiveCoachPanel";
import { useLiveMediaUpload } from "./useLiveMediaUpload";
import { NyOvelseArk } from "@/components/portal/v2/NyOvelseArk";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import { addDrillToLiveSession, completeDrill, completeSession, startSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

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
      <div className="w-full max-w-[320px] rounded-[20px] bg-card p-6">
        <div className="font-display text-[18px] font-bold text-foreground">
          Avslutt økt?
        </div>
        <p className="mt-2 mb-5 text-[13.5px] leading-[1.55] text-muted-foreground">
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
            style={{ background: "#005840" }}
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

  const progressPct = drill.plannedReps > 0 ? Math.min((drill.repsTotal / drill.plannedReps) * 100, 100) : 0;

  let cardClasses =
    "relative overflow-hidden rounded-[14px] border p-4 transition-all duration-200";
  if (isActive) {
    cardClasses +=
      " border-accent bg-card shadow-[0_0_0_4px_rgba(209,248,67,0.12)]";
    // lime border for active
  } else if (isDone) {
    cardClasses += " border-primary/30 bg-primary/4 opacity-90";
  } else {
    // queued
    cardClasses += " border-border bg-secondary/30 opacity-55";
  }

  return (
    <div className={cardClasses} style={isActive ? { borderColor: "#D1F843" } : undefined}>
      {/* Eyebrow */}
      <div className="mb-2 flex items-center gap-[6px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em] text-primary">
        <span className="h-[6px] w-[6px] rounded-full bg-accent" aria-hidden />
        {AXIS_LABEL[drill.pyramide] ?? drill.pyramide}
      </div>

      {/* Title */}
      <div className="mb-1 font-display text-[18px] font-bold leading-[1.15] -tracking-[0.02em] text-foreground">
        {drill.name}
      </div>

      {/* Planlagt rep-type + volum (bølge 2) — det coachen la inn */}
      {plannedVolumText(drill) && (
        <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Planlagt: {plannedVolumText(drill)}
        </div>
      )}

      {/* Fremdrift */}
      <div className="mb-[7px] flex items-center justify-between">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
          Fremdrift
        </span>
        <span className="font-mono text-[12px] font-semibold text-foreground">
          {drill.repsTotal}
          {drill.plannedReps > 0 && (
            <small className="font-normal text-muted-foreground"> / {drill.plannedReps}</small>
          )}
        </span>
      </div>

      {/* Progress bar — forest→lime gradient */}
      <div className="h-2 overflow-hidden rounded-full border border-border bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${isDone ? 100 : progressPct}%`,
            background: isDone
              ? "linear-gradient(90deg, #1A7D56, #005840)"
              : "linear-gradient(90deg, #005840, #D1F843)",
          }}
        />
      </div>

      {/* Status + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.06em]"
          style={{
            color: isActive ? "#005840" : isDone ? "#1A7D56" : "var(--muted-foreground)",
          }}
        >
          {isActive ? "Pågår" : isDone ? "Fullført" : isQueued ? "Venter" : ""}
        </span>

        {isActive && onLogRep && (
          <button
            type="button"
            onClick={onLogRep}
            className="rounded-full border-none px-5 py-[9px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-accent-foreground"
            style={{ background: "#D1F843" }}
          >
            Logg rep
          </button>
        )}

        {isDone && (
          <span className="flex items-center gap-[5px] font-mono text-[10px] font-bold text-success">
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
  // Bølge 5: feilsti for drill-lagring (feilfiks 3.1 — aldri stille datatap),
  // kommentar per drill, media-opplasting og «Ny øvelse i økta».
  const [lagreFeil, setLagreFeil] = useState<string | null>(null);
  const [drillNotes, setDrillNotes] = useState<Record<string, string>>({});
  const [nyOvelseApen, setNyOvelseApen] = useState(false);
  const [mediaMelding, setMediaMelding] = useState<string | null>(null);
  const filInputRef = useRef<HTMLInputElement>(null);

  const activeIdx = useMemo(() => drills.findIndex((d) => d.status === "active"), [drills]);
  const active = activeIdx >= 0 ? drills[activeIdx] : null;

  const media = useLiveMediaUpload({
    userId: coachPanel.userId,
    sessionId: data.sessionId,
    kind: "session-v2",
    drillId: active?.id ?? null,
  });

  // Ny drill lagt til (router.refresh etter addDrillToLiveSession) → flett inn
  // nye driller uten å røre lokal rep-state for de som alt er i gang.
  const [forrigeData, setForrigeData] = useState(data);
  if (forrigeData !== data) {
    setForrigeData(data);
    if (data.drills.length !== drills.length) {
      setDrills((prev) => {
        const kjent = new Map(prev.map((d) => [d.id, d]));
        const neste = buildInitialDrills(data).map((d) => kjent.get(d.id) ?? d);
        if (!neste.some((d) => d.status === "active")) {
          const forsteVentende = neste.find((d) => d.status === "queued");
          if (forsteVentende) forsteVentende.status = "active";
        }
        return neste;
      });
    }
  }

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
    setLagreFeil(null);
    vibrate(40);

    // Feilfiks 3.1 (2026-07-13): drillen markeres KUN ferdig når serveren har
    // lagret loggen. Tidligere gikk flyten videre (og økta ble fullført) selv
    // når completeDrill feilet — repsene forsvant stille.
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
        notes: drillNotes[active.id]?.trim() || undefined,
      });
    } catch (err) {
      console.error("[LiveActive] completeDrill feilet", err);
      setLagreFeil("Fikk ikke lagret repsene — sjekk nettet og prøv igjen. Ingenting er mistet.");
      setIsCompleting(false);
      vibrate([80, 60, 80]);
      return;
    }
    setIsCompleting(false);

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
      await completeSession(data.sessionId, totalSec + drillSec);
    }
  }, [active, activeIdx, data.sessionId, drills.length, isCompleting, totalSec, drillSec, drillNotes]);

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

  const sessionMeta = [
    data.title,
    drills.length > 0
      ? `${completedCount} / ${drills.length} drills`
      : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  // Alle drills ferdige — vis ferdigmelding.
  const allDone = completedCount === drills.length && drills.length > 0;

  if (showDrillLogger && active && activeState) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "radial-gradient(120% 80% at 50% 0%, #0d2218, #0A1F17 70%)" }}
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
          {lagreFeil && (
            <div role="alert" className="mx-4 mt-3 rounded-lg border border-destructive/40 bg-destructive/15 px-4 py-2 text-[13px] text-background">
              {lagreFeil}
            </div>
          )}
          <DrillLogger
            drill={active}
            state={activeState}
            onChange={handleDrillChange}
            onComplete={handleCompleteDrill}
            isLast={activeIdx === drills.length - 1}
            completedCount={completedCount}
            totalCount={drills.length}
            notes={drillNotes[active.id] ?? ""}
            onNotesChange={(v) => setDrillNotes((prev) => ({ ...prev, [active.id]: v }))}
          />
        </main>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: "var(--background)", isolation: "isolate" }}
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
        className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-[18px] py-[10px]"
        style={{ paddingTop: "max(env(safe-area-inset-top) + 10px, 54px)" }}
      >
        <div>
          <div className="font-display text-[16px] font-bold leading-tight -tracking-[0.01em] text-foreground">
            {data.title}
          </div>
          <div className="mt-[2px] font-mono text-[9.5px] font-semibold text-muted-foreground">
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

        {/* GoalProgress-kort */}
        <div className="mb-[14px] rounded-[14px] border border-border bg-card p-[14px] shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Fremdrift
            </span>
            <span className="font-mono text-[13px] font-semibold text-foreground">
              {completedCount}
              <small className="font-normal text-muted-foreground"> / {drills.length} drills</small>
            </span>
          </div>
          {/* progress bar */}
          <div className="h-[10px] overflow-hidden rounded-full border border-border bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #005840, #D1F843)",
              }}
            />
          </div>
          <div className="mt-[7px] text-[12px] text-muted-foreground">
            {allDone
              ? "Alle drills fullført — flott innsats!"
              : completedCount > 0
              ? `Drill ${completedCount + 1} av ${drills.length} pågår`
              : "Trykk «Logg rep» for å begynne"}
          </div>
        </div>

        {/* Timer */}
        <div className="mb-[14px]">
          <SessionTimer
            seconds={totalSec}
            paused={paused}
            onTogglePause={togglePause}
            label="Økt-tid"
            variant="light"
          />
        </div>

        {/* Verktøyrad (Bølge 5): bilde/video · TrackMan-import · ny øvelse */}
        <div className="mb-[14px] flex flex-wrap items-center gap-2">
          <input
            ref={filInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const fil = e.target.files?.[0];
              e.target.value = "";
              if (!fil) return;
              setMediaMelding(null);
              void media.last(fil).then((res) => {
                setMediaMelding(
                  res.ok
                    ? fil.type.startsWith("image/")
                      ? "Bildet er lagt ved økten."
                      : "Videoen er lagt ved økten."
                    : res.error,
                );
              });
            }}
          />
          <button
            type="button"
            disabled={media.busy}
            onClick={() => filInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-foreground disabled:opacity-50"
          >
            <ImagePlus className="h-[14px] w-[14px]" strokeWidth={2} aria-hidden />
            {media.busy ? "Laster opp…" : "Bilde/video"}
          </button>
          <TrackmanImportModal
            variant="secondary"
            label="TrackMan"
            className="!rounded-full !px-4 !py-2 !font-mono !text-[10.5px] !font-bold !uppercase !tracking-[0.06em]"
            onAttachImageFallback={async (fil) => {
              const res = await media.last(fil);
              if (res.ok) setMediaMelding("Skjermbildet er lagt ved økten som bilde.");
              return res;
            }}
          />
          <button
            type="button"
            onClick={() => setNyOvelseApen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-foreground"
          >
            <Plus className="h-[14px] w-[14px]" strokeWidth={2} aria-hidden />
            Ny øvelse
          </button>
        </div>

        {(mediaMelding || media.feil || lagreFeil) && (
          <div className="mb-[14px] rounded-lg border border-border bg-card px-4 py-2 text-[13px] text-foreground">
            {lagreFeil ?? media.feil ?? mediaMelding}
          </div>
        )}

        {/* Alle drills ferdige — grønt banner */}
        {allDone && (
          <div
            className="mb-[14px] rounded-[14px] p-[18px] text-center"
            style={{ background: "#005840" }}
          >
            <div className="font-display text-[20px] font-bold text-white">
              Alle drills fullført
            </div>
            <div className="mt-[6px] text-[13px] text-white/75">{data.title}</div>
            <button
              type="button"
              onClick={() => void completeSession(data.sessionId, totalSec)}
              className="mt-[14px] rounded-full border-none px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-accent-foreground"
              style={{ background: "#D1F843" }}
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

        {/* Fullfør aktiv drill — sticky-knapp */}
        {active && !allDone && (
          <button
            type="button"
            onClick={handleCompleteDrill}
            disabled={isCompleting}
            className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-full font-mono text-[12.5px] font-bold uppercase tracking-[0.04em] text-accent-foreground disabled:opacity-50"
            style={{ background: "#D1F843" }}
          >
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            {activeIdx === drills.length - 1 ? "Fullfør økt" : "Fullfør drill"}
          </button>
        )}

        <div className="h-4" />
      </main>

      {/* «Ny øvelse» (Bølge 5): opprett i banken → koble rett inn i økta. */}
      {nyOvelseApen && (
        <NyOvelseArk
          defaultAkse={(active?.pyramide as "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN" | undefined) ?? "TEK"}
          onLukk={() => setNyOvelseApen(false)}
          onOpprettet={(ovelse) => {
            void addDrillToLiveSession({ sessionId: data.sessionId, exerciseId: ovelse.id }).then((res) => {
              if (res.ok) {
                setMediaMelding(`«${ovelse.name}» er lagt til i økten.`);
                router.refresh();
              } else {
                setMediaMelding(res.error ?? "Kunne ikke legge øvelsen i økten.");
              }
            });
          }}
        />
      )}

      <LiveCoachPanel data={coachPanel} activeDrillId={active?.id ?? null} />
    </div>
  );
}
