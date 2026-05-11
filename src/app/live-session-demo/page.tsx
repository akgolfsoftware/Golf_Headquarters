/**
 * PILOT — PlayerHQ Live Session
 * Bygd direkte fra wireframe/design-files-v2/screens/01-live-session.html
 * URL: /live-session-demo
 *
 * Fullskjerm dark live-modus. Bruker accent-token for lime.
 */

import { X, Pause, ArrowRight } from "lucide-react";

export default function LiveSessionDemo() {
  // Ring math — 24 av 30 rep
  const radius = 170;
  const circumference = 2 * Math.PI * radius; // ~1068
  const progress = 24 / 30;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_88px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Radial accent behind counter */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 760,
          height: 760,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(209,248,67,0.06) 0%, rgba(209,248,67,0) 65%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center border-b border-white/[0.06] px-6">
        <div className="flex flex-1 items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5">
            <span className="relative h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(209,248,67,0.18)]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-accent">
              Live
            </span>
          </div>
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.10em] text-white/85">
            TEK · Driver
          </span>
        </div>
        <div className="flex-1 text-center text-[13px] text-white/55">
          Økt 12 av 18 — Sommer-toppform
        </div>
        <div className="flex flex-1 items-center justify-end">
          <button
            aria-label="Lukk"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {/* Center counter */}
      <div className="relative z-[1] flex flex-col items-center justify-center pt-2">
        <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-[#1A7D56] bg-[rgba(26,125,86,0.08)] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-[#1A7D56]" />
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.10em] text-white/90">
            TEK · Driver
          </span>
        </div>

        <div className="relative mt-10 flex h-[360px] w-[360px] items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 360 360"
          >
            <circle
              cx="180"
              cy="180"
              r={radius}
              fill="none"
              strokeWidth="6"
              stroke="rgba(255,255,255,0.08)"
            />
            <circle
              cx="180"
              cy="180"
              r={radius}
              fill="none"
              strokeWidth="6"
              stroke="var(--accent, #D1F843)"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ filter: "drop-shadow(0 0 8px rgba(209,248,67,0.35))" }}
            />
          </svg>
          <div
            className="font-mono text-[168px] font-medium leading-[0.9] tracking-[-0.05em] tabular-nums text-accent"
            style={{ textShadow: "0 0 32px rgba(209,248,67,0.30)" }}
          >
            24
          </div>
        </div>

        <div className="mt-7 text-[16px] text-white/65">
          av <b className="font-medium text-white/95">30 rep</b>
        </div>

        <div className="mt-7 flex items-center gap-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_4px_rgba(209,248,67,0.18)]" />
          <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-white/30" />
          <span className="ml-2 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-white/50">
            stasjon 2 av 3
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 grid grid-cols-[30%_1fr] items-center gap-4 border-t border-white/[0.06] px-6 py-4">
        <button className="inline-flex h-14 items-center justify-center gap-2.5 self-center rounded-xl border border-white/20 bg-transparent text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06]">
          <Pause className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Pause
        </button>
        <button
          className="inline-flex h-14 items-center justify-center gap-3 self-center rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-[#0A1F18] transition-transform hover:bg-[#C2EE2F] active:scale-[0.98]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
          }}
        >
          Neste rep
          <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
