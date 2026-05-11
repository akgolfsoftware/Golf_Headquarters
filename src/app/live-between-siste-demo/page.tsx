/**
 * PILOT — PlayerHQ Live Between (Siste øvelse)
 * Bygd direkte fra wireframe/_extracted/live-states/02-live-between-siste.html
 * URL: /live-between-siste-demo
 *
 * "Siste"-pill, sammendrag av forrige (SPILL · Strategi) + avslutnings-preview
 * med trofé-glyph. Badge "1 igjen" framheves.
 */

import { X, CheckCircle2, Trophy, ArrowRight, AlignJustify } from "lucide-react";

export default function LiveBetweenSisteDemo() {
  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Top bar */}
      <header className="relative z-10 grid grid-cols-3 items-center border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5">
            <span className="relative h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(209,248,67,0.18)]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-accent">
              Siste
            </span>
          </div>
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.10em] text-white/85">
            Øvelse 5 av 6 fullført
          </span>
          <span className="ml-1 inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
            1 igjen
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-white/60" />
            <span className="h-1.5 w-6 rounded-full bg-accent shadow-[0_0_0_3px_rgba(209,248,67,0.18)]" />
          </div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 tabular-nums">
            05 / 06
          </span>
        </div>

        <div className="flex items-center justify-end gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-white/55 tabular-nums">
            Putte-økt onsdag · 17:36
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
              <em className="italic">SPILL</em> · Strategi
            </h1>
            <p className="mt-2 font-mono text-[13px] tracking-[0.04em] text-white/65 tabular-nums">
              18 reps logget · 9 min 12 sek
            </p>

            <div className="mt-8 grid max-w-[520px] grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                  Reps
                </div>
                <div className="mt-2 font-mono text-[28px] font-medium tabular-nums text-white">
                  18
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                  Godkjent
                </div>
                <div className="mt-2 font-mono text-[28px] font-medium tabular-nums text-accent">
                  15
                </div>
                <div className="mt-1 font-mono text-[11px] tracking-[0.04em] text-white/55">
                  83 %
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                  Snitt-konfidens
                </div>
                <div className="mt-2 font-mono text-[28px] font-medium tabular-nums text-white">
                  82 %
                </div>
              </div>
            </div>

            <p className="mt-7 max-w-[480px] font-display text-[22px] italic leading-[1.4] text-accent/90">
              Siste øvelse!
            </p>
            <p className="mt-1 max-w-[480px] font-display text-[18px] italic leading-[1.5] text-white/65">
              Snart i mål.
            </p>
          </div>

          {/* RIGHT — avslutning preview */}
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Avslutning
            </div>

            <div
              className="overflow-hidden rounded-xl border p-7"
              style={{
                background: "rgba(209,248,67,0.06)",
                borderColor: "rgba(209,248,67,0.22)",
              }}
            >
              <div className="flex items-center gap-6">
                <div
                  className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full border"
                  style={{
                    background: "rgba(209,248,67,0.10)",
                    borderColor: "rgba(209,248,67,0.30)",
                  }}
                >
                  <Trophy className="h-14 w-14 text-accent" strokeWidth={1.5} />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                    Siste øvelse · ingen flere
                  </div>
                  <h2 className="mb-1 font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
                    Sammendrag venter
                  </h2>
                  <p className="text-[14px] leading-[1.5] text-white/65">
                    Pyramide-bidrag, badges og feedback-flow til Anders.
                  </p>
                </div>
              </div>

              <div className="my-6 h-px bg-white/10" />

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Total tid
                  </div>
                  <div className="font-mono text-[15px] text-white tabular-nums">
                    41 min
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Reps totalt
                  </div>
                  <div className="font-mono text-[15px] text-white tabular-nums">
                    142
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Godkjent
                  </div>
                  <div className="font-mono text-[15px] tabular-nums text-accent">
                    118 · 83 %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <div className="relative z-10 grid grid-cols-[200px_1fr] items-center gap-4 border-t border-white/[0.06] px-6 py-4">
        <button className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-transparent text-[15px] font-medium text-white/75 transition-colors hover:bg-white/[0.04]">
          <AlignJustify className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Detaljer
        </button>

        <button
          className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-[#0A1F18] transition-transform hover:bg-[#C2EE2F] active:scale-[0.99]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
          }}
        >
          Ferdig · se sammendrag
          <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2} />
          <span className="ml-2 inline-flex items-center rounded-md border border-[#0A1F18]/25 bg-[#0A1F18]/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-[#0A1F18]">
            enter
          </span>
        </button>
      </div>
    </div>
  );
}
