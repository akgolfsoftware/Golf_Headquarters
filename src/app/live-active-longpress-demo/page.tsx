/**
 * PILOT — PlayerHQ Live Active (Long-press / mislykket rep)
 * Bygd direkte fra wireframe/_extracted/live-states/01-live-active-longpress.html
 * URL: /live-active-longpress-demo
 *
 * Fullskjerm dark live-modus. Tap-knapp i pressed-state med progress-ring,
 * danger-fargeoverlay på counter og bottom-CTA.
 */

import { X, Pause, Ban, AlertCircle } from "lucide-react";

export default function LiveActiveLongpressDemo() {
  // Ring math — 13 av 25 rep (danger overlay)
  const radius = 228;
  const circumference = 2 * Math.PI * radius;
  const progress = 13 / 25;
  const dashOffset = circumference * (1 - progress);

  // Long-press progress (på CTA) — fyller 0..1 mens man holder. Vist på ~0.72.
  const pressRadius = 30;
  const pressCirc = 2 * Math.PI * pressRadius;
  const pressProgress = 0.72;
  const pressOffset = pressCirc * (1 - pressProgress);

  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Top bar */}
      <header className="relative z-10 grid grid-cols-3 items-center border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5">
            <span className="relative h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(209,248,67,0.18)]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-accent">
              Live
            </span>
          </div>
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.10em] text-white/85">
            Øvelse 3 av 6 · TEK · Driver
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-accent shadow-[0_0_0_3px_rgba(209,248,67,0.18)]" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 tabular-nums">
            03 / 06
          </span>
        </div>

        <div className="flex items-center justify-end gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-white/55 tabular-nums">
            Markus R. · 04:22 inne
          </span>
          <button
            aria-label="Lukk"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Danger toast */}
      <div className="pointer-events-none absolute left-1/2 top-[80px] z-20 -translate-x-1/2 inline-flex items-center gap-2.5 rounded-full border border-[#E5484D]/40 bg-[#E5484D]/10 px-4 py-2.5 font-mono text-[12px] tracking-[0.04em] text-[#FCA5A5]">
        <AlertCircle className="h-[15px] w-[15px]" strokeWidth={1.5} />
        Mislykket rep registrert · long-press oppdaget
      </div>

      {/* Center */}
      <div className="relative z-[1] flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-[#1A7D56] bg-[rgba(26,125,86,0.10)] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-[#1A7D56]" />
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.10em] text-white/95">
            TEK · Driver
          </span>
        </div>

        <div className="relative mt-8 flex h-[480px] w-[480px] items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 480 480"
          >
            <circle
              cx="240"
              cy="240"
              r={radius}
              fill="none"
              strokeWidth="4"
              stroke="rgba(255,255,255,0.08)"
            />
            <circle
              cx="240"
              cy="240"
              r={radius}
              fill="none"
              strokeWidth="4"
              stroke="#E5484D"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ filter: "drop-shadow(0 0 16px rgba(229,72,77,0.45))" }}
            />
          </svg>

          <div className="flex flex-col items-center">
            <div
              className="font-mono text-[200px] font-medium leading-[0.9] tracking-[-0.05em] tabular-nums text-[#FCA5A5]"
              style={{ textShadow: "0 0 32px rgba(229,72,77,0.30)" }}
            >
              13
            </div>
            <div className="mt-3 font-mono text-[14px] font-medium uppercase tracking-[0.16em] text-white/55">
              av 25 reps
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-stretch gap-8">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              Godkjent
            </div>
            <div className="mt-1 font-mono text-[22px] font-medium tabular-nums text-white">
              9
            </div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#FCA5A5]/85">
              Mislykket
            </div>
            <div className="mt-1 font-mono text-[22px] font-medium tabular-nums text-[#FCA5A5]">
              4
            </div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              Streak
            </div>
            <div className="mt-1 font-mono text-[22px] font-medium tabular-nums text-white/60">
              0
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — CTA i pressed-state */}
      <div className="relative z-10 grid grid-cols-[280px_1fr] items-center gap-4 border-t border-white/[0.06] px-6 py-4">
        <button className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-transparent text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06]">
          <Pause className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Pause
        </button>

        <button
          className="relative inline-flex h-[72px] items-center justify-center gap-3 rounded-xl border text-[18px] font-semibold tracking-[-0.01em]"
          style={{
            background: "rgba(229,72,77,0.18)",
            color: "#FCA5A5",
            borderColor: "rgba(229,72,77,0.35)",
            boxShadow: "0 0 0 1px rgba(229,72,77,0.35) inset",
          }}
        >
          {/* Long-press ring inside CTA */}
          <span className="relative inline-flex h-[34px] w-[34px] items-center justify-center">
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 80 80"
              aria-hidden
            >
              <circle
                cx="40"
                cy="40"
                r={pressRadius}
                fill="none"
                stroke="rgba(252,165,165,0.25)"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r={pressRadius}
                fill="none"
                stroke="#FCA5A5"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={pressCirc}
                strokeDashoffset={pressOffset}
              />
            </svg>
            <Ban className="relative h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          Markert som mislykket
          <span
            className="ml-2 inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em]"
            style={{
              background: "rgba(229,72,77,0.15)",
              color: "#FCA5A5",
              borderColor: "rgba(229,72,77,0.3)",
            }}
          >
            slipp
          </span>
        </button>
      </div>
    </div>
  );
}
