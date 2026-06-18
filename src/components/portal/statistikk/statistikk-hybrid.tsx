/**
 * StatistikkHub — hybrid design (2026-06-17)
 *
 * Portert fra: public/design-handover/prosjektgjennomgang-2026-06-17/
 *   prosjektgjennomgang-og-wireframing/project/PlayerHQ Statistikk-hub (hybrid).dc.html
 *
 * Layout (top → bunn):
 *   1. Editorial hero: "Statistikk-hub" + navn/HCP-subtittel
 *   2. KPI-strip: 2×2 grid — Snittscore · SG Total · Putts/runde · GIR %
 *   3. TrendBand: SVG inline — score-utvikling siste runder (proxy for HCP)
 *   4. Hub-shortcuts: 2-kolonne grid av klikkbare hub-kort
 *
 * Server component — all data sendt inn som props fra page.tsx.
 * Ingen Prisma/DB/auth her.
 *
 * Design-regler:
 * - PlayerHQ er alltid LYST tema (ingen .dark, ingen mørke gradienter)
 * - font-display = Inter Tight, font-mono = JetBrains Mono, font-sans = Inter
 * - Inline styles kun for gradienter (Tailwind v4 støtter ikke arbitrary gradienter)
 * - Ingen hardkodet hex → CSS tokens (var(--color-primary) osv.) eller Tailwind-klasser
 * - Ingen emoji → Lucide-ikoner
 */

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Datamodell ────────────────────────────────────────────────────────────────

export type KpiTile = {
  label: string;
  val: string;
  delta: string;
  positive: boolean;
  /** Sett til true for siste i raden (ingen border-right) */
  lastInRow?: boolean;
  /** Sett til true for siste rad (ingen border-bottom) */
  lastRow?: boolean;
};

export type HubShortcut = {
  label: string;
  sub: string;
  href: string;
  icon: React.ElementType;
};

export type StatistikkHybridData = {
  /** F.eks. "Øyvind Rohjan · HCP 4,2" */
  identitetsLinje: string;
  kpis: KpiTile[];
  /** Runde-scores for SVG-trend (nyeste sist, maks 10) */
  trendScores: number[];
  hubs: HubShortcut[];
};

// ── KPI strip ─────────────────────────────────────────────────────────────────

