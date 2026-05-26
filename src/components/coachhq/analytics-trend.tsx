/**
 * AnalyticsTrend — 3 SVG-baserte tidsserie-grafer over 12 uker:
 *   1) Antall økter per uke (bar)
 *   2) Snitt SG-trend (line)
 *   3) Pyramide-fordeling per uke (stacked area)
 *
 * Server component. Bruker tokens fra globals.css (currentColor + Tailwind
 * text-/fill-utilities mapper til semantiske farger).
 */

import type { PyramidKey } from "./analytics-heatmap";

export type TrendWeek = {
  weekLabel: string; // f.eks "U18"
  startDate: string; // ISO yyyy-mm-dd for tooltip
  okter: number;
  sgAvg: number | null;
  fordeling: Record<PyramidKey, number>;
};

const AREA_KEYS: PyramidKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

// Subtilt fra primary → accent for 5 områder via Tailwind opacity-klasser.
const AREA_FILL: Record<PyramidKey, string> = {
  FYS: "fill-primary",
  TEK: "fill-primary/75",
  SLAG: "fill-primary/55",
  SPILL: "fill-primary/35",
  TURN: "fill-accent",
};

const AREA_LABEL: Record<PyramidKey, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

const W = 720;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 36, left: 40 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function xAt(i: number, n: number) {
  if (n <= 1) return PAD.left + PLOT_W / 2;
  return PAD.left + (i / (n - 1)) * PLOT_W;
}

function ChartFrame({
  title,
  italic,
  sub,
  children,
}: {
  title: string;
  italic: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            {title}{" "}
            <em className="font-normal italic text-primary">{italic}</em>
          </h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{sub}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          12 uker
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </section>
  );
}

function AxisX({ weeks }: { weeks: TrendWeek[] }) {
  return (
    <g>
      {weeks.map((w, i) => (
        <text
          key={`${w.weekLabel}-${i}`}
          x={xAt(i, weeks.length)}
          y={H - PAD.bottom + 16}
          textAnchor="middle"
          className="fill-muted-foreground font-mono"
          style={{ fontSize: 9 }}
        >
          {w.weekLabel}
        </text>
      ))}
    </g>
  );
}

