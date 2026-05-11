/**
 * PILOT — PlayerHQ Live Between (Hvile pause)
 * Bygd direkte fra wireframe/_extracted/live-states/02-live-between-pause.html
 * URL: /live-between-pause-demo
 *
 * Hvile-timer paused (frosset stiplet ring + pause-glyph + "frosset"-label).
 * Topbar viser "Paause"-pill med gul accent.
 */

import {
  X,
  CheckCircle2,
  Pause,
  Play,
  AlignJustify,
  SkipForward,
  TrendingUp,
} from "lucide-react";

export default function LiveBetweenPauseDemo() {
  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Top bar */}
      <header className="relative z-10 grid grid-cols-3 items-center border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F4C430]/30 bg-[#F4C430]/[0.14] px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#F4C430]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-[#F4C430]">
              Pause
            </span>
          </div>
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.10em] text-white/85">
            Øvelse 3 av 6 fullført
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-[#F4C430] shadow-[0_0_0_3px_rgba(244,196,48,0.20)]" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 tabular-nums">
            03 / 06
          </span>
        </div>

        <div className="flex items-center justify-end gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-[#F4C430] tabular-nums">
            Pauset 02:14
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
      <section className="relative z-[1] mx-auto flex w-full max-w-[1280px] items-center px-16 py-12">
        <div className="grid w-full max-w-[1120px] grid-cols-[1.1fr_1fr] items-center gap-16">
          {/* LEFT — fullført summary */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              <CheckCircle2 className="h-[14px] w-[14px]" strokeWidth={1.5} />
              Fullført
            </div>

            <h1 className="mt-5 font-display text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-white">
              <em className="italic">TEK</em> · Driver
            </h1>
            <p className="mt-2 font-mono text-[13px] tracking-[0.04em] text-white/65 tabular-nums">
              25 reps logget · 6 min 48 sek · snitt 12,4 m fra pinne
            </p>

            <div className="mt-8 grid max-w-[520px] grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                  Reps
                </div>
                <div className="mt-2 font-mono text-[28px] font-medium tabular-nums text-white">
                  25
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                  Godkjent
                </div>
                <div className="mt-2 font-mono text-[28px] font-medium tabular-nums text-accent">
                  19
                </div>
                <div className="mt-1 font-mono text-[11px] tracking-[0.04em] text-white/55">
                  76 %
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                  Snitt-konfidens
                </div>
                <div className="mt-2 font-mono text-[28px] font-medium tabular-nums text-white">
                  78 %
                </div>
              </div>
            </div>

            <p className="mt-7 max-w-[480px] font-display text-[18px] italic leading-[1.5] text-white/65">
              Bra tempo. Ta tiden du trenger.
            </p>

            <div className="mt-4 flex items-center gap-3 font-mono text-[12px] tracking-[0.04em] text-white/65">
              <span className="inline-flex items-center gap-1.5 text-accent">
                <TrendingUp className="h-3 w-3" strokeWidth={2} />
                +9 %
              </span>
              mot snitt for siste 14 dager
            </div>
          </div>

          {/* RIGHT — frosset countdown for neste øvelse */}
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Neste øvelse
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-7">
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32 flex-shrink-0">
                  <svg viewBox="0 0 128 128" className="absolute inset-0">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="4"
                    />
                    {/* Frosset — stiplet, lav opasitet */}
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      fill="none"
                      stroke="#F4C430"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="6 8"
                      opacity="0.6"
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Pause className="h-[34px] w-[34px] text-[#F4C430]" strokeWidth={1.5} />
                    <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F4C430]">
                      frosset
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                    <span className="h-2 w-2 rounded-sm bg-accent" />
                    SLAG
                  </div>
                  <h2 className="mb-1 font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
                    Wedge 50 m
                  </h2>
                  <p className="text-[14px] leading-[1.5] text-white/65">
                    20 reps · fokus på konsistent ballflight
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-white/10" />

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Estimert
                  </div>
                  <div className="font-mono text-[15px] text-white">~ 8 min</div>
                </div>
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Forrige
                  </div>
                  <div className="font-mono text-[15px] text-white tabular-nums">
                    14 / 20
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Mål
                  </div>
                  <div className="font-mono text-[15px] text-white tabular-nums">
                    ≥ 16 / 20
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.10em] text-[#F4C430]">
              <Pause className="h-[13px] w-[13px]" strokeWidth={1.5} />
              Hvile pause — trykk Start når du er klar
            </div>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <div className="relative z-10 grid grid-cols-[200px_240px_1fr] items-center gap-4 border-t border-white/[0.06] px-6 py-4">
        <button className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-transparent text-[15px] font-medium text-white/75 transition-colors hover:bg-white/[0.04]">
          <AlignJustify className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Avslutt økt
        </button>

        <button className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-transparent text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06]">
          <SkipForward className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Hopp over neste
        </button>

        <button
          className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-[#0A1F18] transition-transform hover:bg-[#C2EE2F] active:scale-[0.99]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
          }}
        >
          <Play className="h-[22px] w-[22px]" strokeWidth={2} />
          Start når klar
          <span className="ml-2 inline-flex items-center rounded-md border border-[#0A1F18]/25 bg-[#0A1F18]/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-[#0A1F18]">
            enter
          </span>
        </button>
      </div>
    </div>
  );
}
