/**
 * PlayerHQ · Statistikk · Drill-down per metrikk
 *
 * Migrert fra public/design/batch3/statistikk-drill-down-side.html.
 * Dynamisk rute som åpner detalj-visning for én KPI (sg-approach, sg-tee, putts, etc.).
 */
import Link from "next/link";
import { Sparkles, Plus, MessageSquare } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";

const SG_VALUES = [
  -0.2, -0.15, -0.1, 0.02, 0.08, 0.12, 0.06, 0.14, 0.2, 0.18, 0.1, 0.22, 0.3,
  0.28, 0.32, 0.25, 0.36, 0.42, 0.38, 0.4, 0.5, 0.46, 0.42, 0.55, 0.48, 0.42,
  0.42, 0.5, 0.46, 0.42,
];

const PERIODS = ["7 d", "30 d", "90 d", "Sesong", "Alle"];

type MetricInfo = {
  title: string;
  italic: string;
  trail?: string;
  unit: string;
  big: string;
  delta: string;
  vsBenchmark: string;
  bestLabel: string;
};

const METRICS: Record<string, MetricInfo> = {
  "sg-approach": {
    title: "SG",
    italic: "Approach",
    trail: "30 d",
    unit: "SG/runde · snitt 30 d",
    big: "+0,42",
    delta: "↑ +0,12 vs forrige 30 d",
    vsBenchmark: "+0,18 vs topp 10 % U18",
    bestLabel: "+1,7 · 14. MAI · GFGK Old",
  },
  "sg-tee": {
    title: "SG",
    italic: "Tee",
    trail: "30 d",
    unit: "SG/runde · snitt 30 d",
    big: "+0,28",
    delta: "↑ +0,06 vs forrige 30 d",
    vsBenchmark: "+0,16 vs topp 10 % U18",
    bestLabel: "+1,1 · 28. APR · Onsøy GK",
  },
  putts: {
    title: "Putts",
    italic: "per runde",
    trail: "30 d",
    unit: "Antall · snitt 30 d",
    big: "31,4",
    delta: "↓ −1,2 vs forrige 30 d",
    vsBenchmark: "−2,1 vs topp 10 % U18",
    bestLabel: "27 · 14. MAI · GFGK Old",
  },
};

