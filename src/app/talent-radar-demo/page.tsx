/**
 * DEMO — CoachHQ Talent · Talent-radar (cohort scatter)
 * Spec: _extracted/talent-design/uploads/02-talent-radar.md
 * URL: /talent-radar-demo
 *
 * Default state: lyst tema, ingen sidebar/shell. Server component.
 */

import {
  Search,
  Download,
  Sparkles,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";

type Dot = {
  id: string;
  x: number; // 0–100 (alder akse / talent-score)
  y: number; // 0–100 (improvement / percentile)
  band: "p25" | "median" | "p90" | "top";
  named?: { initials: string; name: string };
};

// Deterministisk generert pool — 8 navngitte + ~70 anonyme
const NAMED: Dot[] = [
  { id: "markus", x: 78, y: 88, band: "top", named: { initials: "MP", name: "Markus R.P." } },
  { id: "anders", x: 70, y: 74, band: "p90", named: { initials: "AN", name: "Anders N." } },
  { id: "lina", x: 64, y: 71, band: "p90", named: { initials: "LH", name: "Lina H." } },
  { id: "mia", x: 55, y: 78, band: "p90", named: { initials: "MB", name: "Mia B." } },
  { id: "joachim", x: 48, y: 48, band: "median", named: { initials: "JV", name: "Joachim V." } },
  { id: "henrik", x: 52, y: 52, band: "median", named: { initials: "HN", name: "Henrik N." } },
  { id: "emma", x: 50, y: 55, band: "median", named: { initials: "ES", name: "Emma S." } },
  { id: "nora", x: 60, y: 80, band: "p90", named: { initials: "NV", name: "Nora V." } },
];

const POOL: Dot[] = Array.from({ length: 88 }, (_, i) => {
  // Bruk en deterministisk hash for stabile koordinater
  const seed = (i * 9301 + 49297) % 233280;
  const x = (seed % 100);
  const y = ((seed * 7) % 100);
  const r = (seed * 11) % 100;
  let band: Dot["band"] = "p25";
  if (r > 90) band = "top";
  else if (r > 72) band = "p90";
  else if (r > 40) band = "median";
  return { id: `p${i}`, x, y, band };
});

const DOTS: Dot[] = [...POOL, ...NAMED];

const SIGNAL_FILTERS = [
  { label: "Alle", active: true },
  { label: "Climbers" },
  { label: "Breakouts" },
  { label: "Over CI95" },
  { label: "Early" },
  { label: "Akselererende" },
];

const COLOR_BY = [
  { label: "Talent-score", active: true },
  { label: "Region" },
  { label: "Klasse" },
  { label: "Improvement" },
];

const RECENT_EVENTS = [
  { date: "12. mai", event: "Nordic Tour Q1 · runde 1", finish: "T7" },
  { date: "04. mai", event: "GFGK Junior Open", finish: "1" },
  { date: "28. apr", event: "WANG indoor test-uke", finish: "PR" },
];

const PRO_MATCHES = [
  { initials: "KV", name: "Kris Ventura", match: "82 %" },
  { initials: "VH", name: "Viktor Hovland", match: "71 %" },
];

export default function TalentRadarDemo() {
  const selected = NAMED[0]; // Markus

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* PageHeader */}
        <header className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Discovery · Talent-radar
            </span>
            <h1 className="mt-1.5 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
              <em className="font-medium italic">Hvem</em> skal vi følge?
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
              <Search className="h-4 w-4" strokeWidth={1.5} />
              <span>Søk i 118 spillere</span>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Download className="h-4 w-4" strokeWidth={1.5} />
              Eksporter shortlist
            </button>
          </div>
        </header>

        {/* ActionStrip */}
        <div
          className="mb-6 flex items-center gap-4 rounded-lg px-6 py-4 text-[13px] text-[#F5F4EE]"
          style={{
            background:
              "linear-gradient(135deg, hsl(159 100% 12%) 0%, hsl(159 100% 17%) 100%)",
          }}
        >
          <Sparkles className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
          <p className="leading-snug">
            <b className="font-semibold">12 nye signaler siste 7 dager</b>{" "}
            <span className="opacity-80">
              · 4 climbers, 3 breakouts, 5 over CI95
            </span>
          </p>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-accent-foreground">
            Vis alle nye
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* FilterRow 1: signaler */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Signaler
          </span>
          {SIGNAL_FILTERS.map((f) => (
            <button
              key={f.label}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                f.active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* FilterRow 2: color-by */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Fargelegg
          </span>
          {COLOR_BY.map((f) => (
            <button
              key={f.label}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                f.active
                  ? "bg-foreground text-background"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Two-pane */}
        <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-6">
          {/* Scatter */}
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Kohort-scatter · 118 spillere · 14–18 år
                </div>
                <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                  Talent-score vs. improvement
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone="info">p25–p75-bånd</Pill>
                <Pill tone="muted">Klikkbar</Pill>
              </div>
            </div>

            <CohortScatter dots={DOTS} selectedId={selected.id} />

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
              <LegendDot color="hsl(159 100% 17%)" label="Topp 10 %" />
              <LegendDot color="hsl(72 60% 50%)" label="Climber" />
              <LegendDot color="hsl(60 8% 70%)" label="Median-bånd" />
            </div>

            {/* Footer-totals */}
            <div className="mt-4 grid grid-cols-5 border-t border-border pt-4">
              <FooterStat label="Totalt" value="118" />
              <FooterStat label="Topp 10 %" value="12" />
              <FooterStat label="Over CI95" value="5" />
              <FooterStat label="Median alder" value="16,4" />
              <FooterStat label="Top-talent" value="Markus" />
            </div>
          </section>

          {/* Drawer */}
          <aside className="self-start rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground">
                  <span className="font-display text-[18px] font-semibold leading-none">
                    {selected.named?.initials}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Valgt spiller · A1
                  </span>
                  <div className="mt-1 font-display text-[20px] font-semibold leading-tight">
                    {selected.named?.name}
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">
                    WANG Toppidrett · 16 år · HCP +2,4
                  </div>
                </div>
              </div>
              <button
                aria-label="Pin"
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary"
              >
                <Star className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* 4 mini-stats 2x2 */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Talent" value="94" delta="+6" />
              <MiniStat label="Percentil" value="94" delta="+3" />
              <MiniStat label="Form" value="+8 %" delta="↑" />
              <MiniStat label="Avg runde" value="70,1" delta="−0,8" />
            </div>

            {/* Pro-matches */}
            <div className="mt-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Du ligner mest på
              </div>
              <div className="mt-2 space-y-2">
                {PRO_MATCHES.map((p, i) => (
                  <div
                    key={p.initials}
                    className={`flex items-center justify-between rounded-md px-3 py-2 ${
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold ${
                          i === 0
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-background text-foreground"
                        }`}
                      >
                        {p.initials}
                      </div>
                      <span className="text-[13px] font-medium">{p.name}</span>
                    </div>
                    <span className="font-mono text-[12px] font-semibold tabular-nums">
                      {p.match}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini SG-radar */}
            <div className="mt-5 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                SG-profil
              </div>
              <div className="mt-2 grid place-items-center">
                <MiniRadar />
              </div>
            </div>

            {/* Recent events */}
            <div className="mt-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Siste events
              </div>
              <ul className="mt-2 space-y-1.5">
                {RECENT_EVENTS.map((e) => (
                  <li
                    key={e.date}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-[12px]"
                  >
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {e.date}
                    </span>
                    <span className="mx-3 flex-1 truncate">{e.event}</span>
                    <span className="rounded-full bg-[#E5F1EA] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1A7D56]">
                      {e.finish}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground">
              Åpne 360-profil
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CohortScatter({
  dots,
  selectedId,
}: {
  dots: Dot[];
  selectedId: string;
}) {
  const w = 720;
  const h = 460;
  const pad = 36;
  const xScale = (x: number) => pad + (x / 100) * (w - pad * 2);
  const yScale = (y: number) => h - pad - (y / 100) * (h - pad * 2);

  const colorFor = (band: Dot["band"]) => {
    if (band === "top") return "hsl(159 100% 17%)";
    if (band === "p90") return "hsl(72 60% 45%)";
    if (band === "median") return "hsl(60 8% 55%)";
    return "hsl(60 8% 78%)";
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img">
      {/* p25–p75 band */}
      <rect
        x={xScale(35)}
        y={yScale(70)}
        width={xScale(75) - xScale(35)}
        height={yScale(35) - yScale(70)}
        fill="hsl(159 100% 17% / 0.06)"
        stroke="hsl(159 100% 17% / 0.20)"
        strokeDasharray="4 4"
      />
      <text
        x={xScale(35) + 8}
        y={yScale(70) + 14}
        fontSize="9"
        fontFamily="ui-monospace, monospace"
        fill="hsl(159 100% 17% / 0.6)"
      >
        p25–p75
      </text>

      {/* axes */}
      <line
        x1={pad}
        y1={h - pad}
        x2={w - pad}
        y2={h - pad}
        stroke="hsl(60 8% 90%)"
        strokeWidth={1}
      />
      <line
        x1={pad}
        y1={pad}
        x2={pad}
        y2={h - pad}
        stroke="hsl(60 8% 90%)"
        strokeWidth={1}
      />
      <text
        x={w / 2}
        y={h - 6}
        textAnchor="middle"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        fill="hsl(60 4% 37%)"
      >
        Talent-score →
      </text>
      <text
        x={-h / 2}
        y={12}
        transform={`rotate(-90)`}
        textAnchor="middle"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        fill="hsl(60 4% 37%)"
      >
        Improvement →
      </text>

      {/* dots */}
      {dots.map((d) => {
        const cx = xScale(d.x);
        const cy = yScale(d.y);
        const isSelected = d.id === selectedId;
        const r = d.named ? 6 : 4;
        return (
          <g key={d.id}>
            {isSelected && (
              <circle
                cx={cx}
                cy={cy}
                r={r + 6}
                fill="none"
                stroke="hsl(72 92% 62%)"
                strokeWidth={2.5}
              />
            )}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={colorFor(d.band)}
              stroke={d.named ? "white" : "none"}
              strokeWidth={d.named ? 1.5 : 0}
              opacity={d.named ? 1 : 0.65}
            />
            {d.named && (
              <text
                x={cx}
                y={cy - r - 4}
                textAnchor="middle"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
                fill="hsl(157 53% 8%)"
              >
                {d.named.initials}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function FooterStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-[16px] font-semibold tabular-nums leading-none">
        {value}
      </div>
    </div>
  );
}

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "info" | "muted" | "success";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    info: "bg-primary/10 text-primary",
    success: "bg-[#E5F1EA] text-[#1A7D56]",
    muted: "bg-secondary text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function MiniStat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[18px] font-semibold tabular-nums leading-none">
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-1 font-mono text-[10px] font-medium text-[#1A7D56]">
        <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
        {delta}
      </div>
    </div>
  );
}

function MiniRadar() {
  const cx = 90;
  const cy = 80;
  const r = 56;
  const axes = ["OTT", "APP", "ARG", "PUT", "OG"];
  const player = [0.92, 0.88, 0.74, 0.82, 0.79];
  const cohort = [0.55, 0.55, 0.55, 0.55, 0.55];

  const pointFor = (val: number, i: number) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [cx + Math.cos(angle) * r * val, cy + Math.sin(angle) * r * val];
  };
  const polyOf = (vals: number[]) =>
    vals.map((v, i) => pointFor(v, i).join(",")).join(" ");

  return (
    <svg width="180" height="160" viewBox="0 0 180 160">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon
          key={g}
          points={polyOf(axes.map(() => g))}
          fill="none"
          stroke="hsl(60 8% 90%)"
          strokeWidth={0.75}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pointFor(1, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="hsl(60 8% 90%)"
            strokeWidth={0.75}
          />
        );
      })}
      <polygon
        points={polyOf(cohort)}
        fill="hsl(60 4% 37% / 0.15)"
        stroke="hsl(60 4% 37%)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <polygon
        points={polyOf(player)}
        fill="hsl(159 100% 17% / 0.20)"
        stroke="hsl(159 100% 17%)"
        strokeWidth={1.5}
      />
      {axes.map((a, i) => {
        const [x, y] = pointFor(1.18, i);
        return (
          <text
            key={a}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fill="hsl(60 4% 37%)"
          >
            {a}
          </text>
        );
      })}
    </svg>
  );
}
