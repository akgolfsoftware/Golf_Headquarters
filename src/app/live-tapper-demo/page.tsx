/**
 * PILOT — PlayerHQ Live Tapper (Range-modus)
 * Bygd direkte fra wireframe/design-files-v2/screens/02-live-tapper.html
 * URL: /live-tapper-demo
 *
 * Fullskjerm dark range-modus med stor TAP-knapp.
 */

import { X, Clock, ChevronDown, Pause, Square, BarChart3 } from "lucide-react";

export default function LiveTapperDemo() {
  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_auto] overflow-hidden bg-[#0A1F18] text-white">
      {/* Radial accent */}
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(209,248,67,0.05) 0%, rgba(209,248,67,0) 60%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center border-b border-white/[0.06] px-6">
        <div className="flex flex-1 items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-white/90">
            Range-mode
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[12px] font-medium tabular-nums text-white/65">
            <Clock className="h-[18px] w-[18px]" strokeWidth={1.75} />
            14:30 → 14:48
          </span>
        </div>
        <div className="flex-1 text-center text-[13px] text-white/55">
          Range, Mulligan Indoor
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

      {/* Center tap zone */}
      <div className="relative flex flex-col items-center justify-center pt-6">
        <button
          aria-haspopup="dialog"
          className="inline-flex items-center gap-3 rounded-full border-2 border-accent bg-accent/[0.08] px-5 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-white transition-colors hover:bg-accent/[0.14]"
        >
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.10em] text-accent">
            DR
          </span>
          <span className="text-[15px] font-semibold">Driver</span>
          <span className="inline-flex items-center gap-1 border-l border-white/20 pl-3 text-[12px] font-medium text-white/65">
            <ChevronDown className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Bytt
          </span>
        </button>

        <div
          className="mt-10 font-mono text-[220px] font-medium leading-[0.9] tracking-[-0.06em] tabular-nums text-accent"
          style={{ textShadow: "0 0 40px rgba(209,248,67,0.32)" }}
        >
          12
        </div>
        <div className="mt-3 text-[18px] text-white/65">ball med driver</div>

        <div className="mt-8 flex items-center gap-8 rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-3">
          <div className="inline-flex items-baseline gap-1.5 font-mono text-[14px] font-medium tabular-nums text-white/70">
            <span className="font-normal text-white/50">Driver</span>12
          </div>
          <span className="h-4 w-px bg-white/15" />
          <div className="inline-flex items-baseline gap-1.5 font-mono text-[14px] font-medium tabular-nums text-white/70">
            <span className="font-normal text-white/50">7-jern</span>8
          </div>
          <span className="h-4 w-px bg-white/15" />
          <div className="inline-flex items-baseline gap-1.5 font-mono text-[14px] font-medium tabular-nums text-white/70">
            <span className="font-normal text-white/50">Wedge</span>4
          </div>
          <span className="h-4 w-px bg-white/15" />
          <div className="inline-flex items-baseline gap-1.5 font-mono text-[14px] font-medium tabular-nums text-accent">
            <span className="font-normal text-accent/65">Totalt</span>24
          </div>
        </div>
      </div>

      {/* Floating right-side stack */}
      <div className="absolute right-8 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3">
        <button
          title="Avslutt"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white transition-colors hover:bg-white/10"
        >
          <Square className="h-[22px] w-[22px]" strokeWidth={1.75} />
        </button>
        <button
          title="Pause"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white transition-colors hover:bg-white/10"
        >
          <Pause className="h-[22px] w-[22px]" strokeWidth={1.75} />
        </button>
        <button
          title="Statistikk"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white transition-colors hover:bg-white/10"
        >
          <BarChart3 className="h-[22px] w-[22px]" strokeWidth={1.75} />
        </button>
      </div>

      {/* TAP bar */}
      <div className="relative z-10 px-6 pb-6">
        <button
          className="flex h-30 w-full flex-col items-center justify-center gap-1 rounded-[20px] transition-transform active:scale-[0.985]"
          style={{
            height: 120,
            background: "linear-gradient(180deg, #D1F843 0%, #C2EE2F 100%)",
            color: "#0A1F18",
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 18px 40px rgba(209,248,67,0.22)",
          }}
        >
          <span className="font-display text-[32px] font-bold uppercase tracking-[0.06em]">
            Tap
          </span>
          <span className="text-[13px] font-medium text-[rgba(10,31,24,0.62)]">
            for å logge én ball
          </span>
        </button>
      </div>
    </div>
  );
}