function GridY({ ticks, fmt }: { ticks: number[]; fmt: (n: number) => string }) {
  const max = Math.max(...ticks, 1);
  return (
    <g>
      {ticks.map((t) => {
        const y = PAD.top + PLOT_H - (t / max) * PLOT_H;
        return (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              className="stroke-border"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <text
              x={PAD.left - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono"
              style={{ fontSize: 9 }}
            >
              {fmt(t)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function BarChart({ weeks }: { weeks: TrendWeek[] }) {
  const max = Math.max(...weeks.map((w) => w.okter), 1);
  // 4 ticks
  const ticks = [0, Math.ceil(max / 3), Math.ceil((2 * max) / 3), max];
  const barW = Math.max(8, PLOT_W / weeks.length - 8);

  return (
    <svg
      role="img"
      aria-label="Antall økter per uke"
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full min-w-[640px]"
    >
      <GridY ticks={ticks} fmt={(n) => String(n)} />
      {weeks.map((w, i) => {
        const x = xAt(i, weeks.length) - barW / 2;
        const h = (w.okter / max) * PLOT_H;
        const y = PAD.top + PLOT_H - h;
        return (
          <g key={`bar-${i}`}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={2}
              className="fill-primary"
            >
              <title>
                {w.weekLabel} ({w.startDate}): {w.okter} økter
              </title>
            </rect>
          </g>
        );
      })}
      <AxisX weeks={weeks} />
    </svg>
  );
}

function LineChart({ weeks }: { weeks: TrendWeek[] }) {
  const values = weeks.map((w) => w.sgAvg ?? 0);
  const minRaw = Math.min(...values, 0);
  const maxRaw = Math.max(...values, 0);
  const range = maxRaw - minRaw || 1;
  const pad = range * 0.2;
  const min = minRaw - pad;
  const max = maxRaw + pad;

  const yAt = (v: number) => PAD.top + PLOT_H - ((v - min) / (max - min)) * PLOT_H;

  const ticks = [min, (min + max) / 2, max];
  const fmt = (n: number) => n.toFixed(1);

  const points = weeks
    .map((w, i) => `${xAt(i, weeks.length)},${yAt(w.sgAvg ?? 0)}`)
    .join(" ");

  // Zero-line
  const zeroY = yAt(0);

  return (
    <svg
      role="img"
      aria-label="Snitt SG-trend per uke"
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full min-w-[640px]"
    >
      <g>
        {ticks.map((t, i) => {
          const y = yAt(t);
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              <text
                x={PAD.left - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground font-mono"
                style={{ fontSize: 9 }}
              >
                {fmt(t)}
              </text>
            </g>
          );
        })}
      </g>
      {min < 0 && max > 0 && (
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={zeroY}
          y2={zeroY}
          className="stroke-muted-foreground"
          strokeWidth={1}
        />
      )}
      <polyline
        points={points}
        fill="none"
        className="stroke-primary"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {weeks.map((w, i) => (
        <g key={`pt-${i}`}>
          <circle
            cx={xAt(i, weeks.length)}
            cy={yAt(w.sgAvg ?? 0)}
            r={3}
            className="fill-primary"
          >
            <title>
              {w.weekLabel} ({w.startDate}): SG {(w.sgAvg ?? 0).toFixed(2)}
            </title>
          </circle>
        </g>
      ))}
      <AxisX weeks={weeks} />
    </svg>
  );
}

function StackedArea({ weeks }: { weeks: TrendWeek[] }) {
  // Stacked område per pyramide-kategori
  const totals = weeks.map((w) =>
    AREA_KEYS.reduce((s, k) => s + w.fordeling[k], 0),
  );
  const max = Math.max(...totals, 1);
  const ticks = [0, Math.ceil(max / 2), max];

  // Beregn stablede topp-verdier
  const stacks: Record<PyramidKey, number[]> = {
    FYS: [],
    TEK: [],
    SLAG: [],
    SPILL: [],
    TURN: [],
  };
  weeks.forEach((w, i) => {
    let acc = 0;
    for (const k of AREA_KEYS) {
      acc += w.fordeling[k];
      stacks[k][i] = acc;
    }
  });

  const yAt = (v: number) => PAD.top + PLOT_H - (v / max) * PLOT_H;

  // Bygg path for hvert område — bottom-til-top
  function buildPath(k: PyramidKey, idx: number): string {
    const upper = stacks[k].map((v, i) => `${xAt(i, weeks.length)},${yAt(v)}`);
    const lowerKey = idx === 0 ? null : AREA_KEYS[idx - 1];
    const lower = lowerKey
      ? stacks[lowerKey]
          .map((v, i) => `${xAt(i, weeks.length)},${yAt(v)}`)
          .reverse()
      : weeks
          .map((_, i) => `${xAt(i, weeks.length)},${yAt(0)}`)
          .reverse();
    return `M ${upper.join(" L ")} L ${lower.join(" L ")} Z`;
  }

  return (
    <svg
      role="img"
      aria-label="Pyramide-fordeling per uke"
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full min-w-[640px]"
    >
      <GridY ticks={ticks} fmt={(n) => String(n)} />
      {AREA_KEYS.map((k, idx) => (
        <path key={k} d={buildPath(k, idx)} className={AREA_FILL[k]}>
          <title>{AREA_LABEL[k]}</title>
        </path>
      ))}
      <AxisX weeks={weeks} />
    </svg>
  );
}

function Legend() {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {AREA_KEYS.map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span
            className={`inline-block h-3 w-3 rounded-sm ${AREA_FILL[k].replace(
              "fill-",
              "bg-",
            )}`}
          />
          {AREA_LABEL[k]}
        </span>
      ))}
    </div>
  );
}

export function AnalyticsTrend({ weeks }: { weeks: TrendWeek[] }) {
  if (weeks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Ingen trend-data tilgjengelig for siste 12 uker.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartFrame
        title="Økter"
        italic="per uke"
        sub="Antall fullførte sesjoner — alle spillere"
      >
        <BarChart weeks={weeks} />
      </ChartFrame>

      <ChartFrame
        title="Snitt"
        italic="SG-trend"
        sub="Strokes Gained-snitt over loggførte runder per uke"
      >
        <LineChart weeks={weeks} />
      </ChartFrame>

      <ChartFrame
        title="Pyramide-"
        italic="fordeling"
        sub="Volum per pyramide-område (stablet)"
      >
        <StackedArea weeks={weeks} />
        <Legend />
      </ChartFrame>
    </div>
  );
}
