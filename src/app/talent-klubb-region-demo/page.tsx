/**
 * DEMO — CoachHQ Talent · Klubb & region
 * Spec: _extracted/talent-design/uploads/07-klubb-region.md
 * URL: /talent-klubb-region-demo
 *
 * Default state: lyst tema, ingen sidebar/shell. Server component.
 */

import {
  ChevronLeft,
  TrendingUp,
  MapPin,
  Info,
  ArrowRight,
  Building2,
} from "lucide-react";

type Region = {
  id: string;
  name: string;
  count: number;
  intensity: number; // 0–1
  cx: number;
  cy: number;
};

const REGIONS: Region[] = [
  { id: "ost", name: "Region Øst", count: 38, intensity: 0.95, cx: 180, cy: 280 },
  { id: "sor", name: "Region Sør", count: 14, intensity: 0.55, cx: 140, cy: 340 },
  { id: "vest", name: "Vestland", count: 22, intensity: 0.82, cx: 80, cy: 240 },
  { id: "midt", name: "Midt-Norge", count: 12, intensity: 0.45, cx: 160, cy: 160 },
  { id: "nord", name: "Nord-Norge", count: 6, intensity: 0.30, cx: 220, cy: 60 },
  { id: "inn", name: "Innlandet", count: 18, intensity: 0.68, cx: 200, cy: 220 },
  { id: "agder", name: "Agder", count: 8, intensity: 0.35, cx: 110, cy: 380 },
];

const TOP_CLUBS = [
  { name: "Bærum GK", count: 28 },
  { name: "Oslo GK", count: 22 },
  { name: "GFGK", count: 18 },
  { name: "Drammen GK", count: 14 },
  { name: "Holmestrand GK", count: 12 },
];

// Multi-line graf: 3 regioner over 9 år (2018-2026)
const YEARS = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];
const SERIES = {
  ost: [22, 24, 26, 28, 30, 33, 35, 36, 38],
  vestland: [10, 11, 12, 14, 15, 17, 19, 21, 22],
  midt: [8, 9, 9, 10, 10, 11, 12, 12, 12],
};

// Retention-heatmap: 5 cohorts × 8 år
const COHORTS = [
  { year: "2002", retention: [0.95, 0.88, 0.78, 0.65, 0.55, 0.42, 0.35, 0.28] },
  { year: "2004", retention: [0.92, 0.84, 0.76, 0.68, 0.58, 0.48, 0.38, 0.30] },
  { year: "2006", retention: [0.96, 0.88, 0.80, 0.72, 0.62, 0.50, 0.40, 0.32] },
  { year: "2008", retention: [0.98, 0.92, 0.85, 0.78, 0.70, 0.60, 0.50, 0.40] },
  { year: "2010", retention: [0.96, 0.90, 0.84, 0.76, 0.68, 0, 0, 0] },
];

const RET_YEARS = ["1år", "2år", "3år", "4år", "5år", "6år", "7år", "8år"];

