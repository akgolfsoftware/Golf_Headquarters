/**
 * PILOT — PlayerHQ Live Between (Skip-confirm)
 * Bygd direkte fra wireframe/_extracted/live-states/02-live-between-skip-confirm.html
 * URL: /live-between-skip-confirm-demo
 *
 * Dempet bakgrunn (blur + lav opasitet) av between-default + sentrert modal-popover
 * "Hoppe over Wedge 50 m?" med affected stats (Streak / SLAG-bidrag).
 */

import { X, AlertTriangle, ArrowRight } from "lucide-react";

export default function LiveBetweenSkipConfirmDemo() {
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
            Putte-økt onsdag · 16:42
          </span>
          <button
            aria-label="Lukk"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Center med dim/blur bakgrunn + popover */}
      <section className="relative">
        {/* Dimmet bakgrunn */}
        <div
          className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1280px] items-center px-16 py-12"
          style={{ opacity: 0.25, filter: "blur(1.5px)" }}
        >
          <div className="grid w-full max-w-[1120px] grid-cols-[1.1fr_1fr] items-center gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Fullført
              </div>
              <h1 className="mt-5 font-display text-[56px] font-semibold leading-[1.05] tracking-[-0.025em] text-white">
                TEK · Driver
              </h1>
              <p className="mt-2 font-mono text-[13px] tracking-[0.04em] text-white/65">
                25 reps logget · 6 min 48 sek
              </p>
              <div className="mt-8 grid max-w-[520px] grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Reps
                  </div>
                  <div className="mt-2 font-mono text-[28px] tabular-nums text-white">
                    25
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Godkjent
                  </div>
                  <div className="mt-2 font-mono text-[28px] tabular-nums text-accent">
                    19
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Snitt
                  </div>
                  <div className="mt-2 font-mono text-[28px] tabular-nums text-white">
                    78 %
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-7">
                <h2 className="font-display text-[30px] font-semibold text-white">
                  Wedge 50 m
                </h2>
                <p className="mt-1 text-[14px] text-white/65">20 reps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mørk veil */}
        <div className="absolute inset-0 bg-[#0A1F18]/40" />

        {/* Confirm dialog modal */}
        <div className="absolute left-1/2 top-1/2 z-10 w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0F2D22] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
          <div className="mb-5 flex items-center gap-3.5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4C430]/[0.14]">
              <AlertTriangle className="h-[22px] w-[22px] text-[#F4C430]" strokeWidth={1.5} />
            </div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.20em] text-[#F4C430]">
              Bekreft hopp over
            </div>
          </div>

          <h3 className="mb-3 font-display text-[24px] font-semibold leading-[1.2] tracking-[-0.01em] text-white">
            Hoppe over <span className="text-accent">Wedge 50 m</span>?
          </h3>
          <p className="mb-6 text-[14px] leading-[1.55] text-white/65">
            Øvelsen telles ikke i pyramide-bidraget for økta. Du kan gjenoppta senere
            fra hjemskjermen, men streak-progresjonen brytes.
          </p>

          {/* Affected stats */}
          <div className="mb-7 flex gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3.5">
            <div className="flex-1">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                Streak
              </div>
              <div className="font-mono text-[14px] text-[#FCA5A5] tabular-nums">
                14 → brytes
              </div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex-1">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                SLAG-bidrag
              </div>
              <div className="font-mono text-[14px] text-white/65 tabular-nums">
                30 % → 15 %
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <button className="inline-flex h-11 items-center rounded-full border border-white/10 bg-transparent px-5 font-display text-[14px] font-medium text-white/65 transition-colors hover:bg-white/[0.06]">
              Avbryt
            </button>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-full border px-5 font-display text-[14px] font-semibold"
              style={{
                background: "rgba(229,72,77,0.15)",
                color: "#FCA5A5",
                borderColor: "rgba(229,72,77,0.35)",
              }}
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              Hopp over likevel
            </button>
          </div>
        </div>
      </section>

      {/* Bottom bar — dempet bak modal */}
      <div
        className="relative z-10 grid grid-cols-[200px_240px_1fr] items-center gap-4 border-t border-white/[0.06] px-6 py-4"
        style={{ opacity: 0.4, pointerEvents: "none" }}
      >
        <button className="inline-flex h-[72px] items-center justify-center rounded-xl border border-white/15 text-[15px] font-medium text-white/75">
          Avslutt økt
        </button>
        <button className="inline-flex h-[72px] items-center justify-center rounded-xl border border-white/20 text-[16px] font-medium text-white">
          Pause lengre
        </button>
        <button
          className="inline-flex h-[72px] items-center justify-center rounded-xl bg-accent text-[18px] font-semibold text-[#0A1F18]"
          style={{ boxShadow: "0 0 0 1px rgba(209,248,67,0.5)" }}
        >
          Start neste
        </button>
      </div>
    </div>
  );
}
