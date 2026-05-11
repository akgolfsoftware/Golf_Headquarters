/**
 * PILOT — PlayerHQ Live Summary (achievement)
 * Bygd direkte fra wireframe/_extracted/live-states/03-live-summary-achievement.html
 * URL: /live-summary-achievement-demo
 *
 * Fullskjerm dark — økt-sammendrag med ny badge unlocked (30-dagers streak).
 */

import { X, Award, Share2, Home } from "lucide-react";

type Wedge = { key: string; label: string; pct: number; color: string };

const WEDGES: Wedge[] = [
  { key: "tek", label: "TEK", pct: 60, color: "#D1F843" },
  { key: "slag", label: "SLAG", pct: 30, color: "#7BC4A0" },
  { key: "spill", label: "SPILL", pct: 10, color: "#3F8B6A" },
];

export default function LiveSummaryAchievementDemo() {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const wedges = WEDGES.reduce<Array<Wedge & { length: number; offset: number }>>(
    (acc, w) => {
      const length = (w.pct / 100) * circumference;
      const prevOffset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].length : 0;
      acc.push({ ...w, length, offset: prevOffset });
      return acc;
    },
    [],
  );

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
            Putte-økt onsdag · 14. mai 2026 · 17:34 – 18:16
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
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            <Award className="h-3.5 w-3.5" strokeWidth={1.5} />
            Økt fullført
          </div>
          <h1 className="mx-auto max-w-[880px] font-display text-[48px] italic leading-[1.15] text-white">
            6 av 6 øvelser. Bra jobba, Markus.
          </h1>
          <p className="mt-3.5 font-mono text-[13px] tracking-[0.08em] text-white/60">
            42 minutter aktiv · 142 reps totalt · 118 godkjent
          </p>
        </div>

        {/* Achievement banner */}
        <div
          className="relative mb-6 overflow-hidden rounded-2xl border border-accent/45 px-7 py-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(209,248,67,0.16), rgba(209,248,67,0.06))",
          }}
        >
          {/* Decorative outline backdrop */}
          <div className="pointer-events-none absolute -right-5 -top-8 opacity-10">
            <Award
              className="h-[220px] w-[220px] text-accent"
              strokeWidth={0.5}
            />
          </div>

          <div className="relative z-[1] flex items-center gap-6">
            <div
              className="grid h-[72px] w-[72px] flex-shrink-0 place-items-center rounded-[18px] bg-accent"
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.4), 0 14px 32px rgba(209,248,67,0.30)",
              }}
            >
              <Award className="h-9 w-9 text-[#0A1F18]" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                Ny badge låst opp
              </div>
              <div className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.015em] text-white">
                30-dagers streak · Konsistent
              </div>
              <p className="mt-1.5 text-[14px] leading-[1.5] text-white/70">
                Du har trent minst 4 økter i uka i 30 sammenhengende dager. Anders varsles automatisk.
              </p>
            </div>
            <div className="flex items-center gap-6 pr-2">
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                  Streak
                </div>
                <div className="mt-1.5 font-mono text-[40px] font-medium leading-[1] tabular-nums text-white">
                  30
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4.5 px-[18px] font-display text-[13px] font-medium text-white transition-colors hover:bg-black/35"
              >
                <Share2 className="h-[15px] w-[15px]" strokeWidth={1.5} />
                Del
              </button>
            </div>
          </div>
        </div>

        {/* Body grid: donut + 2x2 stats */}
        <div className="grid grid-cols-[360px_1fr] items-stretch gap-6">
          {/* Donut card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.20em] text-white/55">
              Pyramide-bidrag
            </div>
            <div className="mb-4 flex justify-center">
              <svg viewBox="0 0 200 200" width="172" height="172">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="22"
                />
                {wedges.map((w) => (
                  <circle
                    key={w.key}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={w.color}
                    strokeWidth="22"
                    strokeDasharray={`${w.length} ${circumference}`}
                    strokeDashoffset={-w.offset}
                    transform="rotate(-90 100 100)"
                  />
                ))}
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <LegendRow color="#D1F843" label="TEK" value="60 %" />
              <LegendRow color="#7BC4A0" label="SLAG" value="30 %" />
              <LegendRow color="#3F8B6A" label="SPILL" value="10 %" />
              <LegendRow color="#4A6B5C" label="FYS / TURN" value="0 %" muted />
            </div>
          </div>

          {/* Stats 2x2 */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            <StatCard label="Reps totalt" value="142" sub="+14 mot snitt" />
            <StatCard label="Godkjent" value="118" sub="83 % · +6 % vs forrige" valueColor="accent" />
            <StatCard label="Snitt-konfidens" value="81 %" sub="stabilt 4 økter" />
            <StatCard label="Beste streak · PR" value="14" sub="reps på rad" highlight />
          </div>
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

function LegendRow({
  color,
  label,
  value,
  muted = false,
}: {
  color: string;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-sm"
        style={{ background: color, opacity: muted ? 0.4 : 1 }}
      />
      <span className="font-mono text-[11px] text-white/65">{label}</span>
      <span
        className={`ml-auto font-mono text-[11px] ${muted ? "text-white/40" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  valueColor,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  valueColor?: "accent";
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-6 py-5 ${
        highlight ? "border-accent/30 bg-accent/[0.08]" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div
        className={`font-mono text-[10px] uppercase tracking-[0.20em] ${
          highlight ? "text-accent" : "text-white/55"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-1.5 font-mono text-[40px] font-medium leading-[1] tracking-[-0.02em] tabular-nums ${
          valueColor === "accent" ? "text-accent" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[12px] text-white/60">{sub}</div>
    </div>
  );
}
