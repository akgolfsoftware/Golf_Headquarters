/**
 * PILOT — PlayerHQ Live Active (Connection lost)
 * Bygd direkte fra wireframe/_extracted/live-states/01-live-active-connection-lost.html
 * URL: /live-active-connection-lost-demo
 *
 * Fullskjerm dark live-modus. WiFi-tapt overlay-toast + sync chip nederst.
 * UI bak dempes (lavere opasitet) — reps lagres lokalt.
 */

import { X, Pause, Check, WifiOff, RotateCw } from "lucide-react";

export default function LiveActiveConnectionLostDemo() {
  // Ring math — 12 av 25 rep
  const radius = 228;
  const circumference = 2 * Math.PI * radius;
  const progress = 12 / 25;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Radial accent behind counter */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{
          width: 760,
          height: 760,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(209,248,67,0.05) 0%, rgba(209,248,67,0) 65%)",
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
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-[#F4C430]">
            <WifiOff className="h-[13px] w-[13px]" strokeWidth={1.5} />
            Lagrer lokalt
          </span>
          <button
            aria-label="Lukk"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Tilkobling-tapt overlay-toast */}
      <div
        className="pointer-events-none absolute left-1/2 top-[80px] z-20 -translate-x-1/2 inline-flex items-center gap-2.5 rounded-full border border-[#F4C430]/35 bg-[#F4C430]/10 px-4 py-2.5 font-mono text-[12px] tracking-[0.04em] text-[#F4C430] backdrop-blur"
      >
        <WifiOff className="h-[15px] w-[15px]" strokeWidth={1.5} />
        <span>Tilkobling tapt · reps lagres lokalt og synces ved gjenoppretting</span>
        <span className="ml-2 inline-flex items-center gap-1 text-[#F4C430]/60">
          <RotateCw className="h-[12px] w-[12px]" strokeWidth={1.5} />
          retry om 4 s
        </span>
      </div>

      {/* Center — dempet bak overlay */}
      <div className="relative z-[1] flex flex-col items-center justify-center opacity-75">
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
              stroke="var(--accent, #D1F843)"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ filter: "drop-shadow(0 0 10px rgba(209,248,67,0.25))" }}
            />
          </svg>

          <div className="flex flex-col items-center">
            <div
              className="font-mono text-[200px] font-medium leading-[0.9] tracking-[-0.05em] tabular-nums text-accent"
              style={{ textShadow: "0 0 32px rgba(209,248,67,0.22)" }}
            >
              12
            </div>
            <div className="mt-3 font-mono text-[14px] font-medium uppercase tracking-[0.16em] text-white/55">
              av 25 reps
            </div>
          </div>
        </div>

        {/* Sync-kø chip */}
        <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-[#F4C430]/30 bg-[#F4C430]/8 px-4 py-2 text-[#F4C430]">
          <RotateCw className="h-[14px] w-[14px]" strokeWidth={1.5} />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] tabular-nums">
            3 reps i kø
          </span>
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
