/**
 * DEMO — CoachHQ Talent · Spiller-360
 * Spec: _extracted/talent-design/uploads/03-spiller-360.md
 * URL: /talent-spiller-360-demo
 *
 * Default state: lyst tema, ingen sidebar/shell. Server component.
 */

import {
  ChevronLeft,
  StickyNote,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
  Target,
  AlertTriangle,
} from "lucide-react";

const KPI = {
  percentile: 94,
  percentileDelta: "+3 vs forrige mnd",
  ngfNivaa: 4, // 0–5
  formPct: "+8 %",
  formTrend: [60, 62, 58, 64, 70, 72, 78, 82, 80, 84],
  talentScore: "94",
  talentDelta: "+6",
};

const SG_AXES = ["OTT", "APP", "ARG", "PUT", "OG"];
const SG_PLAYER = [0.92, 0.66, 0.74, 0.82, 0.79];
const SG_COHORT = [0.55, 0.55, 0.55, 0.55, 0.55];

const TRAJECTORY = {
  cohort: [76.8, 76.2, 75.6, 75.0, 74.4, 73.8, 73.2, 72.8, 72.4, 72.0],
  player: [76.0, 75.5, 74.6, 73.5, 72.4, 71.4, 70.8, 70.5, 70.2, 70.1],
};

const DISTANCE_BUCKETS = [
  { yds: "50–75", z: 0.4 },
  { yds: "75–100", z: 0.1 },
  { yds: "100–125", z: -0.42 }, // verst
  { yds: "125–150", z: -0.18 },
  { yds: "150–175", z: 0.12 },
  { yds: "175–200", z: 0.28 },
  { yds: "200+", z: 0.05 },
];

const ROUNDS = { under: 4, even: 6, plus1to3: 7, plus4: 2 };

const PRO_MATCHES = [
  { initials: "KV", name: "Kris Ventura", meta: "2017 · NCAA D-I", match: "82 %", primary: true },
  { initials: "VH", name: "Viktor Hovland", meta: "2014 · ledet U18", match: "71 %" },
  { initials: "AM", name: "Andreas Mikkelsen", meta: "2015 · Nordic Tour", match: "67 %" },
];

const NCAA_STEPS = ["D-III", "NAIA", "D-II", "D-I"];
const NCAA_CURRENT = 3;

