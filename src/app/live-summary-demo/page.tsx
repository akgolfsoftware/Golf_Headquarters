/**
 * PILOT — PlayerHQ Live Summary (økt-oppsummering)
 * Bygd direkte fra wireframe/_extracted/live-states/03-live-summary-default.html
 * URL: /live-summary-demo
 *
 * Fullskjerm dark live-modus. Hero, pyramide-donut, stat-grid, coach-feedback.
 */

import {
  X,
  Trophy,
  LineChart,
  Pencil,
  SmilePlus,
  Meh,
  Frown,
  Home,
} from "lucide-react";

// Donut math — fordeling per kategori
type Wedge = {
  key: string;
  label: string;
  pct: number;
  color: string;
};

const WEDGES: Wedge[] = [
  { key: "fys", label: "FYS", pct: 0, color: "#4A6B5C" },
  { key: "tek", label: "TEK", pct: 60, color: "#D1F843" },
  { key: "slag", label: "SLAG", pct: 30, color: "#7BC4A0" },
  { key: "spill", label: "SPILL", pct: 10, color: "#3F8B6A" },
  { key: "turn", label: "TURN", pct: 0, color: "#2A4636" },
];

function computeWedgeSegments(
  wedges: (typeof WEDGES)[number][],
  circumference: number,
) {
  let offset = 0;
  return wedges
    .filter((w) => w.pct > 0)
    .map((w) => {
      const length = (w.pct / 100) * circumference;
      const current = offset;
      offset -= length;
      return { ...w, length, dashOffset: current };
    });
}

export default function LiveSummaryDemo() {
  const radius = 80;
  const circumference = 2 * Math.PI * radius; // ~502.65
  const wedgeSegments = computeWedgeSegments(WEDGES, circumference);

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
            Putte-økt onsdag · 13. mai 2026 · 14:30 – 15:08
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
            <Trophy className="h-[14px] w-[14px]" strokeWidth={1.5} />
            Økt fullført
          </div>
          <h1 className="mx-auto max-w-[880px] font-display text-[56px] leading-[1.15] text-white">
            <em className="italic">6 av 6 øvelser.</em> Bra jobba, Markus.
          </h1>
          <p className="mt-4 font-mono text-[13px] tracking-[0.08em] text-white/65 tabular-nums">
            38 minutter aktiv · 142 reps totalt · 118 godkjent
          </p>
        </div>

        {/* Body grid: donut + stats */}
        <div className="grid grid-cols-[360px_1fr] items-stretch gap-8">
          {/* Donut card */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-7">
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Pyramide-fordeling
            </div>

            <div className="mb-6 flex justify-center">
              <svg
                viewBox="0 0 200 200"
                width="200"
                height="200"
                aria-label="Pyramide-donut"
              >
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="22"
                />
                {wedgeSegments.map((w) => (
                  <circle
                    key={w.key}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={w.color}
                    strokeWidth="22"
                    strokeDasharray={`${w.length} ${circumference}`}
                    strokeDashoffset={w.dashOffset}
                    transform="rotate(-90 100 100)"
                  />
                ))}
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {WEDGES.map((w) => (
                <div key={w.key} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{
                      background: w.color,
                      opacity: w.pct === 0 ? 0.4 : 1,
                    }}
                  />
                  <span className="font-mono text-[11px] tracking-[0.04em] text-white/65">
                    {w.label}
                  </span>
                  <span
                    className={`ml-auto font-mono text-[11px] tabular-nums ${
                      w.pct === 0 ? "text-white/45" : "text-white"
                    }`}
                  >
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
              <div className="mt-1.5 font-mono text-[12px] text-white/55">
                +14 mot snitt
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
                Godkjent
              </div>
              <div className="mt-2 font-mono text-[48px] font-medium leading-none tracking-[-0.02em] tabular-nums text-accent">
                118
              </div>
              <div className="mt-1.5 font-mono text-[12px] text-white/55">
                83 % · +6 % vs forrige
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
                Snitt-konfidens
              </div>
              <div className="mt-2 font-mono text-[48px] font-medium leading-none tracking-[-0.02em] tabular-nums text-white">
                81 %
              </div>
              <div className="mt-1.5 font-mono text-[12px] text-white/55">
                stabilt 4 økter på rad
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
                Beste streak
              </div>
              <div className="mt-2 font-mono text-[48px] font-medium leading-none tracking-[-0.02em] tabular-nums text-white">
                14
              </div>
              <div className="mt-1.5 font-mono text-[12px] text-white/55">
                reps på rad · ny PR
              </div>
            </div>
          </div>
        </div>

        {/* Coach feedback */}
        <div className="mt-6 flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className="inline-flex h-12 w-12 items-center justify-center rounded-full font-mono text-[14px] font-semibold text-white"
              style={{ background: "#2A4636" }}
            >
              AK
            </div>
            <div>
              <div className="font-display text-[15px] font-semibold text-white">
                Send rask feedback til Anders
              </div>
              <div className="mt-0.5 font-mono text-[11px] tracking-[0.04em] text-white/55">
                Coach · svarer typisk innen 4 timer
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex gap-2">
            <button
              aria-label="Bra økt"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <SmilePlus className="h-[22px] w-[22px]" strokeWidth={1.5} />
            </button>
            <button
              aria-label="Helt grei"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <Meh className="h-[22px] w-[22px]" strokeWidth={1.5} />
            </button>
            <button
              aria-label="Slet med dette"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <Frown className="h-[22px] w-[22px]" strokeWidth={1.5} />
            </button>
          </div>

          <button className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-transparent px-5 font-display text-[13px] text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white">
            <Pencil className="h-[15px] w-[15px]" strokeWidth={1.5} />
            Skriv kommentar
          </button>
        </div>
      </section>

      {/* Bottom bar */}
      <div className="relative z-10 grid grid-cols-[280px_1fr] items-center gap-4 border-t border-white/[0.06] px-6 py-4">
        <button className="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-transparent text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06]">
          <LineChart className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Detaljert post-økt
        </button>
        <button
          className="inline-flex h-[72px] items-center justify-center gap-3 rounded-xl bg-accent text-[18px] font-semibold tracking-[-0.01em] text-[#0A1F18] transition-transform hover:bg-[#C2EE2F] active:scale-[0.99]"
          style={{
            boxShadow:
              "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
          }}
        >
          Lagre og avslutt
          <Home className="h-[22px] w-[22px]" strokeWidth={2} />
          <span className="ml-2 inline-flex items-center rounded-md border border-[#0A1F18]/25 bg-[#0A1F18]/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.10em] text-[#0A1F18]">
            enter
          </span>
        </button>
      </div>
    </div>
  );
}
