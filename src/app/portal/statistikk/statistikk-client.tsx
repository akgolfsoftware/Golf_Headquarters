"use client";

/**
 * Statistikk-dashboard UI — alle visualiseringer inline SVG.
 *
 * Følger AK Golf designsystem v2 strengt:
 *  - Tokens via tailwind-utilities (bg-card, text-foreground, …)
 *  - Inter Tight (font-display) + italic på "statistikk"
 *  - JetBrains Mono (font-mono) for tabulære tall
 *  - Lucide-ikoner, stroke 1.75
 *  - Norsk bokmål, ingen emojier
 */

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Download,
  GitCompareArrows,
  LineChart as LineChartIcon,
  Rocket,
  Share2,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

export type HcpPunkt = { maaned: string; hcp: number | null };
export type SgTrendPunkt = {
  label: string;
  ott: number | null;
  app: number | null;
  arg: number | null;
  putt: number | null;
};
export type PyramidVerdi = {
  omrade: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  prosent: number;
};
export type BenchmarkRad = {
  label: string;
  verdi: number;
  enhet: string;
};
export type PersonligRekord = {
  tittel: string;
  verdi: string;
  kontekst: string;
  ikon: "trophy" | "rocket" | "star" | "zap" | "clock" | "target";
};

export type StatistikkData = {
  spiller: {
    fornavn: string;
    hcp: number | null;
    kategori: string;
    homeClub: string | null;
    avatarUrl: string | null;
    initial: string;
    dummy: boolean;
  };
  snittScore: number;
  rundeAntall: number;
  hcpTrend: HcpPunkt[];
  sgTrend: SgTrendPunkt[];
  pyramide: PyramidVerdi[];
  benchmark: BenchmarkRad[];
  rekorder: PersonligRekord[];
  streak: boolean[];
};

const PYR_COLOR: Record<PyramidVerdi["omrade"], string> = {
  FYS: "var(--color-pyr-fys)",
  TEK: "var(--color-pyr-tek)",
  SLAG: "var(--color-pyr-slag)",
  SPILL: "var(--color-pyr-spill)",
  TURN: "var(--color-pyr-turn)",
};

const REKORD_ICON = {
  trophy: Trophy,
  rocket: Rocket,
  star: Star,
  zap: Zap,
  clock: Clock,
  target: Target,
};

// --- ROOT ----------------------------------------------------------------

export function StatistikkClient({ data }: { data: StatistikkData }) {
  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-10 md:pb-0">
      <Hero data={data} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HcpTrendCard punkter={data.hcpTrend} hcp={data.spiller.hcp} />
        </div>
        <PyramideRingerCard verdier={data.pyramide} />
      </div>

      <SgTrendCard punkter={data.sgTrend} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BenchmarkCard rader={data.benchmark} />
        </div>
        <div className="lg:col-span-2">
          <StreakCard streak={data.streak} />
        </div>
      </div>

      <RekorderSeksjon rekorder={data.rekorder} />
    </div>
  );
}

// --- HERO ----------------------------------------------------------------

