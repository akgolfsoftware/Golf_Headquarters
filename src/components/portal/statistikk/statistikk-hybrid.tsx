/**
 * StatistikkHub — hybrid design (2026-06-17)
 *
 * Portert fra: [historisk fasit, fjernet 2026-07-03] prosjektgjennomgang-2026-06-17/
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
 * - font-display = Familjen Grotesk, font-mono = JetBrains Mono, font-sans = Inter
 * - Inline styles kun for gradienter (Tailwind v4 støtter ikke arbitrary gradienter)
 * - Ingen hardkodet hex → CSS tokens (var(--color-primary) osv.) eller Tailwind-klasser
 * - Ingen emoji → Lucide-ikoner
 */

import Link from "next/link";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { Card, Eyebrow, KpiTile as DsKpiTile } from "@/components/athletic/golfdata";

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

/** Ett rangert SG-gap («LUKK DISSE TIL NESTE NIVÅ»). */
export type SgGap = {
  /** Områdenavn, f.eks. "Nærspill". */
  omrade: string;
  /** Spillerens snitt-SG i området (negativ = svakhet). */
  sgVerdi: number;
};

/** A–K nivå-diagnose for inneværende sesong (null hvis ingen runder i år). */
export type NivaaDiagnose = {
  kategori: string; // "B"
  niva: string; // "National Elite"
  snittscore: number;
  /** Hvor langt mot neste (bedre) nivå, 0–100. null for A (toppen). */
  prosentTilNeste: number | null;
  nesteKategori: string | null; // "A"
  nesteNiva: string | null; // "World Elite"
  /** 3 svakeste SG-områder, rangert (svakest først). */
  sgGaps: SgGap[];
};

export type StatistikkHybridData = {
  /** F.eks. "Øyvind Rohjan · HCP 4,2" */
  identitetsLinje: string;
  /** A–K nivå-diagnose (inneværende sesong). null = ingen runder i år ennå. */
  nivaaDiagnose: NivaaDiagnose | null;
  kpis: KpiTile[];
  /** Runde-scores for SVG-trend (nyeste sist, maks 10) */
  trendScores: number[];
  hubs: HubShortcut[];
};

// ── KPI strip ─────────────────────────────────────────────────────────────────

/** true når delta-strengen er et signert tall (+/−) og ikke en note («fra loggede hull»). */
function erSignertDelta(delta: string): boolean {
  return /^[+\-−]/.test(delta.trim());
}

function KpiStrip({ kpis }: { kpis: KpiTile[] }) {
  return (
    <Card compact bodyStyle={{ padding: 0 }}>
      <div className="grid grid-cols-2">
        {kpis.map((k, i) => {
          const isOdd = i % 2 === 1;
          const isLastRow = i >= kpis.length - 2;
          const signert = erSignertDelta(k.delta);
          return (
            <div
              key={k.label}
              className={[
                "px-4 py-3.5",
                isOdd ? "" : "border-r border-border",
                isLastRow ? "" : "border-b border-border",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <DsKpiTile
                size="md"
                label={k.label}
                value={k.val}
                delta={signert ? k.delta : undefined}
                trend={signert ? (k.positive ? "up" : "down") : undefined}
                deltaSuffix={signert ? undefined : k.delta}
              />
            </div>
          );
        })}
      </div>
    </Card>
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
    <Link href={hub.href} className="block">
      <Card interactive compact>
        <div className="flex flex-col gap-[9px]">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon size={17} strokeWidth={1.5} aria-hidden />
          </div>
          <span className="text-[13.5px] font-semibold leading-tight text-foreground">
            {hub.label}
          </span>
          <span className="font-mono text-[9.5px] text-muted-foreground">{hub.sub}</span>
        </div>
      </Card>
    </Link>
  );
}

// ── Rot-komponent ──────────────────────────────────────────────────────────────

// ── A–K nivå-diagnose (Anders 2026-06-22) ──────────────────────────────────────

const nf1 = (n: number) =>
  n.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function NivaaDiagnoseSection({ d }: { d: NivaaDiagnose }) {
  return (
    <div className="space-y-[14px]">
      {/* SITT NIVÅ NÅ — forest-kort */}
      <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-primary to-emerald-900 p-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(209,248,67,0.18), transparent 65%)" }}
        />
        <div className="relative z-10">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-accent">
              Ditt nivå nå
            </span>
            {d.prosentTilNeste != null && d.nesteKategori && (
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-white/70">
                Til {d.nesteKategori} · {d.nesteNiva}
              </span>
            )}
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-display text-[26px] font-bold leading-none tracking-[-0.02em] text-white">
                {d.niva}
              </div>
              <div className="mt-1.5 font-mono text-[11px] text-white/70">
                Kategori {d.kategori} · snittscore {nf1(d.snittscore)}
              </div>
            </div>
            {d.prosentTilNeste != null && (
              <div className="font-mono text-[28px] font-bold leading-none text-accent tabular-nums">
                {d.prosentTilNeste}
                <span className="text-[15px]"> %</span>
              </div>
            )}
          </div>
          {d.prosentTilNeste != null && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${d.prosentTilNeste}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* LUKK DISSE TIL NESTE NIVÅ — rangerte SG-gap */}
      {d.sgGaps.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Lukk disse til neste nivå
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
              rangert · slag-gevinst
            </span>
          </div>
          <div className="space-y-2">
            {d.sgGaps.map((g, i) => {
              const gevinst = g.sgVerdi < 0 ? -g.sgVerdi : 0;
              return (
                <div
                  key={g.omrade}
                  className="flex items-center gap-3 rounded-[14px] border border-border bg-card px-[14px] py-3"
                >
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-accent font-mono text-[12px] font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold text-foreground">{g.omrade}</div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
                      SG nå {g.sgVerdi >= 0 ? "+" : "−"}
                      {nf1(Math.abs(g.sgVerdi))}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[15px] font-bold tabular-nums ${
                      gevinst > 0 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {gevinst > 0 ? `+${nf1(gevinst)}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function NivaaTomState() {
  return (
    <div className="rounded-[18px] border border-dashed border-border bg-card p-5 text-center">
      <div className="mb-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Ditt nivå nå
      </div>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Logg runder denne sesongen for å se nivået ditt (A–K) og hva som skal til for
        neste nivå.
      </p>
    </div>
  );
}

export function StatistikkHub({ data }: { data: StatistikkHybridData }) {
  return (
    <div className="golfdata-scope mx-auto w-full max-w-[460px] space-y-[14px] px-4 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">

      {/* 1. Hero */}
      <div className="px-0 pb-[0px]">
        <Eyebrow style={{ fontSize: "var(--text-11)", letterSpacing: "0.14em" }}>
          Analyse · Nivå-diagnose
        </Eyebrow>
        <h1 className="mt-1 font-display text-[22px] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
          Strokes gained <em className="font-medium italic text-primary">i dybden</em>
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {data.identitetsLinje}
        </p>
      </div>

      {/* 2. A–K nivå-diagnose (SITT NIVÅ NÅ + LUKK DISSE) */}
      {data.nivaaDiagnose ? (
        <NivaaDiagnoseSection d={data.nivaaDiagnose} />
      ) : (
        <NivaaTomState />
      )}

      {/* 3. KPI strip */}
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
