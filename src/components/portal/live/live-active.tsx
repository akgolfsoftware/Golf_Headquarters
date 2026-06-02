"use client";

/**
 * PlayerHQ · Live-økt — Aktiv drill (skjerm 2) + drill-overgang (skjerm 3).
 *
 * Fullscreen forest-flate (#005840), cream tekst, lime accent. Det viktigste
 * skjermbildet: stor mono-timer (lime), rep-tracker, tre sirkulære rep-knapper
 * (+5/+10/+25, 56px), logg-rad (Video/Foto/Notat), drill-progresjon. Mellom
 * hver drill vises en feirende overgangs-vy (KPI 2x2 + neste drill).
 *
 * Offline-først: faktiske reps + tid holdes klient-side. Ved siste drill
 * navigeres til /summary. Persistering til trainingPlanSessionLog skjer der.
 *
 * Touch-targets ≥ 56px på rep-knapper, ≥ 48px ellers. Ingen tekst < 14px.
 * Animasjoner gates av prefers-reduced-motion via CSS i globals (motion-safe).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  Check,
  FileText,
  Pause,
  Play,
  Undo2,
  Video,
  X,
} from "lucide-react";
import type { LiveDrill, LiveSessionData } from "@/lib/portal-live/types";
import { fmtMSS } from "@/lib/portal-live/format";
import { AXIS_SHORT, axisDotColor } from "./axis";
import { writeLiveSnapshot } from "./snapshot";
import { useLiveAutosave, type LiveSnapshotContent } from "./use-live-autosave";
import {
  startSession,
  pauseLiveSession,
  resumeLiveSession,
  abandonLiveSession,
} from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

type Phase = "active" | "transition";

type DrillState = LiveDrill & {
  reps: number;
  elapsedSec: number;
  status: "done" | "active" | "queued";
};

/** Bygg initial drill-state fra plan + ev. lagret snapshot (gjenoppta). */
function buildInitialDrills(data: LiveSessionData): DrillState[] {
  const snap = data.liveSnapshot;
  const drills: DrillState[] = data.drills.map((d, i) => {
    const s = snap?.drills.find((x) => x.drillId === d.id);
    return {
      ...d,
      reps: s?.reps ?? 0,
      elapsedSec: s?.elapsedSec ?? 0,
      status: s?.status ?? (i === 0 ? "active" : "queued"),
    };
  });
  // Normaliser: sørg for nøyaktig én aktiv drill hvis det finnes ikke-ferdige.
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

export function LiveActive({ data }: { data: LiveSessionData }) {
  const router = useRouter();

  const [drills, setDrills] = useState<DrillState[]>(() => buildInitialDrills(data));
  const [phase, setPhase] = useState<Phase>("active");
  const [paused, setPaused] = useState(data.status === "PAUSED");
  const [totalSec, setTotalSec] = useState(data.liveSnapshot?.totalSec ?? 0);
  const [drillSec, setDrillSec] = useState(0);

  const activeIdx = drills.findIndex((d) => d.status === "active");
  const active = activeIdx >= 0 ? drills[activeIdx] : null;

  // Bygg gjeldende snapshot-innhold (uten tidsstempel — settes ved sending).
  const buildSnapshotContent = useCallback(
    (): LiveSnapshotContent => ({
      startedAtISO: data.liveSnapshot?.startedAtISO ?? new Date().toISOString(),
      totalSec,
      drills: drills.map((d) => ({
        drillId: d.id,
        reps: d.reps,
        elapsedSec: d.elapsedSec,
        status: d.status,
      })),
    }),
    [data.liveSnapshot?.startedAtISO, totalSec, drills],
  );

  // Aktiver økta ved mount (brief→active). Statusbevisst + idempotent re-mount.
  const activatedRef = useRef(false);
  useEffect(() => {
    if (activatedRef.current) return;
    activatedRef.current = true;
    let cancelled = false;
    void startSession(data.sessionId).then((res) => {
      if (cancelled) return;
      if (res.state === "completed" || res.state === "abandoned") {
        router.replace(res.redirectTo);
      } else if (res.state === "paused") {
        setPaused(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [data.sessionId, router]);

  // Auto-save hvert 60. sekund (per-økt, ryddes på unmount).
  useLiveAutosave({
    sessionId: data.sessionId,
    enabled: true,
    getSnapshot: buildSnapshotContent,
  });

  // Pause/gjenoppta — persisterer til DB.
  const pauseNow = useCallback(() => {
    setPaused(true);
    void pauseLiveSession(data.sessionId, {
      ...buildSnapshotContent(),
      updatedAtISO: new Date().toISOString(),
    });
  }, [data.sessionId, buildSnapshotContent]);

  const resumeNow = useCallback(() => {
    setPaused(false);
    void resumeLiveSession(data.sessionId);
  }, [data.sessionId]);

  const togglePause = useCallback(() => {
    if (paused) resumeNow();
    else pauseNow();
  }, [paused, resumeNow, pauseNow]);

  // Forlat økta (terminal) — fryser delvis logg, status ABANDONED.
  const handleAbandon = useCallback(() => {
    void abandonLiveSession(data.sessionId).finally(() => router.push("/portal/tren"));
  }, [data.sessionId, router]);

  // Avslutt uten å fullføre (resumbart) — pauser og går hjem.
  const handleExit = useCallback(() => {
    pauseNow();
    router.push("/portal/tren");
  }, [pauseNow, router]);

  // Tidtaker — total + aktiv drill. Stopper ved pause / overgang.
  useEffect(() => {
    if (paused || phase !== "active") return;
    const id = setInterval(() => {
      setTotalSec((t) => t + 1);
      setDrillSec((d) => d + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [paused, phase]);

  // Wake-lock — hold skjermen våken under aktiv økt (best-effort).
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
        /* wake-lock ikke tilgjengelig — ignorer */
      }
    }
    acquire();
    return () => {
      cancelled = true;
      wakeRef.current?.release().catch(() => {});
      wakeRef.current = null;
    };
  }, []);

  const doneCount = drills.filter((d) => d.status === "done").length;
  const overallPct = drills.length > 0 ? (doneCount / drills.length) * 100 : 0;

  const repPct = useMemo(() => {
    if (!active || active.plannedReps <= 0) return 0;
    return Math.min(100, (active.reps / active.plannedReps) * 100);
  }, [active]);

  const overCompliance = !!active && active.plannedReps > 0 && active.reps > active.plannedReps;

  const addReps = useCallback(
    (n: number) => {
      if (!active) return;
      vibrate(20);
      setDrills((prev) =>
        prev.map((d) => (d.id === active.id ? { ...d, reps: Math.max(0, d.reps + n) } : d)),
      );
    },
    [active],
  );

  // Markér aktiv drill ferdig, lagre brukt tid, vis overgang.
  const finishDrill = useCallback(() => {
    if (!active) return;
    vibrate([15, 50, 30]);
    setDrills((prev) =>
      prev.map((d) => (d.id === active.id ? { ...d, status: "done", elapsedSec: drillSec } : d)),
    );
    setPhase("transition");
  }, [active, drillSec]);

  // Flush snapshot til DB + skriv klient-fallback, så gå til oppsummering.
  const goToSummary = useCallback(async () => {
    const content = buildSnapshotContent();
    writeLiveSnapshot({
      sessionId: data.sessionId,
      totalSec,
      videoCount: 0,
      drills: content.drills,
    });
    try {
      await fetch(`/api/portal/live/${data.sessionId}/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...content, updatedAtISO: new Date().toISOString() }),
        keepalive: true,
      });
    } catch {
      /* offline — sessionStorage dekker overgangen */
    }
    router.push(`/portal/live/${data.sessionId}/summary`);
  }, [data.sessionId, totalSec, buildSnapshotContent, router]);

  // Fra overgang → start neste drill (eller summary hvis ingen flere).
  const startNext = useCallback(() => {
    const hasNext = drills.some((d) => d.status === "queued");
    if (!hasNext) {
      goToSummary();
      return;
    }
    setDrills((prev) => {
      const idx = prev.findIndex((d) => d.status === "queued");
      if (idx === -1) return prev;
      return prev.map((d, i) => (i === idx ? { ...d, status: "active" } : d));
    });
    setDrillSec(0);
    setPhase("active");
  }, [drills, goToSummary]);

  // Topbar X / generelt avbryt: pause og gå hjem (resumbart).
  const handleCancel = handleExit;

  // ── Tomt: ingen drills i økta ────────────────────────────────────
  if (drills.length === 0) {
    return (
      <Shell title={data.title} onCancel={handleCancel}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-[15px] text-background/70">Ingen drills lagt til i denne økta.</p>
          <button
            type="button"
            onClick={() => router.push(`/portal/live/${data.sessionId}/brief`)}
            className="inline-flex h-14 items-center justify-center rounded-full border border-background/40 px-8 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-background"
          >
            Tilbake til brief
          </button>
        </div>
      </Shell>
    );
  }

  // ── Alle drills ferdige ──────────────────────────────────────────
  if (!active && phase === "active") {
    return (
      <Shell title={data.title} onCancel={handleCancel}>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <span
            className="grid h-[72px] w-[72px] place-items-center rounded-full bg-accent text-primary"
            style={{ boxShadow: "0 0 0 8px hsl(var(--accent) / 0.16)" }}
          >
            <Check className="h-9 w-9" strokeWidth={3} aria-hidden />
          </span>
          <h1 className="font-display text-[28px] font-bold -tracking-[0.02em] text-background">
            Alle drills ferdige
          </h1>
          <button
            type="button"
            onClick={goToSummary}
            className="inline-flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-accent px-8 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-accent-foreground"
          >
            Til oppsummering
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </Shell>
    );
  }

  // ── Drill-overgang (skjerm 3) ────────────────────────────────────
  if (phase === "transition" && activeIdx === -1) {
    const lastDone = [...drills].reverse().find((d) => d.status === "done");
    const next = drills.find((d) => d.status === "queued") ?? null;
    return (
      <Transition
        data={data}
        finished={lastDone}
        next={next}
        doneCount={doneCount}
        totalDrills={drills.length}
        onStartNext={startNext}
        onPause={handleExit}
        onCancel={handleCancel}
      />
    );
  }

  if (!active) return null;

  // ── Aktiv drill (skjerm 2) ───────────────────────────────────────
  return (
    <Shell
      title={data.title}
      onCancel={handleCancel}
      crumb={`DRILL ${active.index} AV ${drills.length}`}
      onPauseToggle={togglePause}
      paused={paused}
    >
      {/* drill-progresjon (hele økta) */}
      <div className="px-5 pt-3">
        <div className="h-1 overflow-hidden rounded-full bg-background/15">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${overallPct}%`, boxShadow: "0 0 8px hsl(var(--accent) / 0.5)" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-8 pt-6">
        {/* drill-hero */}
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-6 items-center gap-1.5 rounded-full bg-background/10 px-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em]"
              style={{ color: axisDotColor(active.axis) }}
            >
              <span
                className="h-1.5 w-1.5 rounded-sm"
                style={{ background: axisDotColor(active.axis) }}
              />
              {AXIS_SHORT[active.axis]}
            </span>
            {active.lPhase && (
              <span className="inline-flex h-6 items-center rounded-full bg-background/10 px-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-background/60">
                {active.lPhase}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-[30px] font-bold leading-[1.08] -tracking-[0.02em] text-background">
            {active.name}
          </h1>
        </div>

        {/* TIMER */}
        <div className="flex flex-col items-center py-2">
          <div
            className="font-mono text-[80px] font-extrabold leading-none tabular-nums text-accent"
            style={{ letterSpacing: "-0.03em" }}
            aria-label={`Drill-tid ${fmtMSS(drillSec)}`}
          >
            {fmtMSS(drillSec)}
          </div>
          <div className="mt-3 font-mono text-[14px] font-semibold tabular-nums text-background/60">
            TOTAL <span className="text-background">{fmtMSS(totalSec)}</span>
          </div>
        </div>

        {/* REP-TRACKER */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[12px] font-extrabold uppercase tracking-[0.10em] text-background/70">
              Reps
            </span>
            <span
              className={`font-mono text-[22px] font-extrabold tabular-nums ${
                overCompliance ? "animate-pulse text-accent" : "text-accent"
              }`}
            >
              {active.reps}
              <span className="text-background/50"> / {active.plannedReps || "—"}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background/15">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${repPct}%` }}
              />
            </div>
            <span className="w-12 text-right font-mono text-[13px] font-bold tabular-nums text-background/70">
              {Math.round(repPct)} %
            </span>
          </div>

          {/* tre sirkulære rep-knapper +5/+10/+25 (56px) */}
          <div className="mt-2 flex items-center justify-center gap-6">
            {[5, 10, 25].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => addReps(n)}
                aria-label={`Legg til ${n} reps`}
                className="grid h-14 w-14 place-items-center rounded-full bg-accent font-mono text-[18px] font-extrabold tabular-nums text-accent-foreground transition-transform active:scale-95"
                style={{ boxShadow: "0 6px 16px hsl(var(--accent) / 0.3)" }}
              >
                +{n}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addReps(-1)}
            className="mx-auto inline-flex h-11 items-center gap-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-background/55 hover:text-background"
          >
            <Undo2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            1 rep angre
          </button>
        </div>

        {/* LOGG-RAD: Video / Foto / Notat (48px+) */}
        <div className="grid grid-cols-3 gap-3">
          <LogButton icon={<Video className="h-6 w-6" strokeWidth={1.5} aria-hidden />} label="Video" />
          <LogButton icon={<Camera className="h-6 w-6" strokeWidth={1.5} aria-hidden />} label="Foto" />
          <LogButton icon={<FileText className="h-6 w-6" strokeWidth={1.5} aria-hidden />} label="Notat" />
        </div>
      </div>

      {/* FOOTER: neste + ferdig-pill */}
      <Footer
        next={drills.find((d) => d.status === "queued") ?? null}
        primaryLabel="Ferdig med drill"
        onPrimary={finishDrill}
      />

      {/* PAUSE-overlay */}
      {paused && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-8"
          style={{ background: "hsl(var(--primary) / 0.92)", backdropFilter: "blur(4px)" }}
        >
          <span className="font-mono text-[12px] font-extrabold uppercase tracking-[0.14em] text-accent">
            Pause
          </span>
          <button
            type="button"
            onClick={resumeNow}
            className="inline-flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-accent px-8 font-mono text-[14px] font-extrabold uppercase tracking-[0.08em] text-accent-foreground"
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={2.5} aria-hidden />
            Fortsett
          </button>
          <button
            type="button"
            onClick={handleAbandon}
            className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-background/60 hover:text-background"
          >
            Avbryt økt
          </button>
        </div>
      )}
    </Shell>
  );
}

// ── Drill-overgang-vy (skjerm 3) ──────────────────────────────────────

function Transition({
  data,
  finished,
  next,
  doneCount,
  totalDrills,
  onStartNext,
  onPause,
  onCancel,
}: {
  data: LiveSessionData;
  finished: DrillState | undefined;
  next: DrillState | null;
  doneCount: number;
  totalDrills: number;
  onStartNext: () => void;
  onPause: () => void;
  onCancel: () => void;
}) {
  const pct = totalDrills > 0 ? (doneCount / totalDrills) * 100 : 0;
  const reps = finished?.reps ?? 0;
  const planned = finished?.plannedReps ?? 0;
  const repDelta = planned > 0 ? reps - planned : 0;
  const compliance = planned > 0 ? Math.round((reps / planned) * 100) : null;
  const drillTime = fmtMSS(finished?.elapsedSec ?? 0);

  return (
    <Shell title={data.title} onCancel={onCancel} crumb="DRILL FULLFØRT">
      <div className="px-5 pt-3">
        <div className="h-1 overflow-hidden rounded-full bg-background/15">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%`, boxShadow: "0 0 8px hsl(var(--accent) / 0.5)" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-8 pt-6">
        {/* hero med sjekkmark */}
        <div className="flex flex-col items-center text-center">
          <span
            className="grid h-[72px] w-[72px] place-items-center rounded-full bg-accent text-primary"
            style={{ boxShadow: "0 0 0 8px hsl(var(--accent) / 0.16)" }}
          >
            <Check className="h-9 w-9" strokeWidth={3} aria-hidden />
          </span>
          {finished && (
            <span className="mt-4 font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
              {AXIS_SHORT[finished.axis]} · {finished.name}
            </span>
          )}
          <h1 className="mt-2 font-display text-[34px] font-bold leading-[1.05] -tracking-[0.02em] text-background">
            <em className="font-normal not-italic">Ferdig</em> med drill {finished?.index ?? ""}
          </h1>
        </div>

        {/* KPI 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <KpiTile
            label="Reps"
            value={`${reps}${planned > 0 ? ` / ${planned}` : ""}`}
            sub={
              planned > 0
                ? repDelta >= 0
                  ? `↑ +${repDelta} over plan`
                  : `${repDelta} under plan`
                : "logget"
            }
            subTone={planned > 0 ? (repDelta >= 0 ? "up" : "down") : "flat"}
          />
          <KpiTile label="Tid" value={drillTime} sub="brukt" subTone="flat" />
          <KpiTile
            label="Compliance"
            value={compliance != null ? `${compliance} %` : "—"}
            sub={compliance != null ? (compliance >= 100 ? "↑ over mål" : "av mål") : "ingen mål"}
            subTone={compliance != null ? (compliance >= 100 ? "up" : compliance >= 70 ? "flat" : "down") : "flat"}
          />
          <KpiTile
            label="Drills"
            value={`${doneCount} / ${totalDrills}`}
            sub="fullført"
            subTone="flat"
          />
        </div>

        {/* neste drill */}
        {next && (
          <div>
            <div className="mb-2 font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-background/60">
              Neste drill
            </div>
            <DrillRow drill={next} />
          </div>
        )}
      </div>

      <Footer
        next={null}
        primaryLabel={next ? "Start neste drill" : "Til oppsummering"}
        onPrimary={onStartNext}
        secondary={
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onPause}
              className="inline-flex h-12 items-center justify-center rounded-full border border-background/30 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-background/80"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={onStartNext}
              className="inline-flex h-12 items-center justify-center rounded-full border border-background/30 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-background/80"
            >
              Hopp over
            </button>
          </div>
        }
      />
    </Shell>
  );
}

// ── Delte byggeklosser ────────────────────────────────────────────────

/** Fullscreen forest-shell med topbar (cancel + crumb + pause). */
function Shell({
  title,
  crumb,
  onCancel,
  onPauseToggle,
  paused,
  children,
}: {
  title: string;
  crumb?: string;
  onCancel: () => void;
  onPauseToggle?: () => void;
  paused?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-primary text-background" style={{ isolation: "isolate" }}>
      {/* topbar */}
      <header
        className="flex flex-shrink-0 items-center justify-between gap-3 px-4"
        style={{
          height: 60,
          paddingTop: "max(env(safe-area-inset-top), 8px)",
          borderBottom: "1px solid hsl(var(--background) / 0.1)",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Avbryt økt"
          className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </button>
        <span className="truncate text-center font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-background/80">
          {crumb ?? title}
        </span>
        {onPauseToggle ? (
          <button
            type="button"
            onClick={onPauseToggle}
            aria-label={paused ? "Fortsett økt" : "Pause økt"}
            className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
          >
            {paused ? (
              <Play className="h-[18px] w-[18px] fill-current" strokeWidth={2} aria-hidden />
            ) : (
              <Pause className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            )}
          </button>
        ) : (
          <span className="h-11 w-11 flex-shrink-0" aria-hidden />
        )}
      </header>

      {/* scrollbart innhold */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

function Footer({
  next,
  primaryLabel,
  onPrimary,
  secondary,
}: {
  next: DrillState | null;
  primaryLabel: string;
  onPrimary: () => void;
  secondary?: React.ReactNode;
}) {
  return (
    <footer
      className="mt-auto flex-shrink-0 px-5 pt-4"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
        borderTop: "1px solid hsl(var(--background) / 0.1)",
        background: "hsl(var(--primary))",
      }}
    >
      {next && (
        <div className="mb-3 truncate font-mono text-[11px] font-bold uppercase tracking-[0.10em] text-background/55">
          Neste: {AXIS_SHORT[next.axis]} · {next.name}
          {next.plannedReps > 0 ? ` · ${next.plannedReps} reps` : ""}
        </div>
      )}
      <button
        type="button"
        onClick={onPrimary}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-[14px] font-extrabold uppercase tracking-[0.08em] text-accent-foreground"
        style={{ boxShadow: "0 4px 16px hsl(var(--accent) / 0.28)" }}
      >
        {primaryLabel}
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </button>
      {secondary}
    </footer>
  );
}

function LogButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex h-[68px] flex-col items-center justify-center gap-1 rounded-xl bg-background/[0.07] text-background/80 transition-colors hover:bg-background/10 active:scale-[0.98]"
    >
      {icon}
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em]">{label}</span>
    </button>
  );
}

function KpiTile({
  label,
  value,
  sub,
  subTone,
}: {
  label: string;
  value: string;
  sub: string;
  subTone: "up" | "down" | "flat";
}) {
  const subColor =
    subTone === "up" ? "text-accent" : subTone === "down" ? "text-destructive" : "text-background/55";
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-background/[0.07] px-4 py-4">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/50">
        {label}
      </span>
      <span className="font-mono text-[26px] font-extrabold leading-none tabular-nums text-accent">
        {value}
      </span>
      <span className={`font-mono text-[11px] font-semibold ${subColor}`}>{sub}</span>
    </div>
  );
}

function DrillRow({ drill }: { drill: DrillState }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/[0.07] px-4 py-4">
      <span
        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg font-mono text-[13px] font-extrabold text-primary"
        style={{ background: axisDotColor(drill.axis) }}
      >
        {drill.index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-background/55">
          {AXIS_SHORT[drill.axis]}
        </div>
        <div className="truncate font-display text-[16px] font-semibold -tracking-[0.01em] text-background">
          {drill.name}
        </div>
      </div>
      <div className="flex-shrink-0 text-right font-mono text-[13px] font-bold tabular-nums text-background/70">
        {drill.repsLabel}
      </div>
    </div>
  );
}
