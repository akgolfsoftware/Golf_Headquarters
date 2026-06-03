"use client";

/**
 * PlayerHQ · Live-økt (preview) — Aktiv drill (skjerm 2, HOVEDSKJERM).
 *
 * Fasit: public/design-handover/_screens/pl-live-active.png.
 * Fullscreen forest-flate. Topbar (lukk · DRILL n AV m · pause), tynn økt-
 * progress, akse-pille, display-tittel, stor lime mono-timer (teller opp),
 * TOTAL-rad, rep-tracker (0/22 + % + felt), tre lime +5/+10/+25-knapper (56px),
 * angre-rep, logg-rad (Video/Foto/Notat), og footer "Avslutt økt".
 *
 * Klient-komponent for live-interaktivitet (timer + rep-teller). Ingen DB/auth.
 * Mobil = primær fasit. Desktop = samme UI sentrert i smal kolonne.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  FileText,
  Pause,
  Play,
  Undo2,
  Video,
  X,
} from "lucide-react";
import { type LiveSessionDemo, axisColor, fmtMSS } from "./types";

export function LiveActive({
  data,
  closeHref,
  endHref,
}: {
  data: LiveSessionDemo;
  /** Lukk (topbar X). */
  closeHref: string;
  /** Avslutt økt → oppsummering. */
  endHref: string;
}) {
  // Aktiv drill = første drill i preview-flyten.
  const active = data.drills[0];
  const totalDrills = data.drills.length;

  const [paused, setPaused] = useState(false);
  const [drillSec, setDrillSec] = useState(0);
  const [reps, setReps] = useState(0);

  // Tidtaker — teller opp drill- og total-tid (samme i preview: én drill).
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setDrillSec((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const repPct =
    active.plannedReps > 0 ? Math.min(100, (reps / active.plannedReps) * 100) : 0;
  // Økt-progress (drills fullført) — 0 i aktiv tilstand med én drill.
  const overallPct = 0;

  function addReps(n: number) {
    setReps((r) => Math.max(0, r + n));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-primary text-background"
      style={{ isolation: "isolate" }}
    >
      {/* topbar */}
      <header
        className="flex-shrink-0"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 8px)",
          borderBottom: "1px solid hsl(var(--background) / 0.1)",
        }}
      >
        <div className="mx-auto flex h-[60px] w-full max-w-[520px] items-center justify-between gap-3 px-4">
          <Link
            href={closeHref}
            aria-label="Lukk økt"
            className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </Link>
          <span className="truncate text-center font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-background/80">
            Drill {active.index} av {totalDrills}
          </span>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Fortsett økt" : "Pause økt"}
            className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border border-background/15 bg-background/5 text-background/70"
          >
            {paused ? (
              <Play className="h-[18px] w-[18px] fill-current" strokeWidth={2} aria-hidden />
            ) : (
              <Pause className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      </header>

      {/* scrollbart innhold */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
        <div className="mx-auto w-full max-w-[520px]">
          {/* økt-progress (tynn) */}
          <div className="px-5 pt-3">
            <div className="h-1 overflow-hidden rounded-full bg-background/15">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${overallPct}%`, boxShadow: "0 0 8px hsl(var(--accent) / 0.5)" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 px-5 pb-8 pt-6">
            {/* akse-pille */}
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-6 items-center gap-1.5 rounded-full bg-background/10 px-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em]"
                style={{ color: axisColor(active.axis) }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: axisColor(active.axis) }}
                />
                {active.axis}
              </span>
            </div>

            {/* drill-tittel */}
            <h1 className="-mt-2 font-display text-[30px] font-bold leading-[1.08] -tracking-[0.02em] text-background">
              {active.name}
            </h1>

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
                TOTAL <span className="text-background">{fmtMSS(drillSec)}</span>
              </div>
            </div>

            {/* REP-TRACKER */}
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[12px] font-extrabold uppercase tracking-[0.10em] text-background/70">
                  Reps
                </span>
                <span className="font-mono text-[22px] font-extrabold tabular-nums text-accent">
                  {reps}
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

            {/* LOGG-RAD: Video / Foto / Notat */}
            <div className="grid grid-cols-3 gap-3">
              <LogButton icon={<Video className="h-6 w-6" strokeWidth={1.5} aria-hidden />} label="Video" />
              <LogButton icon={<Camera className="h-6 w-6" strokeWidth={1.5} aria-hidden />} label="Foto" />
              <LogButton icon={<FileText className="h-6 w-6" strokeWidth={1.5} aria-hidden />} label="Notat" />
            </div>
          </div>
        </div>
      </div>

      {/* footer: avslutt økt */}
      <footer
        className="flex-shrink-0"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
          paddingTop: 16,
          borderTop: "1px solid hsl(var(--background) / 0.1)",
          background: "hsl(var(--primary))",
        }}
      >
        <div className="mx-auto w-full max-w-[520px] px-5">
          <Link
            href={endHref}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-mono text-[14px] font-extrabold uppercase tracking-[0.08em] text-accent-foreground"
            style={{ boxShadow: "0 4px 16px hsl(var(--accent) / 0.28)" }}
          >
            Avslutt økt
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </footer>

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
            onClick={() => setPaused(false)}
            className="inline-flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-accent px-8 font-mono text-[14px] font-extrabold uppercase tracking-[0.08em] text-accent-foreground"
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={2.5} aria-hidden />
            Fortsett
          </button>
        </div>
      )}
    </div>
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
