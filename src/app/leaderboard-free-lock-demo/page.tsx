/**
 * DEMO — Klubb-leaderboard (Free tier — Pro-lock overlay)
 * Bygd fra wireframe live-states/e3-leaderboard-free-lock.html
 * URL: /leaderboard-free-lock-demo
 */

import { ArrowRight, Check, Lock, X } from "lucide-react";

type PreviewRow = {
  rank: number;
  initials: string;
  name: string;
  hcp: string;
  medal: "gold" | "silver" | "bronze";
};

const PREVIEW_ROWS: PreviewRow[] = [
  { rank: 1, initials: "JT", name: "Joachim Tangen", hcp: "5,2", medal: "gold" },
  { rank: 2, initials: "HN", name: "Henrik Nilsen", hcp: "7,8", medal: "silver" },
  { rank: 3, initials: "AK", name: "Anders Kristiansen", hcp: "9,4", medal: "bronze" },
];

const MEDAL_STYLE: Record<PreviewRow["medal"], string> = {
  gold: "bg-[#F4C430] text-[#3A2D08]",
  silver: "bg-[#D4D4D4] text-[#3A3A3A]",
  bronze: "bg-[#CD7F32] text-[#3A2308]",
};

const PRO_BENEFITS = [
  "Full topp-32 rangering med HCP, score, økter",
  "30-dagers trend og forbedring per spiller",
  "Filtrering på 4 metrikker + sammenligning",
];

export default function LeaderboardFreeLockDemo() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="relative w-full max-w-[720px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-border px-6 pt-6 pb-5">
          <div>
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
              <em className="italic">Klubb</em>-leaderboard
            </h1>
            <div className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Gamle Fredrikstad Golfklubb · 32 aktive spillere
            </div>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </header>

        {/* Body with blurred preview + lock overlay */}
        <div className="relative px-6 py-6">
          {/* Blurred preview */}
          <div
            aria-hidden
            className="pointer-events-none select-none opacity-60 blur-[6px]"
          >
            <div className="mb-4 flex flex-wrap gap-2">
              <button className="rounded-full border border-foreground bg-foreground px-3.5 py-1.5 text-[13px] font-medium text-background">
                HCP-trend
              </button>
              <button className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-foreground">
                Score-snitt
              </button>
              <button className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-foreground">
                Økter loggført
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              {PREVIEW_ROWS.map((row, i) => (
                <div
                  key={row.rank}
                  className={`grid grid-cols-[44px_1fr_70px] items-center gap-3 px-4 py-3 ${
                    i < PREVIEW_ROWS.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span
                    className={`inline-grid h-[22px] w-fit place-items-center rounded-full px-2 font-mono text-[11px] font-semibold ${MEDAL_STYLE[row.medal]}`}
                  >
                    {row.rank}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                      {row.initials}
                    </span>
                    <div className="text-sm font-semibold">{row.name}</div>
                  </div>
                  <div className="font-mono text-sm font-medium tabular-nums">
                    {row.hcp}
                  </div>
                </div>
              ))}
              <div className="h-12 border-t border-border" />
              <div className="h-12 border-t border-border" />
            </div>
          </div>

          {/* Lock overlay card */}
          <div className="absolute left-1/2 top-1/2 w-[88%] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary">
              <Lock size={32} strokeWidth={1.5} />
            </div>
            <div className="font-display text-[24px] italic leading-[1.2]">
              Full leaderboard er en Pro-funksjon
            </div>
            <p className="mt-2.5 mb-6 text-sm leading-relaxed text-muted-foreground">
              Du ser topp 3. Med Pro får du tilgang til hele klubbens rangering,
              trender og filtre.
            </p>

            <div className="mb-6 flex flex-col gap-2.5 text-left">
              {PRO_BENEFITS.map((b) => (
                <div key={b} className="flex items-center gap-2.5 text-sm">
                  <span className="text-[#1A7D56]">
                    <Check size={16} strokeWidth={2} />
                  </span>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Oppgrader til Pro · 300 kr/mnd
              <ArrowRight size={16} strokeWidth={2} />
            </button>
            <div className="mt-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              3 000 kr/år · spar 600 kr
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Lukk
          </button>
          <span />
        </footer>
      </div>
    </div>
  );
}
