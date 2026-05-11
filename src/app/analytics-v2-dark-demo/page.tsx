/**
 * PILOT — CoachHQ Analytics V2
 * Bygd fra wireframe/design-files-v2/03-analytics-v2-dark.html
 * URL: /analytics-v2-dark-demo
 */
import { ChevronDown, Download, Search } from "lucide-react";

type AgentRow = {
  name: string;
  bar: number;
  barColor: string;
  recommended: number;
  approved: number;
  approvedPct: number;
  rejected: number;
  avgResponse: string;
  perfect?: boolean;
};

const AGENTS: AgentRow[] = [
  {
    name: "Periodisering",
    bar: 60,
    barColor: "var(--color-pyr-tek)",
    recommended: 47,
    approved: 38,
    approvedPct: 81,
    rejected: 9,
    avgResponse: "1 t 24 min",
  },
  {
    name: "Deload",
    bar: 30,
    barColor: "var(--color-pyr-fys)",
    recommended: 23,
    approved: 19,
    approvedPct: 83,
    rejected: 4,
    avgResponse: "2 t 08 min",
  },
  {
    name: "Escalation",
    bar: 8,
    barColor: "var(--color-pyr-slag)",
    recommended: 5,
    approved: 5,
    approvedPct: 100,
    rejected: 0,
    avgResponse: "14 min",
    perfect: true,
  },
  {
    name: "Plan-watcher",
    bar: 22,
    barColor: "var(--color-pyr-spill)",
    recommended: 18,
    approved: 14,
    approvedPct: 78,
    rejected: 4,
    avgResponse: "3 t 12 min",
  },
  {
    name: "Faktura",
    bar: 14,
    barColor: "var(--color-pyr-turn)",
    recommended: 12,
    approved: 11,
    approvedPct: 92,
    rejected: 1,
    avgResponse: "42 min",
  },
];

const VOLUME_WEEKS: { label: string; total: number; turn: number; fys: number; tek: number; coach: number }[] = [
  { label: "U7", total: 55, turn: 14, fys: 18, tek: 34, coach: 34 },
  { label: "U8", total: 58, turn: 12, fys: 22, tek: 36, coach: 30 },
  { label: "U9", total: 62, turn: 10, fys: 24, tek: 38, coach: 28 },
  { label: "U10", total: 66, turn: 14, fys: 22, tek: 34, coach: 30 },
  { label: "U11", total: 70, turn: 12, fys: 26, tek: 34, coach: 28 },
  { label: "U12", total: 74, turn: 14, fys: 24, tek: 36, coach: 26 },
  { label: "U13", total: 78, turn: 12, fys: 28, tek: 34, coach: 26 },
  { label: "U14", total: 80, turn: 14, fys: 24, tek: 36, coach: 26 },
  { label: "U15", total: 82, turn: 12, fys: 26, tek: 34, coach: 28 },
  { label: "U16", total: 84, turn: 14, fys: 26, tek: 34, coach: 26 },
  { label: "U17", total: 88, turn: 12, fys: 28, tek: 34, coach: 26 },
  { label: "U18", total: 92, turn: 14, fys: 26, tek: 36, coach: 24 },
  { label: "U19", total: 100, turn: 14, fys: 28, tek: 34, coach: 24 },
];