export default function TalentKlubbRegionDemo() {
  const selected = REGIONS[0]; // Region Øst

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* PageHeader */}
        <header className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Pipeline-helse · Talent
            </span>
            <h1 className="mt-1.5 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
              <em className="font-medium italic">Klubb</em> &amp; region
            </h1>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            Tilbake
          </button>
        </header>

        {/* ActionStrip */}
        <div
          className="mb-4 flex items-center gap-4 rounded-lg px-6 py-4 text-[13px] text-[#F5F4EE]"
          style={{
            background:
              "linear-gradient(135deg, hsl(159 100% 12%) 0%, hsl(159 100% 17%) 100%)",
          }}
        >
          <TrendingUp className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
          <p className="leading-snug">
            <b className="font-semibold">Region Øst</b>{" "}
            <span className="opacity-80">
              leverer 38 % av topp-100 talenter siste 5 år.
            </span>{" "}
            <b className="font-semibold">Vestland +24 %</b>{" "}
            <span className="opacity-80">vekst.</span>
          </p>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-accent-foreground">
            Se region-trend
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Datapåfyll-banner */}
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#B8852A]/40 bg-[#FFF6E6] px-4 py-3 text-[12px] text-[#7A5500]">
          <Info className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>
            <b className="font-semibold">Datapåfyll Q4 2026:</b> Klubb-tagging på
            spiller-nivå er svak — 32 % mangler primær klubb. Booking-team
            jobber med berikning fra GolfBox.
          </span>
        </div>

        {/* KPI-strip */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <Kpi label="Aktive talenter" value="118" delta="+12 i år" />
          <Kpi label="Ny-rekruttering 12 mnd" value="34" delta="+6 vs i fjor" />
          <Kpi label="Retention 5-år" value="68 %" delta="+4 pp" />
          <Kpi
            label="Topp-100 i pool"
            value="42"
            delta="+8"
            dark
          />
        </div>

        {/* Two-col: kart + region-detalj */}
        <div className="mb-6 grid grid-cols-[1fr_440px] gap-4">
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Norge · talent-tetthet
                </div>
                <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                  Hvor i landet ligger talentet?
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                <MapPin className="h-3 w-3" strokeWidth={1.5} />
                7 regioner
              </span>
            </div>
            <NorgesMap regions={REGIONS} selectedId={selected.id} />
            <div className="mt-4 flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
              <LegendDot color="hsl(159 100% 17% / 0.95)" label="Høy tetthet" />
              <LegendDot color="hsl(159 100% 17% / 0.55)" label="Middels" />
              <LegendDot color="hsl(159 100% 17% / 0.25)" label="Lav" />
            </div>
          </section>

          {/* Region-detalj */}
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-[24px] italic leading-tight">
                <em className="font-medium italic">{selected.name}</em>
              </h3>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Største pool
              </span>
            </div>
            <div className="mt-1 text-[12px] text-muted-foreground">
              38 av 118 talenter · 13 klubber · 23 % U-16
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Aktive talenter" value="38" delta="+5 i år" />
              <MiniStat label="U-16-andel" value="23 %" delta="stabilt" muted />
              <MiniStat label="Avg HCP" value="6,2" delta="−0,4" />
              <MiniStat label="NCAA-kandidater" value="9" delta="+2" />
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <Building2 className="h-3 w-3" strokeWidth={1.5} />
                Top 5 klubber
              </div>
              <ul className="space-y-2.5">
                {TOP_CLUBS.map((c) => {
                  const pct = (c.count / TOP_CLUBS[0].count) * 100;
                  return (
                    <li key={c.name}>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-medium">{c.name}</span>
                        <span className="font-mono tabular-nums text-muted-foreground">
                          {c.count}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </div>

        {/* Multi-line region-volum */}
        <section className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Region-volum 2018 – 2026
              </div>
              <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                Hvilke regioner vokser?
              </h3>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
              <LegendLine color="hsl(159 100% 17%)" label="Region Øst" />
              <LegendLine color="hsl(72 60% 45%)" label="Vestland" />
              <LegendLine color="hsl(40 80% 50%)" label="Midt-Norge" dashed />
            </div>
          </div>
          <MultiLineChart years={YEARS} series={SERIES} />
        </section>

        {/* Retention-heatmap */}
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Retention-cohort · fødselsår
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Hvor mange holder seg aktive over tid?
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Mørke felter = høy aktivitet. Cohort 2008 viser sterk retention
              (5-år rate: 78 %).
            </p>
          </div>

          <div className="grid grid-cols-[80px_repeat(8,1fr)] gap-1.5">
            <div />
            {RET_YEARS.map((y) => (
              <div
                key={y}
                className="text-center font-mono text-[10px] font-semibold text-muted-foreground"
              >
                {y}
              </div>
            ))}

            {COHORTS.map((c) => (
              <RetentionRow key={c.year} cohort={c} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function NorgesMap({
  regions,
  selectedId,
}: {
  regions: Region[];
  selectedId: string;
}) {
  return (
    <svg
      viewBox="0 0 300 440"
      className="mx-auto block h-[440px] w-auto"
      role="img"
    >
      {/* Bakgrunns-omriss av Norge — forenklet */}
      <path
        d="M 200 20 L 240 60 L 260 120 L 250 180 L 230 240 L 220 300 L 200 360 L 170 400 L 130 420 L 100 410 L 80 380 L 70 340 L 90 280 L 100 220 L 60 200 L 55 160 L 80 130 L 110 90 L 150 50 Z"
        fill="hsl(45 18% 96%)"
        stroke="hsl(60 8% 80%)"
        strokeWidth={1}
      />
      {regions.map((r) => {
        const isSelected = r.id === selectedId;
        return (
          <g key={r.id}>
            <circle
              cx={r.cx}
              cy={r.cy}
              r={20 + r.intensity * 18}
              fill={`hsl(159 100% 17% / ${r.intensity})`}
              stroke={isSelected ? "hsl(72 92% 62%)" : "white"}
              strokeWidth={isSelected ? 3 : 1.5}
            />
            <text
              x={r.cx}
              y={r.cy + 4}
              textAnchor="middle"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
              fill="white"
            >
              {r.count}
            </text>
            <text
              x={r.cx}
              y={r.cy + 20 + r.intensity * 18 + 12}
              textAnchor="middle"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              fill="hsl(157 53% 8%)"
            >
              {r.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MultiLineChart({
  years,
  series,
}: {
  years: string[];
  series: { ost: number[]; vestland: number[]; midt: number[] };
}) {
  const w = 1100;
  const h = 240;
  const pad = 36;
  const allVals = [...series.ost, ...series.vestland, ...series.midt];
  const min = 0;
  const max = Math.max(...allVals) + 4;

  const scaleX = (i: number) =>
    pad + (i / (years.length - 1)) * (w - pad * 2);
  const scaleY = (v: number) =>
    h - pad - ((v - min) / (max - min)) * (h - pad * 2);

  const pathFor = (arr: number[]) =>
    "M " + arr.map((v, i) => `${scaleX(i)} ${scaleY(v)}`).join(" L ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={pad}
          y1={pad + g * (h - pad * 2)}
          x2={w - pad}
          y2={pad + g * (h - pad * 2)}
          stroke="hsl(60 8% 90%)"
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />
      ))}
      {/* x-labels */}
      {years.map((y, i) => (
        <text
          key={y}
          x={scaleX(i)}
          y={h - 8}
          textAnchor="middle"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          fill="hsl(60 4% 37%)"
        >
          {y}
        </text>
      ))}

      <path
        d={pathFor(series.midt)}
        fill="none"
        stroke="hsl(40 80% 50%)"
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      <path
        d={pathFor(series.vestland)}
        fill="none"
        stroke="hsl(72 60% 45%)"
        strokeWidth={2.5}
      />
      <path
        d={pathFor(series.ost)}
        fill="none"
        stroke="hsl(159 100% 17%)"
        strokeWidth={3}
      />
      {/* markers Region Øst */}
      {series.ost.map((v, i) => (
        <circle
          key={i}
          cx={scaleX(i)}
          cy={scaleY(v)}
          r={3.5}
          fill="hsl(159 100% 17%)"
          stroke="white"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

function RetentionRow({
  cohort,
}: {
  cohort: { year: string; retention: number[] };
}) {
  return (
    <>
      <div className="flex items-center font-mono text-[10px] font-semibold text-muted-foreground">
        Født {cohort.year}
      </div>
      {cohort.retention.map((r, i) => {
        if (r === 0)
          return (
            <div
              key={i}
              className="aspect-square rounded-md border border-dashed border-border bg-background"
            />
          );
        return (
          <div
            key={i}
            className="grid aspect-square place-items-center rounded-md text-[10px] font-mono font-semibold tabular-nums"
            style={{
              background: `hsl(159 100% 17% / ${r})`,
              color: r > 0.6 ? "white" : "hsl(157 53% 8%)",
            }}
          >
            {Math.round(r * 100)} %
          </div>
        );
      })}
    </>
  );
}

function Kpi({
  label,
  value,
  delta,
  dark = false,
}: {
  label: string;
  value: string;
  delta: string;
  dark?: boolean;
}) {
  if (dark) {
    return (
      <div
        className="rounded-lg p-5 text-[#F5F4EE]"
        style={{
          background:
            "linear-gradient(135deg, hsl(159 100% 10%) 0%, hsl(159 100% 17%) 100%)",
        }}
      >
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
          {label}
        </span>
        <div className="mt-3 font-mono text-[36px] font-medium tabular-nums leading-none text-accent">
          {value}
        </div>
        <div className="mt-2.5 font-mono text-[11px] font-semibold text-accent">
          {delta}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-3 font-mono text-[32px] font-medium tabular-nums leading-none">
        {value}
      </div>
      <div className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-[#E5F1EA] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#1A7D56]">
        {delta}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  delta,
  muted = false,
}: {
  label: string;
  value: string;
  delta: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[18px] font-semibold tabular-nums leading-none">
        {value}
      </div>
      <div
        className={`mt-1.5 font-mono text-[10px] font-medium ${
          muted ? "text-muted-foreground" : "text-[#1A7D56]"
        }`}
      >
        {delta}
      </div>
    </div>
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

function LegendLine({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="8" viewBox="0 0 22 8">
        <line
          x1="0"
          y1="4"
          x2="22"
          y2="4"
          stroke={color}
          strokeWidth={2}
          strokeDasharray={dashed ? "4 3" : undefined}
        />
      </svg>
      {label}
    </span>
  );
}
