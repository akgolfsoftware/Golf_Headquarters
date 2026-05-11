/**
 * PILOT — PlayerHQ Live Summary (Feedback sendt)
 * Bygd direkte fra wireframe/_extracted/live-states/03-live-summary-feedback-sendt.html
 * URL: /live-summary-feedback-sendt-demo
 *
 * Success-state etter at feedback er sendt til coach: grønn "Sendt · takk"-chip,
 * smiley-knapper deaktivert (én pre-valgt fylt med accent), sitat under.
 */

import { Check, Home, Smile, Frown, Meh, X } from "lucide-react";

type Wedge = { key: string; label: string; pct: number; color: string };

const WEDGES: Wedge[] = [
  { key: "tek", label: "TEK", pct: 60, color: "#D1F843" },
  { key: "slag", label: "SLAG", pct: 30, color: "#7BC4A0" },
  { key: "spill", label: "SPILL", pct: 10, color: "#3F8B6A" },
];

export default function LiveSummaryFeedbackSendtDemo() {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Top bar */}
      <header className="relative z-10 grid grid-cols-3 items-center border-b border-white/[0.06] px-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-white/60" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-white/65">
              Ferdig
            </span>
          </div>
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.10em] text-white/85">
            Økt fullført
          </span>
        </div>

        <div className="flex items-center justify-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55 tabular-nums">
            Putte-økt onsdag · 14. mai 2026
          </span>
        </div>

        <div className="flex items-center justify-end">
          <button
            aria-label="Lukk"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Center */}
      <section className="relative z-[1] mx-auto flex w-full max-w-[1240px] flex-col px-16 pt-12 pb-8">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Økt fullført
          </div>
          <h1 className="mx-auto max-w-[880px] font-display text-[56px] leading-[1.15] text-white">
            <em className="italic">6 av 6 øvelser.</em> Bra jobba, Markus.
          </h1>
          <p className="mt-4 font-mono text-[13px] tracking-[0.08em] text-white/65 tabular-nums">
            42 minutter aktiv · 142 reps totalt · 118 godkjent
          </p>
        </div>

        {/* Body: donut + stats */}
        <div className="grid grid-cols-[360px_1fr] items-stretch gap-8">
          {/* Donut card */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-7">
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Pyramide-bidrag
            </div>

            <div className="mb-6 flex justify-center">
              <svg viewBox="0 0 200 200" width="200" height="200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="22"
                />
                {WEDGES.map((w) => {
                  const length = (w.pct / 100) * circumference;
                  const current = offset;
                  offset -= length;
                  return (
                    <circle
                      key={w.key}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={w.color}
                      strokeWidth="22"
                      strokeDasharray={`${length} ${circumference}`}
                      strokeDashoffset={current}
                      transform="rotate(-90 100 100)"
                    />
                  );
                })}
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {WEDGES.map((w) => (
                <div key={w.key} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: w.color }}
                  />
                  <span className="font-mono text-[11px] tracking-[0.04em] text-white/65">
                    {w.label}
                  </span>
                  <span className="ml-auto font-mono text-[11px] tabular-nums text-white">
                    {w.pct} %
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat grid 2x2 */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
                Reps totalt
              </div>
              <div className="mt-2 font-mono text-[48px] font-medium leading-none tracking-[-0.02em] tabular-nums text-white">
                142
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
                Godkjent
              </div>
              <div className="mt-2 font-mono text-[48px] font-medium leading-none tracking-[-0.02em] tabular-nums text-accent">
                118
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
                Snitt-konfidens
              </div>
              <div className="mt-2 font-mono text-[48px] font-medium leading-none tracking-[-0.02em] tabular-nums text-white">
                81 %
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
                Beste streak
              </div>
              <div className="mt-2 font-mono text-[48px] font-medium leading-none tracking-[-0.02em] tabular-nums text-white">
                14
              </div>
            </div>
          </div>
        </div>

        {/* Feedback sent state */}
        <div className="mt-6">
          <div
            className="flex items-center gap-5 rounded-xl border px-6 py-5"
            style={{
              background: "rgba(22,163,74,0.06)",
              borderColor: "rgba(22,163,74,0.25)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="inline-flex h-12 w-12 items-center justify-center rounded-full font-mono text-[14px] font-semibold text-white"
                style={{ background: "#2A4636" }}
              >
                AK
              </div>
              <div>
                <div className="font-display text-[15px] font-semibold text-white">
                  Feedback sendt til Anders
                </div>
                <div className="mt-0.5 font-mono text-[11px] tracking-[0.04em] text-white/55 tabular-nums">
                  Levert 18:17 · venter på lesebekreftelse
                </div>
              </div>
            </div>

            <div className="flex-1" />

            <div className="flex gap-2 opacity-60">
              <button
                disabled
                aria-label="Bra økt"
                className="inline-flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55"
              >
                <Smile className="h-[22px] w-[22px]" strokeWidth={1.5} />
              </button>
              <button
                disabled
                aria-label="Helt grei (valgt)"
                className="inline-flex h-12 w-12 cursor-default items-center justify-center rounded-full border border-accent bg-accent text-[#0A1F18]"
              >
                <Meh className="h-[22px] w-[22px]" strokeWidth={1.75} />
              </button>
              <button
                disabled
                aria-label="Slet med dette"
                className="inline-flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55"
              >
                <Frown className="h-[22px] w-[22px]" strokeWidth={1.5} />
              </button>
            </div>

            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ background: "rgba(22,163,74,0.10)", color: "#6EE7B7" }}
            >
              <Check className="h-[14px] w-[14px]" strokeWidth={2} />
              Sendt · takk
            </div>
          </div>

          <p className="mx-1 mt-3 text-[13px] text-white/55">
            «Putten rullet bedre på 5 m enn forrige uke. 10 m kan jobbes mer på distansekontroll.»
          </p>
        </div>
      </section>

      {/* Bottom bar */}
      <div className="relative z-10 grid grid-cols-[280px_1fr] items-center gap-4 border-t border-white/[0.06] px-6 py-4">
        <button className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-transparent text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06]">
          Detaljert post-økt
        </button>
        <button
          className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-[#0A1F18] transition-transform hover:bg-[#C2EE2F] active:scale-[0.99]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
          }}
        >
          Til min hjem
          <Home className="h-[22px] w-[22px]" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