export default function AnalyticsV2DarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* Hero */}
        <header className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              CoachHQ · Stallens utvikling
            </div>
            <h1 className="mt-2 font-display text-[36px] leading-[1.1] tracking-tight">
              <em className="font-normal italic">Stallen samlet · siste 90 dager.</em>
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              38 spillere · 482 treningstimer · Sammenligning mot samme periode i fjor
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Search className="h-4 w-4" />
              Sammenlign
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Download className="h-4 w-4" />
              Eksporter
            </button>
          </div>
        </header>

        {/* Filter bar */}
        <div className="sticky top-0 z-10 mb-6 flex items-center gap-4 border-b border-border bg-background py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
              Periode
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground">
              Siste 90 dager
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
              Segment
            </span>
            <div className="flex gap-1.5">
              {[
                { label: "Alle (38)", active: true },
                { label: "Pro+ (12)" },
                { label: "Elite (6)" },
                { label: "Kategori A–K (18)" },
                { label: "WANG (8)" },
              ].map((c) => (
                <span
                  key={c.label}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium ${
                    c.active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {c.label}
                </span>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
              Sammenlign
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground">
              Samme periode i fjor
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </span>
          </div>
        </div>

        {/* KPI strip */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <Kpi label="Snitt-HCP" value="12,4" delta="−1,2" deltaTone="up" foot="vs samme periode i fjor" />
          <Kpi
            label="Total treningsvolum"
            value="482"
            unit=" t"
            delta="+18,2 %"
            deltaTone="up"
            foot="478 t i samme periode i fjor"
          />
          <Kpi
            label="Agent-godkjenning"
            value="84"
            unit=" %"
            delta="+4 pp"
            deltaTone="up"
            foot="av 75 anbefalinger"
          />
          <Kpi
            label="Pyramide-balanse"
            value="7,8"
            unit="/10"
            delta="+0,4"
            deltaTone="up"
            foot="over coaching-snitt"
          />
        </div>

        {/* Quadrants */}
        <div className="grid grid-cols-[1.4fr_1fr] grid-rows-2 gap-5">
          {/* Q1 HCP */}
          <QuadCard
            title="HCP-utvikling · 38 spillere"
            sub="Lavere er bedre · snitt fra 13,6 → 12,4"
            headerRight={
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-primary">
                ↓ −1,2 vs i fjor
              </span>
            }
          >
            <div className="relative h-60 flex-1">
              <svg className="h-full w-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                {/* grid */}
                <g stroke="hsl(var(--border))" strokeWidth="1">
                  <line x1="0" y1="0" x2="600" y2="0" />
                  <line x1="0" y1="60" x2="600" y2="60" />
                  <line x1="0" y1="120" x2="600" y2="120" />
                  <line x1="0" y1="180" x2="600" y2="180" />
                  <line x1="0" y1="240" x2="600" y2="240" />
                </g>
                {/* individual lines */}
                <g
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="1.25"
                  opacity="0.32"
                  strokeLinejoin="round"
                >
                  <polyline points="0,70 60,72 120,68 180,75 240,62 300,55 360,58 420,52 480,48 540,45 600,42" />
                  <polyline points="0,110 60,118 120,108 180,100 240,112 300,98 360,92 420,88 480,82 540,78 600,72" />
                  <polyline points="0,140 60,135 120,142 180,130 240,128 300,118 360,124 420,112 480,108 540,98 600,92" />
                  <polyline points="0,165 60,170 120,160 180,150 240,162 300,148 360,138 420,142 480,128 540,124 600,118" />
                  <polyline points="0,90 60,95 120,82 180,86 240,72 300,68 360,75 420,62 480,58 540,52 600,48" />
                  <polyline points="0,200 60,195 120,210 180,188 240,180 300,170 360,178 420,162 480,158 540,148 600,140" />
                  <polyline points="0,52 60,48 120,55 180,42 240,38 300,32 360,40 420,28 480,32 540,22 600,18" />
                  <polyline points="0,178 60,182 120,170 180,175 240,160 300,168 360,152 420,148 480,142 540,138 600,132" />
                </g>
                {/* compare overlay */}
                <polyline
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  points="0,98 60,102 120,96 180,100 240,94 300,98 360,92 420,96 480,90 540,94 600,88"
                />
                {/* avg lime */}
                <polyline
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,128 60,130 120,124 180,120 240,114 300,108 360,104 420,98 480,92 540,86 600,82"
                />
                <circle
                  cx="600"
                  cy="82"
                  r="5"
                  fill="hsl(var(--accent))"
                  stroke="hsl(var(--card))"
                  strokeWidth="2"
                />
                <g fontFamily="var(--font-mono)" fontSize="10" fill="hsl(var(--muted-foreground))">
                  <text x="6" y="14">
                    15
                  </text>
                  <text x="6" y="74">
                    13
                  </text>
                  <text x="6" y="134">
                    12
                  </text>
                  <text x="6" y="194">
                    11
                  </text>
                </g>
              </svg>
            </div>
            <Legend
              items={[
                { color: "hsl(var(--accent))", label: "Snitt stall", thick: true },
                { color: "hsl(var(--muted-foreground))", label: "Individuelle spillere" },
                {
                  color: "hsl(var(--muted-foreground))",
                  label: "Samme periode i fjor (snitt)",
                  dashed: true,
                },
              ]}
            />
          </QuadCard>

          {/* Q2 Volume */}
          <QuadCard
            title="Treningsvolum · per uke"
            sub="Coaching · Selvtrening · Gruppe · Runder"
            headerRight={
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-primary">
                +18,2 %
              </span>
            }
          >
            <div className="grid flex-1 grid-cols-13 items-end gap-1.5 px-1">
              {VOLUME_WEEKS.map((w) => (
                <div
                  key={w.label}
                  className="flex h-full flex-col items-center justify-end gap-1"
                >
                  <div
                    className="flex w-full flex-col-reverse overflow-hidden rounded-sm"
                    style={{ height: `${w.total}%`, minHeight: "30%" }}
                  >
                    <span
                      className="block w-full"
                      style={{
                        height: `${w.turn}%`,
                        background: "var(--color-pyr-turn)",
                      }}
                    />
                    <span
                      className="block w-full"
                      style={{
                        height: `${w.fys}%`,
                        background: "var(--color-pyr-fys)",
                      }}
                    />
                    <span
                      className="block w-full"
                      style={{
                        height: `${w.tek}%`,
                        background: "var(--color-pyr-tek)",
                      }}
                    />
                    <span
                      className="block w-full"
                      style={{ height: `${w.coach}%`, background: "hsl(var(--accent))" }}
                    />
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {w.label}
                  </div>
                </div>
              ))}
            </div>
            <Legend
              items={[
                { color: "hsl(var(--accent))", label: "Coaching", square: true },
                { color: "var(--color-pyr-tek)", label: "Selvtrening", square: true },
                { color: "var(--color-pyr-fys)", label: "Gruppe", square: true },
                { color: "var(--color-pyr-turn)", label: "Runder", square: true },
              ]}
            />
          </QuadCard>

          {/* Q3 Pyramid balance */}
          <QuadCard
            title="Pyramide-balanse · andel over tid"
            sub="FYS / TEK / SLAG / SPILL / TURN"
            headerRight={
              <div className="inline-flex rounded-full border border-border bg-background p-0.5 text-[11px]">
                <button className="rounded-full bg-card px-3 py-1 font-medium text-foreground shadow-sm">
                  Andel %
                </button>
                <button className="rounded-full px-3 py-1 font-medium text-muted-foreground">
                  Volum t
                </button>
              </div>
            }
          >
            <div className="relative h-60 flex-1">
              <svg className="h-full w-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                <polygon
                  fill="var(--color-pyr-fys)"
                  opacity="0.85"
                  points="0,240 0,200 100,196 200,190 300,188 400,184 500,180 600,178 600,240"
                />
                <polygon
                  fill="var(--color-pyr-tek)"
                  opacity="0.9"
                  points="0,200 100,196 200,190 300,188 400,184 500,180 600,178 600,120 500,115 400,118 300,114 200,112 100,118 0,124"
                />
                <polygon
                  fill="var(--color-pyr-slag)"
                  opacity="0.95"
                  points="0,124 100,118 200,112 300,114 400,118 500,115 600,120 600,72 500,68 400,72 300,66 200,62 100,68 0,74"
                />
                <polygon
                  fill="var(--color-pyr-spill)"
                  opacity="0.9"
                  points="0,74 100,68 200,62 300,66 400,72 500,68 600,72 600,36 500,30 400,34 300,28 200,32 100,30 0,38"
                />
                <polygon
                  fill="var(--color-pyr-turn)"
                  opacity="0.85"
                  points="0,38 100,30 200,32 300,28 400,34 500,30 600,36 600,0 0,0"
                />
                <g fontFamily="var(--font-mono)" fontSize="9" fill="rgba(255,255,255,0.85)">
                  <text x="540" y="218">
                    FYS 28 %
                  </text>
                  <text x="540" y="160">
                    TEK 32 %
                  </text>
                  <text x="540" y="100">
                    SLAG 22 %
                  </text>
                  <text x="540" y="56">
                    SPILL 12 %
                  </text>
                  <text x="540" y="22">
                    TURN 6 %
                  </text>
                </g>
              </svg>
            </div>
            <div className="mt-3 font-mono text-[11.5px] text-foreground">
              Bygger TEK-volum mot Sørlandsåpent (uke 22). SPILL ned 4 pp.
            </div>
          </QuadCard>

          {/* Q4 Agent table */}
          <QuadCard
            title="Agent-effektivitet"
            sub="Godkjennings-rate og snitt-responstid"
            headerRight={
              <button className="text-[13px] font-medium text-primary hover:underline">
                Drill-down →
              </button>
            }
          >
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="border-b border-border px-2.5 py-2 text-left font-mono text-[10.5px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                    Agent
                  </th>
                  <th className="border-b border-border px-2.5 py-2 text-right font-mono text-[10.5px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                    Anbefalt
                  </th>
                  <th className="border-b border-border px-2.5 py-2 text-right font-mono text-[10.5px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                    Godkjent
                  </th>
                  <th className="border-b border-border px-2.5 py-2 text-right font-mono text-[10.5px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                    Avslått
                  </th>
                  <th className="border-b border-border px-2.5 py-2 text-right font-mono text-[10.5px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
                    Snitt-respons
                  </th>
                </tr>
              </thead>
              <tbody>
                {AGENTS.map((a) => (
                  <tr key={a.name}>
                    <td className="border-b border-border px-2.5 py-3">
                      <span
                        className="mr-2 inline-block h-1.5 rounded-sm align-middle"
                        style={{ width: `${a.bar}px`, background: a.barColor }}
                      />
                      {a.name}
                    </td>
                    <td className="border-b border-border px-2.5 py-3 text-right font-mono tabular-nums">
                      {a.recommended}
                    </td>
                    <td className="border-b border-border px-2.5 py-3 text-right font-mono tabular-nums text-primary">
                      {a.approved}{" "}
                      <span className="text-muted-foreground">({a.approvedPct} %)</span>
                    </td>
                    <td className="border-b border-border px-2.5 py-3 text-right font-mono tabular-nums">
                      {a.rejected}
                    </td>
                    <td className="border-b border-border px-2.5 py-3 text-right font-mono tabular-nums">
                      {a.avgResponse}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </QuadCard>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  delta,
  deltaTone,
  foot,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: "up" | "down";
  foot: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-mono text-[32px] font-medium leading-none tracking-tight tabular-nums">
        {value}
        {unit && (
          <span className="text-[14px] font-normal text-muted-foreground">{unit}</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px]">
        {delta && (
          <span
            className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
              deltaTone === "up"
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {delta}
          </span>
        )}
        <span className="text-muted-foreground">{foot}</span>
      </div>
    </div>
  );
}

function QuadCard({
  title,
  sub,
  headerRight,
  children,
}: {
  title: string;
  sub: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[340px] flex-col rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <div className="font-display text-[16px] font-semibold tracking-tight text-foreground">
            {title}
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">{sub}</div>
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function Legend({
  items,
}: {
  items: { color: string; label: string; thick?: boolean; dashed?: boolean; square?: boolean }[];
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-3.5 text-[11.5px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          {it.square ? (
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: it.color }}
            />
          ) : (
            <span
              className="inline-block h-0.5 w-3.5 rounded-[1px]"
              style={{
                background: it.dashed
                  ? `linear-gradient(90deg, ${it.color} 50%, transparent 50%)`
                  : it.color,
                backgroundSize: it.dashed ? "6px 2px" : undefined,
                height: it.thick ? "3px" : undefined,
              }}
            />
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}
