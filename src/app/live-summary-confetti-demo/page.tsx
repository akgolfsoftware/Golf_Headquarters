/**
 * PILOT — PlayerHQ Live Summary (Konfetti / Personlig rekord)
 * Bygd direkte fra wireframe/_extracted/live-states/03-live-summary-confetti.html
 * URL: /live-summary-confetti-demo
 *
 * Hero med stor sjekkmark + konfetti-SVG-dotter spredt over skjermen.
 * "Personlig rekord!"-overlay-pill. Tre inline statchips.
 */

import { Home, Trophy, X } from "lucide-react";

type Confetto = {
  left: string;
  top?: string;
  bg: string;
  rot: number;
};

const CONFETTI: Confetto[] = [
  { left: "8%", bg: "#D1F843", rot: 540 },
  { left: "14%", bg: "#16A34A", rot: -420 },
  { left: "18%", bg: "#FFFFFF", rot: 300 },
  { left: "22%", bg: "#D1F843", rot: -380 },
  { left: "28%", bg: "#F4C430", rot: 480 },
  { left: "34%", bg: "#D1F843", rot: -520 },
  { left: "40%", bg: "#FFFFFF", rot: 240 },
  { left: "46%", bg: "#16A34A", rot: -180 },
  { left: "52%", bg: "#D1F843", rot: 600 },
  { left: "58%", bg: "#FFFFFF", rot: -360 },
  { left: "62%", bg: "#F4C430", rot: 280 },
  { left: "68%", bg: "#16A34A", rot: -420 },
  { left: "72%", bg: "#D1F843", rot: 540 },
  { left: "78%", bg: "#FFFFFF", rot: -300 },
  { left: "84%", bg: "#D1F843", rot: 480 },
  { left: "90%", bg: "#16A34A", rot: -600 },
  { left: "94%", bg: "#D1F843", rot: 360 },
  { left: "12%", top: "10%", bg: "#D1F843", rot: 520 },
  { left: "30%", top: "18%", bg: "#FFFFFF", rot: -380 },
  { left: "50%", top: "14%", bg: "#F4C430", rot: 320 },
  { left: "70%", top: "18%", bg: "#16A34A", rot: -460 },
  { left: "88%", top: "8%", bg: "#D1F843", rot: 540 },
];

export default function LiveSummaryConfettiDemo() {
  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr_104px] overflow-hidden bg-[#0A1F18] text-white">
      {/* Konfetti-lag */}
      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="absolute block h-3.5 w-2 rounded-[1px]"
            style={{
              left: c.left,
              top: c.top ?? "20%",
              background: c.bg,
              opacity: 0.85,
              transform: `rotate(${c.rot}deg)`,
            }}
          />
        ))}
      </div>

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

      {/* Center hero */}
      <section className="relative z-[6] mx-auto flex w-full max-w-[1100px] flex-col items-center px-16 pt-12 pb-8 text-center">
        {/* Big celebratory mark */}
        <div className="relative mb-8 h-40 w-40">
          <svg viewBox="0 0 160 160" width="160" height="160">
            <circle
              cx="80"
              cy="80"
              r="74"
              fill="none"
              stroke="rgba(209,248,67,0.18)"
              strokeWidth="2"
            />
            <circle
              cx="80"
              cy="80"
              r="64"
              fill="rgba(209,248,67,0.10)"
              stroke="var(--accent, #D1F843)"
              strokeWidth="2"
            />
            <path
              d="M58 82 L74 96 L106 64"
              fill="none"
              stroke="var(--accent, #D1F843)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 24px rgba(209,248,67,0.55))" }}
            />
          </svg>
        </div>

        {/* Personlig rekord overlay-pill */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          <Trophy className="h-[14px] w-[14px]" strokeWidth={1.5} />
          Personlig rekord!
        </div>

        <h1 className="max-w-[900px] font-display text-[64px] leading-[1.1] text-white">
          <em className="italic">6 av 6 øvelser.</em> Bra jobba, Markus.
        </h1>
        <p className="mt-5 font-mono text-[14px] tracking-[0.10em] text-white/65 tabular-nums">
          Putte-økt onsdag · 42 minutter · 142 reps · 118 godkjent
        </p>

        {/* Top-line stats inline */}
        <div className="mt-12 flex gap-4">
          <div className="min-w-[180px] rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Godkjent
            </div>
            <div className="mt-2 font-mono text-[28px] font-medium tabular-nums text-accent">
              83 %
            </div>
          </div>
          <div className="min-w-[180px] rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Snitt-konfidens
            </div>
            <div className="mt-2 font-mono text-[28px] font-medium tabular-nums text-white">
              81 %
            </div>
          </div>
          <div className="min-w-[180px] rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Beste streak
            </div>
            <div className="mt-2 font-mono text-[28px] font-medium tabular-nums text-white">
              14
            </div>
          </div>
        </div>

        <div className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55 tabular-nums">
          Full oversikt om 0,2 s · klikk for å hoppe
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
