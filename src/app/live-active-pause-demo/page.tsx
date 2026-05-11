/**
 * PILOT — PlayerHQ Live Active (pause-modus)
 * Bygd direkte fra wireframe/_extracted/live-states/01-live-active-pause.html
 * URL: /live-active-pause-demo
 *
 * Fullskjerm dark live-modus i pause — counter dimmes, italic "Pause" overlay.
 */

import { X, Play } from "lucide-react";

export default function LiveActivePauseDemo() {
  // 12 av 25 — counter dempet i bakgrunn
  const radius = 228;
  const circumference = 2 * Math.PI * radius;
  const progress = 12 / 25;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Top bar */}
      <header className="relative z-10 grid grid-cols-3 items-center border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(244,196,48,0.14)] px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#F4C430]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-[#F4C430]">
              Pause
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
            <span className="h-1.5 w-6 rounded-full bg-accent" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 tabular-nums">
            03 / 06
          </span>
        </div>

        <div className="flex items-center justify-end gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-[#F4C430] tabular-nums">
            Pauset 00:42
          </span>
          <button
            aria-label="Lukk"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Center — dimmed counter + pause overlay */}
      <div className="relative z-[1] flex flex-col items-center justify-center">
        {/* Dimmed counter */}
        <div className="pointer-events-none flex flex-col items-center opacity-30">
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
              <div className="font-mono text-[200px] font-medium leading-[0.9] tracking-[-0.05em] tabular-nums text-accent">
                12
              </div>
              <div className="mt-3 font-mono text-[14px] font-medium uppercase tracking-[0.16em] text-white/55">
                av 25 reps
              </div>
            </div>
          </div>
        </div>

        {/* Pause overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-8">
          <div
            className="font-display text-[128px] font-normal italic leading-[1] tracking-[-0.04em] text-white"
            style={{ textShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
          >
            Pause
          </div>
          <div className="font-mono text-[13px] uppercase tracking-[0.16em] text-white/70">
            Trykk fortsett når du er klar
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 grid grid-cols-[200px_1fr] items-center gap-4 border-t border-white/[0.06] px-6 py-4">
        <button className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl text-[16px] font-medium text-white/85 transition-colors hover:bg-white/[0.06]">
          <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Avslutt økt
        </button>
        <button
          className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-[#0A1F18] transition-transform hover:bg-[#C2EE2F] active:scale-[0.99]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
          }}
        >
          <Play className="h-[22px] w-[22px]" strokeWidth={2} fill="currentColor" />
          Fortsett økt
          <span className="ml-2 inline-flex items-center rounded-md border border-[#0A1F18]/25 bg-[#0A1F18]/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-[#0A1F18]">
            space
          </span>
        </button>
      </div>
    </div>
  );
}
