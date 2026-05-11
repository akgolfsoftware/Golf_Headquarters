/**
 * PILOT — PlayerHQ Live Active (ferdig · 25 av 25 reps)
 * Bygd direkte fra wireframe/_extracted/live-states/01-live-active-ferdig.html
 * URL: /live-active-ferdig-demo
 *
 * Fullskjerm dark live-modus, øvelse fullført — full ring, auto-transition til sammendrag.
 */

import { X, ArrowRight, Clock } from "lucide-react";

export default function LiveActiveFerdigDemo() {
  const radius = 228;
  const circumference = 2 * Math.PI * radius;

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
            "radial-gradient(circle, rgba(209,248,67,0.10) 0%, rgba(209,248,67,0) 65%)",
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
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 tabular-nums">
            03 / 06
          </span>
        </div>

        <div className="flex items-center justify-end gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-accent tabular-nums">
            Fullført · 06:48
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
        <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-accent/35 bg-accent/[0.08] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-[#1A7D56]" />
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.10em] text-accent">
            TEK · Driver · Fullført
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
              strokeWidth="6"
              stroke="var(--accent, #D1F843)"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              style={{ filter: "drop-shadow(0 0 16px rgba(209,248,67,0.55))" }}
            />
          </svg>

          <div className="flex flex-col items-center">
            <div
              className="font-mono text-[200px] font-medium leading-[0.9] tracking-[-0.05em] tabular-nums text-accent"
              style={{ textShadow: "0 0 40px rgba(209,248,67,0.45)" }}
            >
              25
            </div>
            <div className="mt-3 font-mono text-[14px] font-medium uppercase tracking-[0.16em] text-accent">
              av 25 reps · 100 %
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="mt-8 flex items-stretch gap-8">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              Godkjent
            </div>
            <div className="mt-1 font-mono text-[22px] font-medium tabular-nums text-white">
              19
            </div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              Mislykket
            </div>
            <div className="mt-1 font-mono text-[22px] font-medium tabular-nums text-white/60">
              6
            </div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
              Snitt-konfidens
            </div>
            <div className="mt-1 font-mono text-[22px] font-medium tabular-nums text-white">
              78 %
            </div>
          </div>
        </div>

        {/* Auto-transition hint */}
        <div className="mt-10 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          Øvelses-sammendrag om 0,8 s
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
          Til sammendrag
          <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
