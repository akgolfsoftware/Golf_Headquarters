"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Dot,
  FileText,
  HelpCircle,
  Pause,
  Play,
  Plus,
  Video,
} from "lucide-react";

type Pyr = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type LiveDrillV2 = {
  id: string;
  index: number;
  name: string;
  pyramidArea: Pyr;
  lPhase?: string | null;
  status: "done" | "active" | "queued";
  target: { dry: number; lav: number; full: number };
  counts: { dry: number; lav: number; full: number };
};

type RepKind = "dry" | "lav" | "full";

const PYR_TONE: Record<Pyr, { bg: string; text: string; tile: string }> = {
  FYS: { bg: "bg-[rgba(0,88,64,0.13)]", text: "text-[#005840]", tile: "bg-[#005840]" },
  TEK: { bg: "bg-[rgba(26,125,86,0.13)]", text: "text-[#1A7D56]", tile: "bg-[#1A7D56]" },
  SLAG: { bg: "bg-[rgba(209,248,67,0.55)]", text: "text-[#0A1F17]", tile: "bg-[#D1F843] text-[#0A1F17]" },
  SPILL: { bg: "bg-[rgba(184,133,42,0.13)]", text: "text-[#B8852A]", tile: "bg-[#B8852A]" },
  TURN: { bg: "bg-[rgba(94,92,87,0.13)]", text: "text-[#5E5C57]", tile: "bg-[#5E5C57]" },
};

function vibrate(pattern: number | number[]) {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }).vibrate?.(pattern);
    } catch {
      /* ignore */
    }
  }
}

function fmtMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveActiveV2Client({
  sessionId,
  drills: initialDrills,
}: {
  sessionId: string;
  drills: LiveDrillV2[];
}) {
  const [drills, setDrills] = useState<LiveDrillV2[]>(initialDrills);
  const [activeKind, setActiveKind] = useState<RepKind>("dry");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);

  const activeIdx = drills.findIndex((d) => d.status === "active");
  const active = activeIdx >= 0 ? drills[activeIdx] : null;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const totalsPlanned = useMemo(
    () =>
      drills.reduce(
        (acc, d) => acc + d.target.dry + d.target.lav + d.target.full,
        0,
      ),
    [drills],
  );
  const totalsDone = useMemo(
    () =>
      drills.reduce(
        (acc, d) => acc + d.counts.dry + d.counts.lav + d.counts.full,
        0,
      ),
    [drills],
  );
  const overallPct = totalsPlanned > 0 ? (totalsDone / totalsPlanned) * 100 : 0;

  function addReps(n: number) {
    if (!active) return;
    vibrate(20);
    setDrills((prev) =>
      prev.map((d) =>
        d.id === active.id
          ? { ...d, counts: { ...d.counts, [activeKind]: d.counts[activeKind] + n } }
          : d,
      ),
    );
  }

  function finishDrill() {
    if (!active) return;
    vibrate([15, 50, 30]);
    setDrills((prev) => {
      const idx = prev.findIndex((d) => d.id === active.id);
      const next = [...prev];
      next[idx] = { ...next[idx], status: "done" };
      // promote next queued to active
      for (let i = idx + 1; i < next.length; i++) {
        if (next[i].status === "queued") {
          next[i] = { ...next[i], status: "active" };
          break;
        }
      }
      return next;
    });
    setActiveKind("dry");
  }

  if (!active) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[640px] space-y-6 px-4 py-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#2C7D52]" strokeWidth={1.5} />
          <h1 className="font-display text-[28px] font-medium -tracking-[0.02em] text-foreground">
            Alle drills er ferdige
          </h1>
          <p className="font-sans text-[14px] text-muted-foreground">
            Gå videre til oppsummering for å sende økten til Anders.
          </p>
          <Link
            href={`/portal/live/${sessionId}/summary`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 font-display text-[16px] font-semibold text-accent-foreground"
          >
            Til oppsummering
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    );
  }

  const tone = PYR_TONE[active.pyramidArea];
  const activeTarget = active.target[activeKind];
  const activeCount = active.counts[activeKind];
  const activePct =
    activeTarget > 0 ? Math.min(100, (activeCount / activeTarget) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-[120px]">
      {/* TOPBAR — sticky */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[920px] items-center justify-between gap-3 px-4 py-3">
          <Link
            href={`/portal/live/${sessionId}/brief`}
            className="inline-flex h-9 items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Brief
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 font-mono text-[12px] font-semibold tabular-nums text-foreground hover:border-foreground/30"
            >
              {running ? (
                <Pause className="h-3.5 w-3.5" strokeWidth={2} />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" strokeWidth={2} />
              )}
              {fmtMSS(elapsed)}
            </button>
            <Link
              href={`/portal/live/${sessionId}/summary`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-foreground"
            >
              Fullfør
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
        {/* Total progress */}
        <div className="mx-auto max-w-[920px] px-4 pb-2">
          <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            <span>
              Total · {totalsDone} / {totalsPlanned} reps
            </span>
            <span>{Math.round(overallPct)}%</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[920px] space-y-5 px-4 py-5">
        {/* DRILL-PROGRESJON STRIP */}
        <section>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {drills.map((d) => {
              const t = PYR_TONE[d.pyramidArea];
              return (
                <div
                  key={d.id}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-colors ${
                    d.status === "active"
                      ? "border-primary bg-card"
                      : d.status === "done"
                        ? "border-border bg-secondary/30"
                        : "border-border bg-card opacity-60"
                  }`}
                >
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-full font-mono text-[11px] font-bold text-white ${t.tile}`}
                  >
                    {d.status === "done" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      String(d.index).padStart(2, "0")
                    )}
                  </div>
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                    {d.status === "done" ? "Ferdig" : d.status === "active" ? "Aktiv" : "Neste"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AKTIV DRILL */}
        <section className="rounded-2xl border-2 border-primary bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10.5px] font-bold tracking-[0.06em] ${tone.bg} ${tone.text}`}
                >
                  {active.pyramidArea}
                </span>
                {active.lPhase && (
                  <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                    {active.lPhase}
                  </span>
                )}
                <span className="font-mono text-[10.5px] text-muted-foreground">
                  Drill {active.index} av {drills.length}
                </span>
              </div>
              <h2 className="mt-2 font-display text-[22px] font-medium leading-[1.15] -tracking-[0.01em] text-foreground sm:text-[26px]">
                {active.name}
              </h2>
            </div>
          </div>

          {/* TRE REP-TELLERE */}
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {(["dry", "lav", "full"] as RepKind[]).map((kind) => {
              const label =
                kind === "dry"
                  ? "Dry-swing"
                  : kind === "lav"
                    ? "Lav"
                    : "Full";
              const t = active.target[kind];
              const c = active.counts[kind];
              const isActive = activeKind === kind;
              const pct = t > 0 ? Math.min(100, (c / t) * 100) : 0;
              return (
                <button
                  key={kind}
                  onClick={() => {
                    vibrate(10);
                    setActiveKind(kind);
                  }}
                  className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                    isActive
                      ? "border-primary bg-[rgba(0,88,64,0.05)] shadow-md"
                      : "border-border bg-secondary/20 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    {label}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[26px] font-semibold tabular-nums text-foreground sm:text-[30px]">
                      {c}
                    </span>
                    <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
                      / {t || "—"}
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all ${isActive ? "bg-primary" : "bg-muted-foreground/40"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* STORE TOUCHTARGETS +5 / +10 / +25 */}
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {[5, 10, 25].map((n) => (
              <button
                key={n}
                onClick={() => addReps(n)}
                className="group flex h-[96px] flex-col items-center justify-center gap-0.5 rounded-2xl bg-accent text-accent-foreground transition-all active:scale-[0.97] active:bg-[#BFE933]"
              >
                <Plus
                  className="h-5 w-5 transition-transform group-active:scale-110"
                  strokeWidth={3}
                />
                <span className="font-display text-[30px] font-bold tabular-nums leading-none sm:text-[34px]">
                  {n}
                </span>
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] opacity-70">
                  reps
                </span>
              </button>
            ))}
          </div>

          {/* FERDIG-CTA */}
          <button
            onClick={finishDrill}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-[16px] font-semibold text-primary-foreground hover:opacity-90"
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            Ferdig med drill
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </section>
      </main>

      {/* PILL-BAR BUNN */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[920px] items-center justify-around gap-2 px-4 py-3">
          <PillBtn icon={<FileText className="h-4 w-4" strokeWidth={1.75} />} label="Notat" />
          <PillBtn icon={<Video className="h-4 w-4" strokeWidth={1.75} />} label="Video" />
          <PillBtn
            icon={<HelpCircle className="h-4 w-4" strokeWidth={1.75} />}
            label="Spørsmål"
          />
        </div>
      </nav>
    </div>
  );
}

function PillBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground hover:border-foreground/30 active:scale-[0.98]">
      {icon}
      {label}
    </button>
  );
}
