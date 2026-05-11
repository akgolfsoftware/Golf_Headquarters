/**
 * PILOT — Live Intro Modal
 * Bygd direkte fra wireframe/design-files-v2/screens/03-modal-live-intro.html
 * URL: /live-intro-demo
 *
 * Fullskjerm modal-overlay med backdrop. Hero-intro før økt starter.
 */

import { X, ArrowRight } from "lucide-react";

export default function LiveIntroDemo() {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" aria-hidden />

      {/* Modal — fullscreen */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-intro-title"
        className="fixed inset-0 z-50 grid h-screen w-screen grid-rows-[56px_1fr_auto] overflow-hidden bg-[#0A1F18] text-white"
      >
        {/* Radial accent on hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2"
          style={{
            top: "50%",
            transform: "translate(-50%, -55%)",
            width: 720,
            height: 480,
            background:
              "radial-gradient(ellipse, rgba(209,248,67,0.07) 0%, rgba(209,248,67,0) 65%)",
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center px-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="h-1 w-50 overflow-hidden rounded-full bg-white/10" style={{ width: 200 }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: "25%",
                  background: "linear-gradient(90deg, #D1F843, #C2EE2F)",
                  boxShadow: "0 0 12px rgba(209,248,67,0.35)",
                }}
              />
            </div>
            <div className="text-[12px] font-medium text-white/65">
              <b className="font-semibold text-white/95">1 / 4</b> · forberedelse
            </div>
          </div>
          <button
            aria-label="Lukk"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>

        {/* Center */}
        <div className="relative z-[1] flex flex-col items-center justify-center px-6 text-center">
          <div className="inline-flex items-center gap-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.10em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1A7D56]" />
            Sommer-toppform · TEK
          </div>

          <h1
            id="live-intro-title"
            className="mt-7 font-display text-[88px] font-bold leading-[0.95] tracking-[-0.035em]"
          >
            Putte-økt
          </h1>
          <div className="mt-3.5 text-[24px] leading-[1.2] text-white/75">
            3 stasjoner
          </div>

          <div className="mt-8 inline-flex items-center gap-7 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5">
            <div className="inline-flex items-baseline gap-2 text-[16px] text-white/65">
              ~
              <b className="font-mono text-[18px] font-semibold tabular-nums text-white">
                30 min
              </b>
            </div>
            <span className="h-[18px] w-px bg-white/15" />
            <div className="inline-flex items-baseline gap-2 text-[16px] text-white/65">
              <b className="font-mono text-[18px] font-semibold tabular-nums text-white">
                60 reps
              </b>{" "}
              planlagt
            </div>
          </div>

          <div
            className="mt-10 grid w-[480px] grid-cols-[36px_1fr] gap-3.5 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4.5 text-left"
          >
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[13px] font-bold tracking-[0.02em] text-[#0A1F18]">
              AK
            </div>
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Coach-tip
              </div>
              <div className="mt-1.5 font-display text-[15px] italic leading-[1.5] tracking-[-0.005em] text-white/90">
                «Hold tempo gjennom hele putten — ikke akselerer på treffpunktet.»
              </div>
              <div className="mt-2 text-[12px] text-white/50">
                — Anders Kristiansen · 2 dager siden
              </div>
            </div>
          </div>
        </div>

        {/* CTA bar */}
        <div className="relative z-10 flex items-center justify-center px-6 pb-8 pt-4">
          <button
            className="inline-flex h-18 items-center justify-center gap-3 rounded-2xl text-[18px] font-semibold transition-transform hover:bg-[#C2EE2F] active:scale-[0.98]"
            style={{
              width: 280,
              height: 72,
              background: "#D1F843",
              color: "#0A1F18",
              boxShadow:
                "0 0 0 1px rgba(209,248,67,0.5), 0 16px 32px rgba(209,248,67,0.18)",
            }}
          >
            Start økt
            <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </>
  );
}
