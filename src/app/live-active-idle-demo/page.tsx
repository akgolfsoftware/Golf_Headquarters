/**
 * PILOT — PlayerHQ Live Active (idle · før start)
 * Bygd direkte fra wireframe/_extracted/live-states/01-live-active-idle.html
 * URL: /live-active-idle-demo
 *
 * Fullskjerm dark live-modus, før første rep er logget. 0 av 25 reps.
 */

import { X, Pause, Check, MousePointerClick } from "lucide-react";

export default function LiveActiveIdleDemo() {
  // Ring tom (0 reps)
  const radius = 228;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference;

  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Radial accent */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 760,
          height: 760,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(209,248,67,0.04) 0%, rgba(209,248,67,0) 65%)",
        }}
      />

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
            Markus R. · 11.05.26
          </span>
          <button
            aria-label="Lukk"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Center */}
      <div className="relative z-[1] flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-[#1A7D56] bg-[rgba(26,125,86,0.10)] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-[#1A7D56]" />
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.10em] text-white/95">
            TEK · Driver
          </span>
        </div>

        <div className="relative mt-8 flex h-[480px] w-[480px] items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 480 480">
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
              stroke="var(--accent, #D1F843)"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <div className="flex flex-col items-center">
            <div className="font-mono text-[200px] font-medium leading-[0.9] tracking-[-0.05em] tabular-nums text-white/[0.78]">
              0
            </div>
            <div className="mt-3 font-mono text-[14px] font-medium uppercase tracking-[0.16em] text-white/55">
              av 25 reps
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="mt-10 inline-flex items-center gap-2 font-mono text-[12px] text-white/55">
          <MousePointerClick className="h-4 w-4" strokeWidth={1.5} />
          <span>
            Tap for å logge{" "}
            <strong className="font-semibold text-white">✓</strong>
          </span>
          <span className="opacity-50">·</span>
          <span>Long-press for mislykket</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 grid grid-cols-[280px_1fr] items-center gap-4 border-t border-white/[0.06] px-6 py-4">
        <button className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-transparent text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06]">
          <Pause className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Pause
        </button>
        <button
          className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-[#0A1F18] transition-transform hover:bg-[#C2EE2F] active:scale-[0.99]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
          }}
        >
          <Check className="h-[22px] w-[22px]" strokeWidth={2} />
          Logg rep
          <span className="ml-2 inline-flex items-center rounded-md border border-[#0A1F18]/25 bg-[#0A1F18]/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-[#0A1F18]">
            space
          </span>
        </button>
      </div>
    </div>
  );
}