export default function TalentSpiller360Demo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* PageHeader */}
        <header className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Talent · Spiller-360
            </span>
            <h1 className="mt-1.5 flex items-center gap-3 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
              <em className="font-medium italic">Markus</em> Roinås Pedersen
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              Tilbake
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
              <StickyNote className="h-4 w-4" strokeWidth={1.5} />
              Notater
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground">
              <CalendarCheck className="h-4 w-4" strokeWidth={1.5} />
              Planlegg test
            </button>
          </div>
        </header>

        {/* Editorial hero */}
        <section
          className="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-8 rounded-lg border border-border p-8"
          style={{
            background:
              "linear-gradient(135deg, hsl(45 18% 96%) 0%, hsl(45 18% 99%) 100%)",
          }}
        >
          <div className="grid h-28 w-28 place-items-center rounded-full bg-primary text-primary-foreground">
            <span className="font-display text-[40px] font-semibold leading-none">
              MP
            </span>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              WANG Toppidrett · 16 år · HCP +2,4 · Coach: Anders Kristiansen
            </span>
            <h2 className="mt-2 max-w-[640px] font-display text-[28px] leading-[1.2]">
              <em className="font-medium italic">Markus</em> er i{" "}
              <span className="font-semibold">94. percentil</span> i sin
              16-årskohort og forbedrer seg{" "}
              <span className="font-semibold">1,8 slag/år</span>. SG-profilen
              ligner mest på <em className="font-medium italic">Kris Ventura</em>{" "}
              ved samme alder.
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Pill tone="success">Form +8 %</Pill>
              <Pill tone="info">Talent 94</Pill>
              <Pill tone="muted">Kategori A1</Pill>
            </div>
          </div>
          <div className="grid place-items-center text-center">
            <span className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
              Avg runde
            </span>
            <span className="mt-1 font-mono text-[44px] font-medium tabular-nums leading-none">
              70,1
            </span>
            <span className="mt-1 font-mono text-[10px] font-medium text-success">
              −0,8 vs i fjor
            </span>
          </div>
        </section>

        {/* ActionStrip */}
        <div
          className="mb-6 flex items-center gap-4 rounded-lg px-6 py-4 text-[13px] text-[#F5F4EE]"
          style={{
            background:
              "linear-gradient(135deg, hsl(159 100% 12%) 0%, hsl(159 100% 17%) 100%)",
          }}
        >
          <Target className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
          <p className="leading-snug">
            <b className="font-semibold">Neste 90 dager</b>{" "}
            <span className="opacity-80">
              · fokuser 100–125y approach, fysisk-test 24. mai, Nordic Tour Q1 i
              juni
            </span>
          </p>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-accent-foreground">
            Åpne plan
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Du er her — 4 KPI */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {/* Percentil */}
          <div className="rounded-lg border border-border bg-card p-5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Percentil
            </span>
            <div className="mt-3 font-mono text-[36px] font-medium tabular-nums leading-none">
              {KPI.percentile}
              <span className="text-[20px] text-muted-foreground">.</span>
            </div>
            <DensityCurve highlight={94} />
            <div className="mt-2 font-mono text-[10px] text-success">
              {KPI.percentileDelta}
            </div>
          </div>

          {/* NGF-klasse */}
          <div className="rounded-lg border border-border bg-card p-5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              NGF-klasse
            </span>
            <div className="mt-3 font-display text-[24px] font-semibold leading-tight">
              Klasse A
            </div>
            <LadderMeter steps={5} current={KPI.ngfNivaa} />
            <div className="mt-2 font-mono text-[10px] text-muted-foreground">
              Topp-trinn nådd
            </div>
          </div>

          {/* Form */}
          <div className="rounded-lg border border-border bg-card p-5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Form
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-[36px] font-medium tabular-nums leading-none text-success">
                {KPI.formPct}
              </span>
              <TrendingUp className="h-4 w-4 text-success" strokeWidth={1.5} />
            </div>
            <Sparkline values={KPI.formTrend} />
            <div className="mt-2 font-mono text-[10px] text-muted-foreground">
              10 runder · stigende
            </div>
          </div>

          {/* Talent-score — mørkt kort */}
          <div
            className="rounded-lg p-5 text-[#F5F4EE]"
            style={{
              background:
                "linear-gradient(135deg, hsl(159 100% 10%) 0%, hsl(159 100% 17%) 100%)",
            }}
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
              Talent-score
            </span>
            <div className="mt-3 font-mono text-[44px] font-medium tabular-nums leading-none text-accent">
              {KPI.talentScore}
            </div>
            <div className="mt-3 font-mono text-[11px] font-semibold text-accent">
              {KPI.talentDelta} siste 6 mnd
            </div>
            <div className="mt-1 font-mono text-[10px] opacity-70">
              Topp 5 i kohort
            </div>
          </div>
        </div>

        {/* Bento 1: SG + svakhet + trajectory */}
        <div className="mb-4 grid grid-cols-12 gap-4">
          {/* SG-radar */}
          <section className="col-span-5 row-span-2 rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  SG-profil vs. kohort
                </div>
                <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                  Hvor henter han slag?
                </h3>
              </div>
              <Pill tone="warning">Begrenset DG-data</Pill>
            </div>
            <div className="mt-4 grid place-items-center">
              <SGRadar />
            </div>
            <div className="mt-4 flex items-center justify-center gap-5 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                Markus
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
                Kohort-snitt 16 år
              </span>
            </div>
          </section>

          {/* Svakhet */}
          <section className="col-span-7 rounded-lg border border-border bg-secondary/40 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Svakhet · drill-fokus
            </div>
            <h3 className="mt-2 font-display text-[24px] italic leading-tight">
              <em className="font-medium italic">Approach</em> 100–125y
            </h3>
            <p className="mt-2 max-w-[480px] text-[13px] leading-snug text-muted-foreground">
              Du taper <b className="font-semibold text-foreground">−0,42 SG</b>{" "}
              mot kohort på approach. Verst på{" "}
              <b className="font-semibold text-foreground">100–125y</b> der du
              er 0,18 SG bak.
            </p>
            <button className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground">
              Anbefalt: 3 tester denne uken
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </section>

          {/* Trajectory */}
          <section className="col-span-7 rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Score-trajectory vs. kohort
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Forbedring siste 12 mnd
            </h3>
            <TrajectoryChart cohort={TRAJECTORY.cohort} player={TRAJECTORY.player} />
          </section>
        </div>

        {/* Bento 2: pro-trajectory + NCAA + utviklingsnivå */}
        <div className="mb-4 grid grid-cols-12 gap-4">
          <section className="col-span-6 rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Pro-trajectory-overlay
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Hvem ligner Markus mest på?
            </h3>
            <ul className="mt-3 space-y-2">
              {PRO_MATCHES.map((p) => (
                <li
                  key={p.initials}
                  className={`flex items-center justify-between rounded-md px-3 py-2.5 ${
                    p.primary
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full text-[11px] font-semibold ${
                        p.primary
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-background text-foreground"
                      }`}
                    >
                      {p.initials}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold">{p.name}</div>
                      <div className="mt-0.5 text-[11px] opacity-70">{p.meta}</div>
                    </div>
                  </div>
                  <span className="font-mono text-[14px] font-semibold tabular-nums">
                    {p.match}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="col-span-3 rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              NCAA-readiness
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              D-I vei
            </h3>
            <LadderMeter steps={NCAA_STEPS.length} current={NCAA_CURRENT} labels={NCAA_STEPS} />
            <div className="mt-3 text-[12px] leading-snug text-muted-foreground">
              Score-equiv NCAA{" "}
              <b className="font-semibold tabular-nums text-foreground">73,4</b>{" "}
              · D-I cutoff{" "}
              <b className="font-semibold tabular-nums text-foreground">71,8</b>.
              Trenger −1,6 forbedring.
            </div>
          </section>

          <section className="col-span-3 rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Utviklingsnivå
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              Steg 5 av 6
            </h3>
            <LadderMeter steps={6} current={4} />
            <div className="mt-3 text-[12px] leading-snug text-muted-foreground">
              Spesifikk fase · klar for konkurranse-trening
            </div>
          </section>
        </div>

        {/* Bento 3: distance + round-dist */}
        <div className="grid grid-cols-12 gap-4">
          <section className="col-span-7 rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Approach-svakhet per yardage
                </div>
                <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                  Hvor i banen taper han slag?
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FBE4E4] px-2 py-0.5 text-[10px] font-medium text-destructive">
                <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
                100–125y svakest
              </span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {DISTANCE_BUCKETS.map((b) => {
                const intensity = Math.min(Math.abs(b.z) / 0.5, 1);
                const bg =
                  b.z < 0
                    ? `rgba(163, 45, 45, ${0.15 + intensity * 0.55})`
                    : `rgba(26, 125, 86, ${0.15 + intensity * 0.45})`;
                return (
                  <div
                    key={b.yds}
                    className="rounded-md p-3 text-center"
                    style={{ background: bg }}
                  >
                    <div className="font-mono text-[10px] text-foreground/80">
                      {b.yds}
                    </div>
                    <div className="mt-1.5 font-mono text-[16px] font-semibold tabular-nums leading-none">
                      {b.z > 0 ? "+" : ""}
                      {b.z.toString().replace(".", ",")}
                    </div>
                    <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-foreground/60">
                      SG
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="col-span-5 rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Runde-fordeling · siste 12 mnd
            </div>
            <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
              19 runder, volatilitet lav
            </h3>
            <RoundDistribution rounds={ROUNDS} />
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Volatilitet</span>
              <Pill tone="success">σ 1,4 · stabil</Pill>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SGRadar() {
  const cx = 130;
  const cy = 120;
  const r = 92;
  const pointFor = (val: number, i: number) => {
    const angle = (Math.PI * 2 * i) / SG_AXES.length - Math.PI / 2;
    return [cx + Math.cos(angle) * r * val, cy + Math.sin(angle) * r * val];
  };
  const polyOf = (vals: number[]) =>
    vals.map((v, i) => pointFor(v, i).join(",")).join(" ");

  return (
    <svg width="260" height="240" viewBox="0 0 260 240">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon
          key={g}
          points={polyOf(SG_AXES.map(() => g))}
          fill="none"
          stroke="hsl(60 8% 90%)"
          strokeWidth={0.75}
        />
      ))}
      {SG_AXES.map((_, i) => {
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
        points={polyOf(SG_COHORT)}
        fill="hsl(60 4% 37% / 0.10)"
        stroke="hsl(60 4% 37%)"
        strokeWidth={1.25}
        strokeDasharray="4 4"
      />
      <polygon
        points={polyOf(SG_PLAYER)}
        fill="hsl(159 100% 17% / 0.22)"
        stroke="hsl(159 100% 17%)"
        strokeWidth={2}
      />
      {SG_AXES.map((a, i) => {
        const [x, y] = pointFor(1.15, i);
        return (
          <text
            key={a}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
            fontWeight="600"
            fill="hsl(157 53% 8%)"
          >
            {a}
          </text>
        );
      })}
    </svg>
  );
}

function DensityCurve({ highlight }: { highlight: number }) {
  const w = 200;
  const h = 32;
  // bell-curve-aktig path
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 40; i++) {
    const x = i / 40;
    const y = Math.exp(-Math.pow((x - 0.5) * 4, 2));
    pts.push([x * w, h - y * (h - 4)]);
  }
  const d =
    "M " +
    pts.map((p) => p.join(" ")).join(" L ") +
    ` L ${w} ${h} L 0 ${h} Z`;
  const hx = (highlight / 100) * w;
  return (
    <svg width={w} height={h} className="mt-3 block" viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="hsl(60 8% 90%)" />
      <line x1={hx} y1={2} x2={hx} y2={h} stroke="hsl(159 100% 17%)" strokeWidth={2} />
    </svg>
  );
}

function LadderMeter({
  steps,
  current,
  labels,
}: {
  steps: number;
  current: number;
  labels?: string[];
}) {
  return (
    <div className="mt-3">
      <div className="flex gap-1">
        {Array.from({ length: steps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i <= current ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
          {labels.map((l, i) => (
            <span
              key={l}
              className={i === current ? "font-semibold text-foreground" : ""}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 200;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return [x, y];
  });
  const d = "M " + pts.map((p) => p.join(" ")).join(" L ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 block w-full"
      preserveAspectRatio="none"
    >
      <path d={d} fill="none" stroke="hsl(159 100% 17%)" strokeWidth={2} />
    </svg>
  );
}

function TrajectoryChart({
  cohort,
  player,
}: {
  cohort: number[];
  player: number[];
}) {
  const w = 600;
  const h = 200;
  const pad = 24;
  const all = [...cohort, ...player];
  const min = Math.min(...all) - 0.5;
  const max = Math.max(...all) + 0.5;
  const scaleX = (i: number, len: number) =>
    pad + (i / (len - 1)) * (w - pad * 2);
  const scaleY = (v: number) =>
    h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const pathFor = (arr: number[]) =>
    "M " +
    arr.map((v, i) => `${scaleX(i, arr.length)} ${scaleY(v)}`).join(" L ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full">
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
      <path
        d={pathFor(cohort)}
        fill="none"
        stroke="hsl(60 4% 37%)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <path
        d={pathFor(player)}
        fill="none"
        stroke="hsl(159 100% 17%)"
        strokeWidth={2.5}
      />
      {player.map((v, i) => (
        <circle
          key={i}
          cx={scaleX(i, player.length)}
          cy={scaleY(v)}
          r={3}
          fill="hsl(159 100% 17%)"
        />
      ))}
    </svg>
  );
}

function RoundDistribution({
  rounds,
}: {
  rounds: { under: number; even: number; plus1to3: number; plus4: number };
}) {
  const total = rounds.under + rounds.even + rounds.plus1to3 + rounds.plus4;
  const segs = [
    { label: "Under par", count: rounds.under, color: "hsl(159 100% 17%)" },
    { label: "Even", count: rounds.even, color: "hsl(72 60% 50%)" },
    { label: "+1 til +3", count: rounds.plus1to3, color: "hsl(40 80% 50%)" },
    { label: "+4 eller mer", count: rounds.plus4, color: "hsl(0 56% 50%)" },
  ];
  return (
    <div className="mt-4">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segs.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.count / total) * 100}%`, background: s.color }}
          />
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {segs.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between text-[12px]"
          >
            <span className="inline-flex items-center gap-2 text-foreground">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {s.count} runder
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "info" | "muted" | "success" | "warning";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    info: "bg-primary/10 text-primary",
    success: "bg-primary/10 text-success",
    warning: "bg-[#FFF0D6] text-warning",
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
