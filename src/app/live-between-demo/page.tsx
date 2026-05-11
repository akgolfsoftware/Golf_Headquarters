/**
 * PILOT — PlayerHQ Live Between (overgang mellom øvelser)
 * Bygd direkte fra wireframe/_extracted/live-states/02-live-between-default.html
 * URL: /live-between-demo
 *
 * Fullskjerm dark live-modus. Forrige øvelse-oppsummering + neste øvelse-card + hvile-timer.
 */

import {
  X,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  AlignJustify,
} from "lucide-react";

export default function LiveBetweenDemo() {
  // Hvile-timer 42 sek igjen av 60
  const radius = 58;
  const circumference = 2 * Math.PI * radius; // ~364.42
  const remaining = 42 / 60;
  const dashOffset = circumference * (1 - remaining);

  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Top bar */}
      <header className="relative z-10 grid grid-cols-3 items-center border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5">
            <span className="relative h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(209,248,67,0.18)]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-accent">
              Mellom
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
            <span className="h-1.5 w-6 rounded-full bg-accent shadow-[0_0_0_3px_rgba(209,248,67,0.18)]" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 tabular-nums">
            03 / 06
          </span>
        </div>

        <div className="flex items-center justify-end gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-white/55 tabular-nums">
            Putte-økt onsdag · 14:42
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
          {/* LEFT — done summary */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              <CheckCircle2 className="h-[14px] w-[14px]" strokeWidth={1.5} />
              Fullført
            </div>

            <h1 className="mt-5 font-display text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-white">
              <em className="italic">7-jern</em> presisjon
            </h1>
            <p className="mt-2 font-mono text-[13px] tracking-[0.04em] text-white/65">
              25 reps logget · 6 min 48 sek · snitt 12,4 m fra pinne
            </p>

            {/* Stat triplet */}
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
                  Treff
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

            {/* Comparator */}
            <div className="mt-7 flex items-center gap-3 font-mono text-[12px] tracking-[0.04em] text-white/65">
              <span className="inline-flex items-center gap-1.5 text-accent">
                <TrendingUp className="h-3 w-3" strokeWidth={2} />
                +9 %
              </span>
              mot snitt for siste 14 dager (67 %)
            </div>
          </div>

          {/* RIGHT — neste øvelse + countdown */}
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Neste øvelse
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-7">
              {/* Countdown ring + label */}
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32 flex-shrink-0">
                  <svg viewBox="0 0 128 128" className="absolute inset-0">
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="none"
                      stroke="var(--accent, #D1F843)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-mono text-[38px] font-medium leading-none tracking-[-0.02em] tabular-nums text-accent">
                      42
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                      sek
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                    <span className="h-2 w-2 rounded-sm bg-accent" />
                    SLAG
                  </div>
                  <h2 className="mb-1 font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
                    Driver-spredning
                  </h2>
                  <p className="text-[14px] leading-[1.5] text-white/65">
                    20 reps · fokus på konsistent ballflight
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-white/10" />

              {/* Mini detail row */}
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

            <div className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.10em] text-white/55">
              <Clock className="h-[13px] w-[13px]" strokeWidth={1.5} />
              Starter automatisk om 42 sek
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
          <Clock className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Pause lengre
        </button>

        <button
          className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-[#0A1F18] transition-transform hover:bg-[#C2EE2F] active:scale-[0.99]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
          }}
        >
          Start neste
          <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2} />
          <span className="ml-2 inline-flex items-center rounded-md border border-[#0A1F18]/25 bg-[#0A1F18]/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-[#0A1F18]">
            enter
          </span>
        </button>
      </div>
    </div>
  );
}
