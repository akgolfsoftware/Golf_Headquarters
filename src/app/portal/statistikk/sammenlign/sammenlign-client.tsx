"use client";

import { useState } from "react";
import { Target, Users, Trophy, UserPlus, Search, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

type Comp = "hcp" | "age" | "top" | "friend";

const TABS: Array<{ id: Comp; label: string; icon: typeof Target; count?: string }> = [
  { id: "hcp", label: "Min HCP-gruppe", icon: Target, count: "n=18" },
  { id: "age", label: "Min aldersgruppe", icon: Users, count: "n=156" },
  { id: "top", label: "Topp 10 % U18", icon: Trophy, count: "n=42" },
  { id: "friend", label: "Spesifikk spiller …", icon: UserPlus },
];

type KpiRow = {
  metric: string;
  sub: string;
  you: string;
  bm: string;
  diff: string;
  diffSub: string;
  up: boolean;
};

const KPI_ROWS: KpiRow[] = [
  { metric: "Score per runde", sub: "Snitt 18 hull", you: "71,4", bm: "70,1", diff: "+1,3", diffSub: "slag", up: false },
  { metric: "SG: Tee", sub: "Off the tee · snitt", you: "+0,42", bm: "+0,12", diff: "+0,30", diffSub: "SG/runde", up: true },
  { metric: "SG: Approach", sub: "100–200m · snitt", you: "−0,18", bm: "+0,24", diff: "−0,42", diffSub: "SG/runde", up: false },
  { metric: "SG: Rundt green", sub: "ARG · chip / pitch / bunker", you: "+0,15", bm: "+0,29", diff: "−0,14", diffSub: "SG/runde", up: false },
  { metric: "SG: Putting", sub: "Putts · snitt/runde", you: "−0,28", bm: "+0,18", diff: "−0,46", diffSub: "SG/runde", up: false },
  { metric: "SG: Total", sub: "Sum SG/runde", you: "+0,11", bm: "+0,83", diff: "−0,72", diffSub: "SG/runde", up: false },
  { metric: "Tee · distanse", sub: "Snitt (m)", you: "264 m", bm: "258 m", diff: "+6 m", diffSub: "lengre", up: true },
  { metric: "Birdies per runde", sub: "Snitt", you: "2,8", bm: "3,1", diff: "−0,3", diffSub: "færre", up: false },
];

export function SammenlignClient({ userName }: { userName: string }) {
  const [comp, setComp] = useState<Comp>("top");

  return (
    <>
      {/* Comparator tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = comp === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setComp(t.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <Icon size={13} strokeWidth={1.75} />
              {t.label}
              {t.count && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {comp === "friend" && (
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Søk i venner og klubbmedlemmer …"
            className="w-full rounded-md border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Radar + insight */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <h3 className="mb-4 font-display text-base font-semibold">Radarprofil</h3>
          <div className="mx-auto max-w-md">
            <svg viewBox="-220 -200 440 400" className="h-auto w-full">
              <g fill="none" stroke="hsl(var(--border))" strokeWidth="1">
                <polygon points="0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25" />
                <polygon points="0,-100 86.6,-50 86.6,50 0,100 -86.6,50 -86.6,-50" />
                <polygon points="0,-150 129.9,-75 129.9,75 0,150 -129.9,75 -129.9,-75" />
                <polygon points="0,-200 173.2,-100 173.2,100 0,200 -173.2,100 -173.2,-100" />
              </g>
              <g stroke="hsl(var(--border))" strokeWidth="1">
                <line x1="0" y1="0" x2="0" y2="-200" />
                <line x1="0" y1="0" x2="173.2" y2="-100" />
                <line x1="0" y1="0" x2="173.2" y2="100" />
                <line x1="0" y1="0" x2="0" y2="200" />
                <line x1="0" y1="0" x2="-173.2" y2="100" />
                <line x1="0" y1="0" x2="-173.2" y2="-100" />
              </g>
              <polygon
                points="0,-136 117.8,-68 121.2,70 0,144 -112.6,65 -117.8,-68"
                fill="rgba(94,92,87,0.10)"
                stroke="#908D86"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <polygon
                points="0,-156 122.9,-71 100.5,58 0,104 -90.1,52 -129.9,-75"
                fill="rgba(0,88,64,0.18)"
                stroke="#005840"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <g fill="#D1F843" stroke="#005840" strokeWidth="2">
                <circle cx="0" cy="-156" r="4" />
                <circle cx="122.9" cy="-71" r="4" />
                <circle cx="100.5" cy="58" r="4" />
                <circle cx="0" cy="104" r="4" />
                <circle cx="-90.1" cy="52" r="4" />
                <circle cx="-129.9" cy="-75" r="4" />
              </g>
              <g fontSize="11" fontWeight="700" fill="hsl(var(--foreground))" letterSpacing="1">
                <text x="0" y="-210" textAnchor="middle">TEE</text>
                <text x="190" y="-100" textAnchor="start">APPROACH</text>
                <text x="190" y="108" textAnchor="start">PUTTING</text>
                <text x="0" y="220" textAnchor="middle">RUNDT GREEN</text>
                <text x="-190" y="108" textAnchor="end">FYS</text>
                <text x="-190" y="-100" textAnchor="end">TURN</text>
              </g>
            </svg>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
              {userName}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm border-2 border-dashed border-muted-foreground" />
              Topp 10 % U18 (snitt, n = 42)
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/[0.04] p-4 md:p-6">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
            Insight
          </span>
          <p className="font-display text-lg font-semibold leading-snug">
            Du er <strong>+8 %</strong> sterkere på <em className="italic">SG: Tee</em>,
            men taper <strong>1,2 putts/runde</strong> på{" "}
            <em className="italic">SG: Putting</em> mot topp-10-snittet.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <InsightBullet up label="SG: Tee — fortrinn" val="+8 %" />
            <InsightBullet up label="Tee · distanse 6 m lengre" val="+6 m" />
            <InsightBullet label="SG: Putting mest å hente" val="+1,2" />
            <InsightBullet label="SG: Rundt green under benchmark" val="−6 %" />
          </div>
        </div>
      </section>

      {/* KPI tabell */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-[1.5fr_80px_120px_120px] gap-4 border-b border-border bg-muted/40 px-6 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground sm:grid">
          <div>Metrikk</div>
          <div className="text-right">Deg</div>
          <div className="text-right">
            Topp 10 % U18
            <div className="font-normal text-[9px]">n = 42 · siste 90 dager</div>
          </div>
          <div className="text-right">Diff</div>
        </div>
        <ul>
          {KPI_ROWS.map((r, i) => (
            <li
              key={i}
              className="grid grid-cols-2 gap-3 border-b border-border/60 px-4 py-4 last:border-0 sm:grid-cols-[1.5fr_80px_120px_120px] sm:gap-4 sm:px-6"
            >
              <div>
                <div className="font-medium text-foreground">{r.metric}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  {r.sub}
                </div>
              </div>
              <div className="text-right font-mono text-base font-semibold tabular-nums text-foreground">
                {r.you}
              </div>
              <div className="text-right font-mono text-base font-semibold tabular-nums text-muted-foreground">
                {r.bm}
              </div>
              <div className="flex items-center justify-end gap-1.5">
                {r.up ? (
                  <ChevronUp size={14} strokeWidth={2} className="text-primary" />
                ) : (
                  <ChevronDown size={14} strokeWidth={2} className="text-destructive" />
                )}
                <span
                  className={`inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${
                    r.up
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {r.diff}
                </span>
                <small className="font-mono text-[10px] text-muted-foreground">
                  {r.diffSub}
                </small>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <CalendarDays size={13} strokeWidth={1.75} />
        Viser data fra{" "}
        <strong className="text-foreground">siste 90 dager</strong> · 23 av dine
        runder · 42 spillere i benchmark{" "}
        <button className="ml-2 text-primary underline">
          Vis bare siste 30 dager
        </button>
      </div>
    </>
  );
}

function InsightBullet({
  up,
  label,
  val,
}: {
  up?: boolean;
  label: string;
  val: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`h-2 w-2 rounded-full ${
          up ? "bg-primary" : "bg-destructive"
        }`}
      />
      <span className="flex-1 text-foreground">{label}</span>
      <span
        className={`font-mono text-xs font-semibold tabular-nums ${
          up ? "text-primary" : "text-destructive"
        }`}
      >
        {val}
      </span>
    </div>
  );
}