function Hero({ data }: { data: StatistikkData }) {
  const idag = new Date();
  const dato = idag
    .toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();
  const hcpTekst =
    data.spiller.hcp != null
      ? formatHcp(data.spiller.hcp)
      : "—";

  return (
    <header className="rounded-2xl border border-border bg-card p-4 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Min platform · {dato}
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-[40px]">
            Min{" "}
            <em className="font-normal italic text-primary">statistikk</em>
            <span className="text-muted-foreground">.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {data.spiller.fornavn}, du har snittet{" "}
            <strong className="font-mono tabular-nums text-foreground">
              {data.snittScore.toFixed(1).replace(".", ",")}
            </strong>{" "}
            på siste {data.rundeAntall} runder. HCP{" "}
            <strong className="font-mono tabular-nums text-foreground">
              {hcpTekst}
            </strong>{" "}
            · kategori {data.spiller.kategori}
            {data.spiller.homeClub ? ` · ${data.spiller.homeClub}` : ""}.
          </p>
          {data.spiller.dummy && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Demo-data · spiller har ikke nok historikk
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <HeroAction icon={Download} label="Eksporter PDF" disabled title="Eksport kommer" />
          <HeroAction icon={Share2} label="Del" disabled title="Deling kommer" />
          <HeroAction icon={GitCompareArrows} label="Sammenlign" href="/portal/statistikk/sammenlign" />
          <Link
            href="/portal"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Tilbake til hjem
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroAction({
  icon: Icon,
  label,
  href,
  disabled,
  title,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  href?: string;
  disabled?: boolean;
  title?: string;
}) {
  const baseClass =
    "inline-flex h-11 items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary";

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? title : undefined}
      className={`${baseClass} disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-card`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}

// --- HCP-TREND -----------------------------------------------------------

function HcpTrendCard({
  punkter,
  hcp,
}: {
  punkter: HcpPunkt[];
  hcp: number | null;
}) {
  const path = useMemo(() => byggHcpPath(punkter), [punkter]);
  const forste = punkter.find((p) => p.hcp != null)?.hcp ?? null;
  const siste = [...punkter].reverse().find((p) => p.hcp != null)?.hcp ?? null;
  const endring =
    forste != null && siste != null ? siste - forste : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
              <LineChartIcon
                className="h-3.5 w-3.5 text-foreground"
                strokeWidth={1.75}
              />
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              HCP-trend · siste 12 mnd
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {hcp != null ? formatHcp(hcp) : "—"}{" "}
            <span className="font-normal italic text-muted-foreground">
              i dag
            </span>
          </h2>
          {endring != null && (
            <p className="mt-1 text-sm text-muted-foreground">
              {endring < 0 ? "Forbedret " : "Endret "}
              <strong className="font-mono tabular-nums text-foreground">
                {Math.abs(endring).toFixed(1).replace(".", ",")}
              </strong>{" "}
              slag siste året.
            </p>
          )}
        </div>
        <span className="rounded-full bg-accent px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent-foreground">
          Pro
        </span>
      </header>

      <div className="mt-6">
        <svg
          viewBox="0 0 600 200"
          className="h-48 w-full md:h-64"
          preserveAspectRatio="none"
          aria-label="HCP-trend siste 12 måneder"
          role="img"
        >
          {/* Bakgrunns-grid */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              x2="600"
              y1={i * 50}
              y2={i * 50}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          ))}
          {/* Linje */}
          <path
            d={path.linje}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Areal */}
          <path d={path.areal} fill="hsl(var(--primary) / 0.08)" />
          {/* Punkter */}
          {path.punkter.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="hsl(var(--card))"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          {punkter.map((p, i) => (
            <span key={i}>{p.maaned}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function byggHcpPath(punkter: HcpPunkt[]) {
  const W = 600;
  const H = 200;
  const padding = 16;
  const verdier = punkter.map((p) => p.hcp).filter((v): v is number => v != null);
  if (verdier.length === 0) {
    return { linje: "", areal: "", punkter: [] as { x: number; y: number }[] };
  }
  const min = Math.min(...verdier) - 0.5;
  const max = Math.max(...verdier) + 0.5;
  const range = max - min || 1;
  const punktKoord = punkter.map((p, i) => {
    const x = (i / Math.max(1, punkter.length - 1)) * W;
    const v = p.hcp ?? (min + max) / 2;
    const y = H - padding - ((v - min) / range) * (H - padding * 2);
    return { x, y };
  });
  const linje = punktKoord
    .map((k, i) => `${i === 0 ? "M" : "L"} ${k.x.toFixed(1)} ${k.y.toFixed(1)}`)
    .join(" ");
  const areal = `${linje} L ${W} ${H} L 0 ${H} Z`;
  return { linje, areal, punkter: punktKoord };
}

function formatHcp(hcp: number): string {
  // Positivt = handicap som tall. Negativt = plus-handicap (+3,5).
  if (hcp <= 0) {
    return `+${Math.abs(hcp).toFixed(1).replace(".", ",")}`;
  }
  return hcp.toFixed(1).replace(".", ",");
}

// --- PYRAMIDE-RINGER -----------------------------------------------------

function PyramideRingerCard({ verdier }: { verdier: PyramidVerdi[] }) {
  const sum = verdier.reduce((s, v) => s + v.prosent, 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-8">
      <header className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
          <Target className="h-3.5 w-3.5 text-foreground" strokeWidth={1.75} />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Pyramide-balanse · siste uke
        </span>
      </header>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
        Snitt{" "}
        <em className="font-normal italic text-primary">
          {Math.round(sum / verdier.length)}%
        </em>
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hvor jevnt du trener på tvers av disipliner.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-2">
        {verdier.map((v) => (
          <PyramideRing key={v.omrade} omrade={v.omrade} prosent={v.prosent} />
        ))}
      </div>
    </article>
  );
}

function PyramideRing({
  omrade,
  prosent,
}: {
  omrade: PyramidVerdi["omrade"];
  prosent: number;
}) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(100, prosent) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="relative h-14 w-14">
        <svg
          viewBox="0 0 36 36"
          className="h-full w-full -rotate-90"
          aria-hidden
        >
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="4"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={PYR_COLOR[omrade]}
            strokeWidth="4"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-mono text-[11px] font-semibold tabular-nums text-foreground">
          {prosent}%
        </span>
      </span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {omrade}
      </span>
    </div>
  );
}

// --- SG-TREND ------------------------------------------------------------

const SG_KATEGORIER = [
  { key: "ott", navn: "Off-the-tee", farge: "var(--color-pyr-fys)" },
  { key: "app", navn: "Approach", farge: "var(--color-pyr-tek)" },
  { key: "arg", navn: "Around-green", farge: "var(--color-pyr-spill)" },
  { key: "putt", navn: "Putting", farge: "var(--color-pyr-slag)" },
] as const;

function SgTrendCard({ punkter }: { punkter: SgTrendPunkt[] }) {
  const paths = useMemo(() => byggSgPaths(punkter), [punkter]);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
              <Star
                className="h-3.5 w-3.5 text-foreground"
                strokeWidth={1.75}
              />
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              SG-trend · siste 90 dager
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Strokes Gained pr.{" "}
            <em className="font-normal italic text-primary">disipplin</em>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SG_KATEGORIER.map((k) => (
            <span
              key={k.key}
              className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground"
            >
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ background: k.farge }}
              />
              {k.navn}
            </span>
          ))}
        </div>
      </header>

      <div className="mt-6 -mx-4 overflow-x-auto px-4 md:mx-0 md:overflow-x-visible md:px-0">
        <svg
          viewBox="0 0 600 220"
          className="h-48 w-full min-w-[480px] md:h-60 md:min-w-0"
          preserveAspectRatio="none"
          aria-label="SG-trend per disipplin"
          role="img"
        >
          {/* Null-linje */}
          <line
            x1="0"
            x2="600"
            y1="110"
            y2="110"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
          {/* Grid */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              x2="600"
              y1={i * 55}
              y2={i * 55}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          ))}
          {SG_KATEGORIER.map((k) => (
            <path
              key={k.key}
              d={paths[k.key]}
              fill="none"
              stroke={k.farge}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          {punkter.map((p, i) => (
            <span key={i}>{p.label}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function byggSgPaths(punkter: SgTrendPunkt[]) {
  const W = 600;
  const H = 220;
  const midY = H / 2;
  const skala = 180; // 1.0 SG = 180px fra senter (gir ±0.5 god plass)

  const lagPath = (felt: keyof Omit<SgTrendPunkt, "label">) => {
    return punkter
      .map((p, i) => {
        const x = (i / Math.max(1, punkter.length - 1)) * W;
        const v = p[felt];
        const y = v == null ? midY : midY - v * skala;
        const yClamp = Math.max(8, Math.min(H - 8, y));
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${yClamp.toFixed(1)}`;
      })
      .join(" ");
  };

  return {
    ott: lagPath("ott"),
    app: lagPath("app"),
    arg: lagPath("arg"),
    putt: lagPath("putt"),
  };
}

// --- BENCHMARK -----------------------------------------------------------

function BenchmarkCard({ rader }: { rader: BenchmarkRad[] }) {
  const maxAbs = Math.max(0.5, ...rader.map((r) => Math.abs(r.verdi)));

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-8">
      <header className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
          <GitCompareArrows
            className="h-3.5 w-3.5 text-foreground"
            strokeWidth={1.75}
          />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Benchmark · vs kategori A1
        </span>
      </header>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        Hvor du{" "}
        <em className="font-normal italic text-primary">slår</em> snittet
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sammenligning mot DataGolf-snitt for spillere i kategori A1.
      </p>

      <ul className="mt-6 space-y-4">
        {rader.map((rad) => (
          <BenchmarkBar key={rad.label} rad={rad} maxAbs={maxAbs} />
        ))}
      </ul>
    </article>
  );
}

function BenchmarkBar({
  rad,
  maxAbs,
}: {
  rad: BenchmarkRad;
  maxAbs: number;
}) {
  const isPositive = rad.verdi >= 0;
  const bredde = (Math.abs(rad.verdi) / maxAbs) * 50; // % av halvparten

  return (
    <li className="grid grid-cols-[100px_1fr_56px] items-center gap-2 sm:grid-cols-[140px_1fr_72px] sm:gap-4">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground">
        {rad.label}
      </span>
      <div className="relative h-6 rounded-md bg-secondary">
        {/* Senter-linje */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/2 w-px bg-border"
        />
        <span
          className="absolute top-1 bottom-1 rounded-sm"
          style={{
            left: isPositive ? "50%" : `${50 - bredde}%`,
            width: `${bredde}%`,
            background: isPositive
              ? "hsl(var(--primary))"
              : "hsl(var(--destructive))",
          }}
        />
      </div>
      <span
        className="text-right font-mono text-sm font-semibold tabular-nums"
        style={{
          color: isPositive
            ? "hsl(var(--primary))"
            : "hsl(var(--destructive))",
        }}
      >
        {isPositive ? "+" : ""}
        {rad.verdi.toFixed(2).replace(".", ",")}
      </span>
    </li>
  );
}

// --- STREAK --------------------------------------------------------------

function StreakCard({ streak }: { streak: boolean[] }) {
  const aktiv = beregnAktivStreak(streak);
  const lengsteStreak = 23; // Fra dummy/spillerprofil.

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-8">
      <header className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-sm bg-secondary">
          <Zap className="h-3.5 w-3.5 text-foreground" strokeWidth={1.75} />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Treningsstreak
        </span>
      </header>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        <em className="font-normal italic text-primary">{aktiv}</em>{" "}
        {aktiv === 1 ? "dag" : "dager"} på rad
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Lengste streak:{" "}
        <strong className="font-mono tabular-nums text-foreground">
          {lengsteStreak} dager
        </strong>{" "}
        (mai 2026).
      </p>

      <div className="mt-6 grid grid-cols-7 gap-1.5">
        {streak.map((aktiv, i) => {
          const erSiste = i === streak.length - 1;
          return (
            <span
              key={i}
              className={`grid h-9 place-items-center rounded-md font-mono text-[9px] font-semibold uppercase tracking-wider ${
                erSiste ? "outline outline-2 outline-offset-2 outline-primary" : ""
              }`}
              style={{
                background: aktiv
                  ? "hsl(var(--primary))"
                  : "hsl(var(--secondary))",
                color: aktiv
                  ? "hsl(var(--primary-foreground))"
                  : "hsl(var(--muted-foreground))",
              }}
              aria-label={aktiv ? "Trent" : "Ikke trent"}
            >
              {streak.length - i}
            </span>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        Siste 14 dager · ramme = i dag
      </p>
    </article>
  );
}

function beregnAktivStreak(streak: boolean[]): number {
  let antall = 0;
  for (let i = streak.length - 1; i >= 0; i--) {
    if (streak[i]) antall++;
    else break;
  }
  return antall;
}

// --- REKORDER ------------------------------------------------------------

function RekorderSeksjon({ rekorder }: { rekorder: PersonligRekord[] }) {
  return (
    <section>
      <header className="mb-4 flex items-end justify-between">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Personlige rekorder
          </span>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Dine{" "}
            <em className="font-normal italic text-primary">milepæler</em>
          </h2>
        </div>
        <Link
          href="/portal/utfordringer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Alle utfordringer
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rekorder.map((r) => (
          <RekordKort key={r.tittel} rekord={r} />
        ))}
      </div>
    </section>
  );
}

function RekordKort({ rekord }: { rekord: PersonligRekord }) {
  const Ikon = REKORD_ICON[rekord.ikon];

  return (
    <article className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
        <Ikon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {rekord.tittel}
        </p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
          {rekord.verdi}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {rekord.kontekst}
        </p>
      </div>
    </article>
  );
}
