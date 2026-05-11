/**
 * DEMO — PlayerHQ Live Summary (mobile)
 * Bygd fra wireframe/_extracted/live-states/03-live-summary-mobile.html
 * URL: /live-summary-mobile-demo
 *
 * Fullskjerm dark mobile-variant. Telefon-bredde 420px.
 */

import { X, ChevronRight, Home } from "lucide-react";

type Wedge = {
  key: string;
  label: string;
  pct: number;
  color: string;
};

const WEDGES: Wedge[] = [
  { key: "tek", label: "TEK", pct: 60, color: "#D1F843" },
  { key: "slag", label: "SLAG", pct: 30, color: "#7BC4A0" },
  { key: "spill", label: "SPILL", pct: 10, color: "#3F8B6A" },
];

type Stat = {
  label: string;
  sub: string;
  value: string;
  accent?: boolean;
};

const STATS: Stat[] = [
  { label: "Reps totalt", sub: "+14 mot snitt", value: "142" },
  { label: "Godkjent", sub: "83 % · +6 % vs forrige", value: "118", accent: true },
  { label: "Snitt-konfidens", sub: "stabilt 4 økter", value: "81 %" },
  { label: "Beste streak", sub: "reps på rad · ny PR", value: "14" },
];

export default function LiveSummaryMobileDemo() {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="min-h-screen w-full bg-[#050D0A] flex justify-center">
      <div className="relative w-full max-w-[420px] min-h-screen bg-[#0A1F18] text-white flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-white/[0.06] px-4 h-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-white/60" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-white/65">
              Ferdig
            </span>
          </div>
          <button
            aria-label="Lukk"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </header>

        {/* Center */}
        <section className="flex-1 px-4 py-6">
          {/* Hero */}
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
              Økt fullført
            </div>
            <h1 className="font-display text-[34px] leading-[1.15] text-white">
              <em className="italic">6 av 6 øvelser.</em>
              <br />
              Bra jobba, Markus.
            </h1>
            <p className="mt-3 font-mono text-[12px] tracking-[0.06em] text-white/65 tabular-nums">
              Putte-økt onsdag · 42 min · 142 reps
            </p>
          </div>

          {/* Donut compact */}
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Pyramide-bidrag
            </div>
            <div className="flex items-center gap-5">
              <svg
                viewBox="0 0 200 200"
                width="120"
                height="120"
                className="flex-shrink-0"
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
              <div className="flex flex-1 flex-col gap-2">
                {WEDGES.map((w) => (
                  <div key={w.key} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ background: w.color }}
                    />
                    <span className="font-mono text-[11px] text-white/65">
                      {w.label}
                    </span>
                    <span className="ml-auto font-mono text-[11px] tabular-nums text-white">
                      {w.pct} %
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats stacked */}
          <div className="space-y-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4"
              >
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
                    {s.label}
                  </div>
                  <div className="mt-1 font-mono text-[12px] text-white/65">
                    {s.sub}
                  </div>
                </div>
                <div
                  className={`font-mono text-[32px] font-medium leading-none tracking-[-0.02em] tabular-nums ${
                    s.accent ? "text-accent" : "text-white"
                  }`}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback collapsed */}
          <button className="mt-4 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition-colors hover:bg-white/[0.06]">
            <div
              className="inline-flex h-11 w-11 items-center justify-center rounded-full font-mono text-[13px] font-semibold text-white"
              style={{ background: "#2A4636" }}
            >
              AK
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[14px] font-semibold text-white">
                Feedback til Anders
              </div>
              <div className="font-mono text-[11px] tracking-[0.04em] text-white/55">
                Valgfri
              </div>
            </div>
            <ChevronRight
              className="h-[18px] w-[18px] text-white/65"
              strokeWidth={1.5}
            />
          </button>
        </section>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] p-4 space-y-3">
          <button
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent font-display text-[16px] font-semibold text-[#0A1F18] transition-transform active:scale-[0.99]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)",
            }}
          >
            Til min hjem
            <Home className="h-5 w-5" strokeWidth={2} />
          </button>
          <button className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-transparent font-display text-[14px] text-white transition-colors hover:bg-white/[0.06]">
            Detaljert post-økt
          </button>
        </div>
      </div>
    </div>
  );
}