export default async function MetricDrillDownPage({
  params,
}: {
  params: Promise<{ metric: string }>;
}) {
  await requirePortalUser();
  const { metric } = await params;
  const info =
    METRICS[metric] ?? {
      title: metric,
      italic: "detalj",
      unit: "Snitt 30 d",
      big: "—",
      delta: "—",
      vsBenchmark: "—",
      bestLabel: "—",
    };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        eyebrow={`PlayerHQ · Statistikk · ${metric.toUpperCase()}`}
        titleLead={info.title}
        titleItalic={info.italic}
        titleTrail={info.trail}
        sub={info.unit}
        actions={
          <div className="flex gap-1 rounded-full border border-border bg-card p-1">
            {PERIODS.map((p, i) => (
              <button
                key={p}
                type="button"
                className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] ${
                  i === 1
                    ? "bg-foreground text-accent"
                    : "text-muted-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      {/* Hero stat */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="col-span-1 sm:col-span-1 rounded-2xl border border-primary bg-primary p-6 text-primary-foreground">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] opacity-80">
            Snitt 30 d
          </div>
          <div className="mt-3 font-mono text-5xl font-semibold tabular-nums">
            {info.big}
          </div>
          <div className="mt-3 font-mono text-xs opacity-90">{info.delta}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            vs Benchmark
          </div>
          <div className="mt-3 font-mono text-3xl font-semibold text-primary tabular-nums">
            {info.vsBenchmark.split(" ")[0]}
          </div>
          <div className="mt-3 font-mono text-[11px] text-muted-foreground">
            {info.vsBenchmark.split(" ").slice(1).join(" ")}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Best 30 d
          </div>
          <div className="mt-3 font-mono text-3xl font-semibold tabular-nums">
            {info.bestLabel.split(" · ")[0]}
          </div>
          <div className="mt-3 font-mono text-[11px] text-muted-foreground">
            {info.bestLabel.split(" · ").slice(1).join(" · ")}
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-base font-semibold tracking-tight">
            {info.title} {info.italic} · 30 dager
          </h2>
          <div className="flex gap-4 font-mono text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-primary/30" /> SG kumulativt
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Beste runde
            </span>
          </div>
        </div>
        <SgChart values={SG_VALUES} />
        <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>20. apr</span>
          <span>27. apr</span>
          <span>4. mai</span>
          <span>11. mai</span>
          <span>18. mai</span>
        </div>
      </section>

      {/* Sub stats */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SubStat label="GIR%" value="67%" delta="↑ +4 pp" sub="vs forrige 30 d" up />
        <SubStat
          label="Pin-avstand snitt"
          value="9,2"
          unit="m"
          delta="↓ −0,8 m"
          sub="nærmere pin"
          up
        />
        <SubStat
          label="Bias (long / short)"
          value="+2,1"
          unit="m long"
          delta="Konsekvent for langt — droppa én klubbe?"
        />
        <PieCard />
      </section>

      {/* Avstands-buckets */}
      <section>
        <div className="mb-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Avstands-buckets
          </h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            SG per avstands-bånd · 142 slag
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[1.4fr_60px_60px_1fr_80px] gap-4 border-b border-border bg-muted/40 px-6 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <span>Avstand</span>
            <span className="text-right">Slag</span>
            <span className="text-right">GIR%</span>
            <span>SG fordeling</span>
            <span className="text-right">SG snitt</span>
          </div>
          {[
            { range: "0—50 m", slag: 28, gir: "82%", w: 28, dir: "right" as const, sg: "+0,18", pos: true },
            { range: "50—100 m", slag: 31, gir: "74%", w: 22, dir: "right" as const, sg: "+0,14", pos: true },
            { range: "100—150 m", slag: 42, gir: "71%", w: 12, dir: "right" as const, sg: "+0,08", pos: true },
            { range: "150—200 m", slag: 29, gir: "52%", w: 14, dir: "left" as const, sg: "−0,09", pos: false },
            { range: "200+ m", slag: 12, gir: "41%", w: 24, dir: "left" as const, sg: "−0,16", pos: false },
          ].map((b) => (
            <div
              key={b.range}
              className="grid grid-cols-[1.4fr_60px_60px_1fr_80px] items-center gap-4 border-b border-border/60 px-6 py-3 last:border-0"
            >
              <span className="flex items-center gap-2 font-medium">
                <span
                  className={`h-2 w-2 rounded-full ${
                    b.pos ? "bg-primary" : "bg-destructive"
                  }`}
                />
                {b.range}
              </span>
              <span className="text-right font-mono text-sm tabular-nums">
                {b.slag}
              </span>
              <span className="text-right font-mono text-sm tabular-nums">
                {b.gir}
              </span>
              <span className="relative h-2 rounded-full bg-muted/60">
                <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-border" />
                <span
                  className={`absolute top-0 h-2 rounded-full ${
                    b.pos ? "bg-primary" : "bg-destructive"
                  }`}
                  style={
                    b.dir === "right"
                      ? { left: "50%", width: `${b.w}%` }
                      : { right: "50%", width: `${b.w}%` }
                  }
                />
              </span>
              <span
                className={`text-right font-mono text-sm font-semibold tabular-nums ${
                  b.pos ? "text-primary" : "text-destructive"
                }`}
              >
                {b.sg}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI drill recommendations */}
      <section className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-6">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
          <Sparkles size={11} strokeWidth={1.75} /> AI-anbefalt
        </span>
        <div className="mt-3 mb-4">
          <h2 className="font-display text-lg font-semibold">Hva å trene på</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            3 drills prioritert mot 150—200 m bucket
          </p>
        </div>
        <div className="space-y-3">
          {[
            { n: "01", title: "Pin-attack 100m — distanse-presisjon", meta: "Slag · 25 slag · TrackMan-tagget · 30 min", sg: "+0,12 SG" },
            { n: "02", title: "Long iron contact — CS70 → CS80", meta: "Tek · 40 baller · Impact-fokus · 35 min", sg: "+0,08 SG" },
            { n: "03", title: "Lag-distance · klubbe-stack", meta: "Slag · 5 klubber × 8 baller · 40 min", sg: "+0,06 SG" },
          ].map((d) => (
            <div
              key={d.n}
              className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center"
            >
              <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                {d.n}
              </span>
              <div className="flex-1">
                <div className="font-display text-sm font-semibold">
                  {d.title}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  {d.meta}
                </div>
              </div>
              <span className="rounded-sm bg-primary/10 px-2 py-1 font-mono text-xs font-semibold text-primary">
                {d.sg}
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-accent hover:opacity-90"
              >
                <Plus size={12} strokeWidth={2.5} /> Legg til
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Coach perspective */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-start">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground">
          AK
        </span>
        <div className="flex-1">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Coach-perspektiv · Anders K.
          </span>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            &ldquo;Du har <strong>+0,42 SG</strong> totalt, men{" "}
            <strong>−0,09 SG</strong> i 150—200 m. Vi jobber med kontakt på
            CS70-CS80 før Sørlandsåpent. Klubbe-distansene dine viser at du har
            1—2 klubber for langt — vi tar det på neste økt.&rdquo;
          </p>
          <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            12. mai 2026 · etter 30 d review
          </span>
        </div>
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90"
        >
          <MessageSquare size={12} strokeWidth={1.75} /> Svar Anders
        </Link>
      </section>
    </div>
  );
}

function SubStat({
  label,
  value,
  unit,
  delta,
  sub,
  up,
}: {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  sub?: string;
  up?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2 flex items-baseline gap-1 font-mono text-3xl font-semibold tabular-nums">
        {value}
        {unit && (
          <span className="text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <div className="mt-2 font-mono text-[11px] text-muted-foreground">
        {up !== undefined && (
          <span className={up ? "font-semibold text-primary" : "font-semibold text-destructive"}>
            {delta}
          </span>
        )}{" "}
        {sub ?? (up === undefined ? delta : "")}
      </div>
    </div>
  );
}

function PieCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Klubb-fordeling
      </span>
      <div className="mt-2 flex items-center gap-3">
        <svg viewBox="0 0 36 36" className="h-20 w-20">
          <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--background))" strokeWidth="6" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#005840" strokeWidth="6" strokeDasharray="28.15 87.96" strokeDashoffset="0" transform="rotate(-90 18 18)" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#2C7D52" strokeWidth="6" strokeDasharray="21.11 87.96" strokeDashoffset="-28.15" transform="rotate(-90 18 18)" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#88B45A" strokeWidth="6" strokeDasharray="15.83 87.96" strokeDashoffset="-49.26" transform="rotate(-90 18 18)" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#D1F843" strokeWidth="6" strokeDasharray="12.31 87.96" strokeDashoffset="-65.09" transform="rotate(-90 18 18)" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#1A4D2E" strokeWidth="6" strokeDasharray="10.55 87.96" strokeDashoffset="-77.40" transform="rotate(-90 18 18)" />
        </svg>
        <div className="space-y-1 font-mono text-[10px]">
          {[
            { c: "#005840", l: "7i", p: "32%" },
            { c: "#2C7D52", l: "8i", p: "24%" },
            { c: "#88B45A", l: "9i", p: "18%" },
            { c: "#D1F843", l: "PW", p: "14%" },
            { c: "#1A4D2E", l: "Annet", p: "12%" },
          ].map((r) => (
            <div key={r.l} className="flex items-center gap-1.5">
              <span className="block h-2 w-2 rounded-sm" style={{ background: r.c }} />
              <span className="w-8 text-foreground">{r.l}</span>
              <span className="text-muted-foreground">{r.p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SgChart({ values }: { values: number[] }) {
  const yMin = -1.0;
  const yMax = 2.0;
  const xy = values.map((v, i) => ({
    x: (i / (values.length - 1)) * 100,
    y: ((yMax - v) / (yMax - yMin)) * 100,
  }));
  let path = `M ${xy[0].x} ${xy[0].y}`;
  for (let i = 1; i < xy.length; i++) {
    const p0 = xy[i - 1];
    const p1 = xy[i];
    const midX = (p0.x + p1.x) / 2;
    path += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const areaPath = path + ` L 100 100 L 0 100 Z`;
  const bestIdx = values.indexOf(Math.max(...values));
  const best = xy[bestIdx];

  return (
    <div className="relative h-48 w-full">
      <div className="absolute left-0 top-0 flex h-full w-10 flex-col justify-between font-mono text-[10px] text-muted-foreground">
        <span>+2,0</span>
        <span>+1,0</span>
        <span>0,0</span>
        <span>−1,0</span>
      </div>
      <div className="absolute inset-y-0 left-10 right-0">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="sg-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#005840" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#005840" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line x1="0" y1={((yMax - 0) / (yMax - yMin)) * 100} x2="100" y2={((yMax - 0) / (yMax - yMin)) * 100} stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="1 1" />
          <path d={areaPath} fill="url(#sg-grad)" stroke="none" />
          <path d={path} fill="none" stroke="#005840" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          aria-hidden="true"
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-accent"
          style={{ left: `${best.x}%`, top: `${best.y}%` }}
        />
      </div>
    </div>
  );
}