function KpiStrip({ kpis }: { kpis: KpiTile[] }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(10,31,23,.07)]">
      {kpis.map((k, i) => {
        const isOdd = i % 2 === 1;
        const isLastRow = i >= kpis.length - 2;
        return (
          <div
            key={k.label}
            className={cn(
              "flex flex-col gap-[5px] p-3",
              !isOdd && "border-r border-border/60",
              !isLastRow && "border-b border-border/60",
            )}
          >
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              {k.label}
            </span>
            <span className="font-mono text-[20px] font-semibold leading-none tabular-nums text-foreground">
              {k.val}
            </span>
            <span
              className={cn(
                "flex items-center gap-[3px] font-mono text-[9.5px] font-semibold",
                k.positive ? "text-success" : "text-destructive",
              )}
            >
              {k.positive ? (
                <TrendingUp className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
              ) : (
                <TrendingDown className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
              )}
              {k.delta}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── TrendBand (inline SVG — score over tid) ────────────────────────────────────

function TrendBandCard({ scores }: { scores: number[] }) {
  const W = 320;
  const H = 70;
  const pL = 8;
  const pR = 8;
  const pT = 8;
  const pB = 18;

  if (scores.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-[13px] shadow-[0_1px_3px_rgba(10,31,23,.07)]">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-[14px] font-bold tracking-[-0.02em] text-foreground">
            Score<em className="font-medium italic text-primary">-utvikling</em>
          </span>
          <span className="font-mono text-[9.5px] text-muted-foreground">siste runder</span>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">
          Trenger minst 2 runder for å vise trend.
        </p>
      </div>
    );
  }

  const pts = scores.slice(-10);
  const minS = Math.min(...pts) - 1;
  const maxS = Math.max(...pts) + 1;
  const xOf = (i: number) => pL + (i / (pts.length - 1)) * (W - pL - pR);
  const yOf = (s: number) =>
    pT + ((s - minS) / (maxS - minS)) * (H - pT - pB);

  const linePts = pts
    .map((s, i) => `${xOf(i).toFixed(1)},${yOf(s).toFixed(1)}`)
    .join(" ");
  const areaPts =
    `${xOf(0).toFixed(1)},${(H - pB).toFixed(1)} ` +
    pts.map((s, i) => `${xOf(i).toFixed(1)},${yOf(s).toFixed(1)}`).join(" ") +
    ` ${xOf(pts.length - 1).toFixed(1)},${(H - pB).toFixed(1)}`;

  // Goal band: middle 50% of score range (proxy for "par zone")
  const bandTop = yOf(minS + (maxS - minS) * 0.35).toFixed(1);
  const bandH = (yOf(minS + (maxS - minS) * 0.65) - yOf(minS + (maxS - minS) * 0.35)).toFixed(1);

  const lastX = xOf(pts.length - 1).toFixed(1);
  const lastY = yOf(pts[pts.length - 1]).toFixed(1);
  const lastScore = pts[pts.length - 1];

  return (
    <div className="rounded-xl border border-border bg-card p-[13px] shadow-[0_1px_3px_rgba(10,31,23,.07)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-[14px] font-bold tracking-[-0.02em] text-foreground">
          Score<em className="font-medium italic text-primary">-utvikling</em>
        </span>
        <span className="font-mono text-[9.5px] text-muted-foreground">
          {pts.length} runder
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: `${H}px`, display: "block" }}
        aria-label="Scorekurve siste runder"
      >
        {/* Goal band */}
        <rect
          x={pL}
          y={bandTop}
          width={W - pL - pR}
          height={bandH}
          fill="var(--color-primary)"
          fillOpacity={0.08}
          rx={3}
        />
        {/* Area fill */}
        <polygon
          points={areaPts}
          fill="rgba(209,248,67,.12)"
        />
        {/* Line */}
        <polyline
          points={linePts}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End dot */}
        <circle
          cx={lastX}
          cy={lastY}
          r={3.5}
          fill="var(--color-primary)"
        />
        {/* Latest score label */}
        <text
          x={lastX}
          y={parseFloat(lastY) > H - pB - 14 ? parseFloat(lastY) - 7 : parseFloat(lastY) + 12}
          textAnchor="middle"
          fontFamily="var(--font-jetbrains-mono, monospace)"
          fontSize={8}
          fontWeight={700}
          fill="var(--color-primary)"
        >
          {lastScore}
        </text>
      </svg>
    </div>
  );
}

// ── Hub shortcut card ──────────────────────────────────────────────────────────

function HubCard({ hub }: { hub: HubShortcut }) {
  const Icon = hub.icon;
  return (
    <Link
      href={hub.href}
      className="flex flex-col gap-[9px] rounded-xl border border-border bg-card p-[14px] shadow-[0_1px_3px_rgba(10,31,23,.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(10,31,23,.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <div
        className="flex h-[34px] w-[34px] items-center justify-center rounded-lg"
        style={{ background: "rgba(0,88,64,.08)", color: "var(--color-primary)" }}
      >
        <Icon size={17} strokeWidth={1.5} aria-hidden />
      </div>
      <span className="text-[13.5px] font-semibold leading-tight text-foreground">
        {hub.label}
      </span>
      <span className="font-mono text-[9.5px] text-muted-foreground">
        {hub.sub}
      </span>
    </Link>
  );
}

// ── Rot-komponent ──────────────────────────────────────────────────────────────

export function StatistikkHub({ data }: { data: StatistikkHybridData }) {
  return (
    <div className="mx-auto w-full max-w-[460px] space-y-[14px] px-4 pb-6 pt-[10px] sm:px-0">

      {/* 1. Hero */}
      <div className="px-0 pb-[0px]">
        <h1 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
          Statistikk
          <em className="font-medium italic text-primary">-hub</em>
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {data.identitetsLinje}
        </p>
      </div>

      {/* 2. KPI strip */}
      <KpiStrip kpis={data.kpis} />

      {/* 3. TrendBand */}
      <TrendBandCard scores={data.trendScores} />

      {/* 4. Hub shortcuts */}
      <div className="grid grid-cols-2 gap-[9px]">
        {data.hubs.map((h) => (
          <HubCard key={h.label} hub={h} />
        ))}
      </div>

    </div>
  );
}
