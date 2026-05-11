/**
 * DEMO — Klubb-leaderboard (modal-versjon)
 * Bygd fra wireframe live-states/e3-leaderboard-default.html
 * URL: /leaderboard-modal-demo
 */

import { Calendar, ChevronDown, Share2, X } from "lucide-react";

type LbRow = {
  rank: number;
  initials: string;
  name: string;
  sessions: string;
  hcp: string;
  change: string;
  spark: string;
  isMe?: boolean;
  medal?: "gold" | "silver" | "bronze";
};

const ROWS: LbRow[] = [
  {
    rank: 1,
    initials: "JT",
    name: "Joachim Tangen",
    sessions: "14 økter",
    hcp: "5,2",
    change: "−1,8",
    spark: "0,10 16,12 32,8 48,9 64,5 80,3",
    medal: "gold",
  },
  {
    rank: 2,
    initials: "HN",
    name: "Henrik Nilsen",
    sessions: "12 økter",
    hcp: "7,8",
    change: "−1,2",
    spark: "0,8 16,10 32,7 48,11 64,7 80,5",
    medal: "silver",
  },
  {
    rank: 3,
    initials: "AK",
    name: "Anna Karlsen",
    sessions: "11 økter",
    hcp: "9,4",
    change: "−0,8",
    spark: "0,7 16,9 32,10 48,8 64,9 80,7",
    medal: "bronze",
  },
  {
    rank: 4,
    initials: "MR",
    name: "Mads Rønning",
    sessions: "9 økter",
    hcp: "10,8",
    change: "−0,5",
    spark: "0,9 16,11 32,8 48,10 64,9 80,8",
  },
  {
    rank: 5,
    initials: "ES",
    name: "Emma Solberg",
    sessions: "10 økter",
    hcp: "11,5",
    change: "−0,3",
    spark: "0,8 16,9 32,11 48,9 64,10 80,9",
  },
  {
    rank: 6,
    initials: "LS",
    name: "Lise Sandberg",
    sessions: "8 økter",
    hcp: "12,1",
    change: "−0,2",
    spark: "0,10 16,9 32,10 48,10 64,9 80,9",
  },
  {
    rank: 7,
    initials: "MR",
    name: "Markus Roinås Pedersen",
    sessions: "7 økter",
    hcp: "12,4",
    change: "−0,4",
    spark: "0,9 16,11 32,8 48,9 64,7 80,6",
    isMe: true,
  },
];

const MEDAL_STYLE: Record<NonNullable<LbRow["medal"]>, string> = {
  gold: "bg-[#F4C430] text-[#3A2D08]",
  silver: "bg-[#D4D4D4] text-[#3A3A3A]",
  bronze: "bg-[#CD7F32] text-[#3A2308]",
};

const FILTERS = ["HCP-trend", "Score-snitt", "Økter loggført", "Forbedring 30d"];

export default function LeaderboardModalDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[720px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
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

        {/* Body */}
        <div className="px-6 py-6">
          {/* Filter chips */}
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f, i) => (
              <button
                key={f}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  i === 0
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Range + meta */}
          <div className="mb-3 flex items-center justify-between">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] font-medium">
              <Calendar size={14} strokeWidth={1.5} />
              Siste 30 dager
              <ChevronDown size={14} strokeWidth={1.5} className="text-muted-foreground" />
            </button>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Viser 7 av 32
            </span>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-border">
            {/* Header row */}
            <div className="grid grid-cols-[44px_1fr_70px_80px_90px] gap-3 border-b border-border bg-secondary px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <div>#</div>
              <div>Spiller</div>
              <div>HCP</div>
              <div>Endring</div>
              <div>Trend</div>
            </div>

            {ROWS.map((row, i) => (
              <div
                key={row.rank}
                className={`grid grid-cols-[44px_1fr_70px_80px_90px] items-center gap-3 px-4 py-3 ${
                  row.isMe ? "bg-accent/20 border-l-[3px] border-l-accent pl-[13px]" : ""
                } ${i < ROWS.length - 1 ? "border-b border-border" : ""}`}
              >
                {row.medal ? (
                  <span
                    className={`inline-grid h-[22px] w-fit place-items-center rounded-full px-2 font-mono text-[11px] font-semibold ${MEDAL_STYLE[row.medal]}`}
                  >
                    {row.rank}
                  </span>
                ) : (
                  <span className="pl-1.5 font-mono text-[13px] tabular-nums text-muted-foreground">
                    {row.rank}
                  </span>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {row.initials}
                  </span>
                  <div>
                    <div className={`text-sm ${row.isMe ? "font-bold" : "font-semibold"}`}>
                      {row.name}
                      {row.isMe && (
                        <span className="ml-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-primary">
                          · deg
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                      {row.sessions}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-mono text-sm tabular-nums ${row.isMe ? "font-semibold text-primary" : "font-medium"}`}
                >
                  {row.hcp}
                </div>
                <div
                  className={`font-mono text-xs tabular-nums text-[#1A7D56] ${row.isMe ? "font-semibold" : ""}`}
                >
                  {row.change}
                </div>
                <svg viewBox="0 0 80 20" width="80" height="20" aria-hidden>
                  <polyline
                    points={row.spark}
                    fill="none"
                    stroke={row.isMe ? "hsl(var(--primary))" : "#1A7D56"}
                    strokeWidth={row.isMe ? 2 : 1.5}
                  />
                </svg>
              </div>
            ))}

            <button className="w-full border-t border-border bg-transparent py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:bg-secondary">
              Last 25 til ned
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Lukk
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            <Share2 size={14} strokeWidth={1.5} />
            Del leaderboard
          </button>
        </footer>
      </div>
    </div>
  );
}
