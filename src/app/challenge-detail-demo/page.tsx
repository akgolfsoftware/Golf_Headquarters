/**
 * DEMO — Challenge detail
 * Bygd fra wireframe live-states/e2-challenge-detail-default.html
 * URL: /challenge-detail-demo
 */

import { ArrowRight, Target, X } from "lucide-react";

type Row = {
  rank: number;
  initials: string;
  name: string;
  meta: string;
  score: string;
  delta: string;
  isMe?: boolean;
  medal?: "gold" | "silver" | "bronze";
  notPlayed?: boolean;
};

const ROWS: Row[] = [
  {
    rank: 1,
    initials: "HN",
    name: "Henrik Nilsen",
    meta: "i går 18:42",
    score: "9/10",
    delta: "+2 vs snitt",
    medal: "gold",
  },
  {
    rank: 2,
    initials: "AK",
    name: "Anna Karlsen",
    meta: "for 2 dager siden",
    score: "8/10",
    delta: "+1",
    medal: "silver",
  },
  {
    rank: 3,
    initials: "MR",
    name: "Markus Roinås Pedersen",
    meta: "i dag 11:08 · HCP 12,4",
    score: "7/10",
    delta: "på snitt",
    isMe: true,
    medal: "bronze",
  },
  {
    rank: 4,
    initials: "MR",
    name: "Mads Rønning",
    meta: "for 3 dager siden",
    score: "6/10",
    delta: "−1",
  },
  {
    rank: 5,
    initials: "LS",
    name: "Lise Sandberg",
    meta: "ikke spilt ennå",
    score: "—",
    delta: "",
    notPlayed: true,
  },
];

const MEDAL_STYLE: Record<NonNullable<Row["medal"]>, string> = {
  gold: "bg-[#F4C430] text-[#3A2D08]",
  silver: "bg-[#D4D4D4] text-[#3A3A3A]",
  bronze: "bg-[#CD7F32] text-[#3A2308]",
};

export default function ChallengeDetailDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[720px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-border px-6 pt-6 pb-5">
          <div>
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
              10 putts fra <em className="italic">3 m</em>
            </h1>
            <div className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Challenge · 5 deltakere · 3 dager igjen
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
        <div className="space-y-5 px-6 py-6">
          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-accent/40 bg-accent/20 p-4">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
                Din score
              </div>
              <div className="mt-1 font-mono text-[32px] font-medium leading-none tabular-nums">
                7<span className="text-[18px] text-muted-foreground">/10</span>
              </div>
              <div className="mt-1 text-xs text-primary">Rang #3</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Beste
              </div>
              <div className="mt-1 font-mono text-[32px] font-medium leading-none tabular-nums">
                9<span className="text-[18px] text-muted-foreground">/10</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Henrik N</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Gjenværende
              </div>
              <div className="mt-1 font-mono text-[28px] font-medium leading-none tabular-nums">
                3d 14t
              </div>
              <div className="mt-1 text-xs text-muted-foreground">til 14. mai 16:00</div>
            </div>
          </div>

          {/* Drill description */}
          <div className="flex gap-5 rounded-xl border border-border bg-card p-5">
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-primary">
                  <Target size={16} strokeWidth={1.5} />
                </span>
                <div className="text-[15px] font-semibold">Drill-beskrivelse</div>
                <span className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  TEK
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Stå 3 meter fra hullet med 10 baller. Putt én av gangen, tell antall som ruller i. Beste
                forsøk av flere runder teller på leaderboard.
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg
                width="110"
                height="110"
                viewBox="0 0 110 110"
                className="rounded-md bg-secondary"
                aria-hidden
              >
                <circle cx="55" cy="22" r="9" fill="hsl(var(--foreground))" />
                <circle cx="55" cy="22" r="3" fill="hsl(var(--accent))" />
                <g fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="1">
                  <circle cx="35" cy="86" r="4" />
                  <circle cx="45" cy="86" r="4" />
                  <circle cx="55" cy="86" r="4" />
                  <circle cx="65" cy="86" r="4" />
                  <circle cx="75" cy="86" r="4" />
                  <circle cx="40" cy="94" r="4" />
                  <circle cx="50" cy="94" r="4" />
                  <circle cx="60" cy="94" r="4" />
                  <circle cx="70" cy="94" r="4" />
                  <circle cx="55" cy="102" r="4" />
                </g>
                <line
                  x1="55"
                  y1="78"
                  x2="55"
                  y2="35"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </svg>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Leaderboard
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              {ROWS.map((row) => (
                <div
                  key={row.rank}
                  className={`grid grid-cols-[48px_1fr_80px_120px] items-center gap-3 px-4 py-3 ${
                    row.isMe ? "bg-accent/20 border-l-[3px] border-l-accent pl-[13px]" : ""
                  } ${row.rank < ROWS.length ? "border-b border-border" : ""}`}
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
                      <div
                        className={`text-sm ${row.isMe ? "font-bold" : "font-semibold"} ${row.notPlayed ? "text-muted-foreground" : ""}`}
                      >
                        {row.name}
                        {row.isMe && (
                          <span className="ml-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-primary">
                            · deg
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                        {row.meta}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-mono tabular-nums ${
                      row.isMe
                        ? "text-[20px] font-semibold text-primary"
                        : row.notPlayed
                          ? "text-[13px] text-muted-foreground"
                          : "text-[18px] font-medium"
                    }`}
                  >
                    {row.score}
                  </div>
                  <div
                    className={`text-right font-mono text-[11px] tracking-[0.04em] ${
                      row.delta.startsWith("+")
                        ? "text-[#1A7D56]"
                        : row.delta.startsWith("−")
                          ? "text-muted-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {row.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            Detaljer
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Spill igjen
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}
