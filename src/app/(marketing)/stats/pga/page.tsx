/**
 * /stats/pga — PGA Tour Stats Playground hub
 *
 * Hub for interaktiv stats-utforskning. Hver kategori har et kort med
 * tour-snitt + topp 3 + lenke til detalj-side.
 *
 * Datakilde: PgaPlayerSeason — synket ukentlig fra DataGolf
 * (/preds/skill-ratings) via cron-agent pga-skill-ratings.
 *
 * ISR med 1 times revalidate.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  Crosshair,
  Flag,
  Gauge,
  LineChart,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import {
  getPgaTopN,
  getPgaTourAverage,
  type PgaStatCategory,
} from "@/lib/stats/pga-sync";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "PGA Tour Stats — hva er snittet egentlig?",
  description:
    "Interaktiv PGA Tour-statistikk: drive distance, fairway %, GIR, putts, scoring og Strokes Gained. Sammenlign deg selv med proffene. Gratis fra AK Golf.",
  alternates: { canonical: "https://akgolf.no/stats/pga" },
  openGraph: {
    title: "PGA Tour Stats — interaktiv playground",
    description:
      "Hva slår en proff langt? Hvor mange GIR? Sammenlign deg med toppen.",
    url: "https://akgolf.no/stats/pga",
  },
};

type TopRow = Record<string, unknown> & {
  dgPlayerId: number;
  playerName: string;
};

type KategoriConfig = {
  slug: string;
  navn: string;
  beskrivelse: string;
  ikon: React.ReactNode;
  stat: PgaStatCategory;
  format: (v: number) => string;
  enhet: string;
  /** lavere er bedre? */
  reverse?: boolean;
  /** Live på /stats/pga/[slug] eller "kommer-snart"? */
  live?: boolean;
};

const KATEGORIER: KategoriConfig[] = [
  {
    slug: "drive-distance",
    navn: "Drive Distance",
    beskrivelse: "Gjennomsnittlig drive-lengde i yards",
    ikon: <Zap className="h-5 w-5" strokeWidth={1.5} />,
    stat: "driveDist",
    format: (v) => v.toFixed(1),
    enhet: "yds",
    live: true,
  },
  {
    slug: "fairway-pct",
    navn: "Fairway-treff",
    beskrivelse: "% av tee-shots som treffer fairway",
    ikon: <Target className="h-5 w-5" strokeWidth={1.5} />,
    stat: "fairwayPct",
    format: (v) => v.toFixed(1),
    enhet: "%",
  },
  {
    slug: "gir-pct",
    navn: "Greens in Regulation",
    beskrivelse: "% av greener truffet i regulation",
    ikon: <Crosshair className="h-5 w-5" strokeWidth={1.5} />,
    stat: "girPct",
    format: (v) => v.toFixed(1),
    enhet: "%",
  },
  {
    slug: "putts-per-round",
    navn: "Putter per runde",
    beskrivelse: "Snitt antall putter per 18 hull",
    ikon: <Flag className="h-5 w-5" strokeWidth={1.5} />,
    stat: "puttsPerRound",
    format: (v) => v.toFixed(2),
    enhet: "",
    reverse: true,
  },
  {
    slug: "scoring-avg",
    navn: "Scoring Average",
    beskrivelse: "Gjennomsnittlig score per runde",
    ikon: <LineChart className="h-5 w-5" strokeWidth={1.5} />,
    stat: "avgScore",
    format: (v) => v.toFixed(2),
    enhet: "",
    reverse: true,
  },
  {
    slug: "sg-total",
    navn: "Strokes Gained Total",
    beskrivelse: "Total SG per runde vs Tour-snitt",
    ikon: <Gauge className="h-5 w-5" strokeWidth={1.5} />,
    stat: "sgTotal",
    format: (v) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)),
    enhet: "",
  },
];

const TOUR = "pga";
const YEAR = new Date().getUTCFullYear();

async function hentKategoriData() {
  return Promise.all(
    KATEGORIER.map(async (k) => {
      const [avg, topp3] = await Promise.all([
        getPgaTourAverage(k.stat, { tour: TOUR, year: YEAR }),
        getPgaTopN(k.stat, { tour: TOUR, year: YEAR, limit: 3 }),
      ]);
      return { config: k, avg, topp3: topp3 as unknown as TopRow[] };
    }),
  );
}

export default async function PgaStatsHub() {
  const data = await hentKategoriData();
  const totalSpillere = data[0]?.avg?.count ?? 0;
  const harData = totalSpillere > 0;

  return (
    <div className="bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <Link
            href="/stats"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Tilbake til AK Golf Stats
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <AthleticEyebrow tone="lime">PGA Tour · Statistikk</AthleticEyebrow>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Hva er{" "}
              <em className="font-normal italic text-primary">snittet</em>{" "}
              egentlig?
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.6] text-muted-foreground md:text-[18px]">
              Utforsk hva som skiller verdens beste fra resten. Sammenlign deg
              med proffene på drive distance, fairway-treff, GIR, putting og
              Strokes Gained. Oppdateres ukentlig fra DataGolf.
            </p>
            {harData && (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {totalSpillere} spillere · Sesong {YEAR}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* KATEGORIER */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          {!harData ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 px-8 py-16 text-center">
              <Trophy
                className="mx-auto h-10 w-10 text-muted-foreground/40"
                strokeWidth={1.25}
              />
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
                Data er på vei
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Ukentlig sync fra DataGolf starter snart. Når den er aktiv vil
                du se sesong-statistikk for alle PGA Tour-spillere her.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.map(({ config, avg, topp3 }) => (
                <KategoriKort
                  key={config.slug}
                  config={config}
                  snitt={avg.average}
                  topp3={topp3}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PLAYERHQ MERSALG */}
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <AthleticEyebrow tone="lime">
                Din egen statistikk
              </AthleticEyebrow>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Lurer du på hvordan{" "}
                <em className="font-normal italic">du</em> ligger an?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90">
                PlayerHQ regner ut din egen Strokes Gained automatisk når du
                logger runder. Følg utviklingen mot proff-benchmark over tid,
                få AI-coach-analyser, og se hvor du faktisk taper strokes.
              </p>
              <div className="mt-6">
                <Link
                  href="/playerhq"
                  className="inline-flex items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-background/90"
                >
                  Prøv PlayerHQ gratis i 30 dager
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground/70">
                Hva du får
              </p>
              <ul className="mt-3 space-y-2 text-sm text-primary-foreground/95">
                {[
                  "Din SG vs PGA Tour-snitt",
                  "Drive distance over tid",
                  "Fairway / GIR / putt-trender",
                  "AI-coach 24/7",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1 w-1 rounded-full bg-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                300 kr/mnd · Gratis under beta
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function KategoriKort({
  config,
  snitt,
  topp3,
}: {
  config: KategoriConfig;
  snitt: number | null;
  topp3: TopRow[];
}) {
  const Inner = (
    <article
      className={`group h-full rounded-xl border border-border bg-card p-5 transition-all sm:p-6 ${
        config.live ? "hover:border-primary/40 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          {config.ikon}
        </div>
        {config.live ? (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-primary">
            Live
          </span>
        ) : (
          <span className="rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
            Kommer
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
        {config.navn}
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {config.beskrivelse}
      </p>

      <div className="mt-5 border-t border-border pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Tour-snitt {YEAR}
        </p>
        <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-foreground">
          {snitt !== null ? config.format(snitt) : "—"}
          {snitt !== null && config.enhet && (
            <span className="ml-1 text-base text-muted-foreground">
              {config.enhet}
            </span>
          )}
        </p>
      </div>

      {topp3.length > 0 && (
        <ol className="mt-4 space-y-1.5">
          {topp3.map((p, idx) => {
            const value = p[config.stat] as number | null;
            return (
              <li
                key={p.dgPlayerId}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground/70">
                    {idx + 1}
                  </span>
                  <span className="truncate text-foreground/80">
                    {p.playerName}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-sm tabular-nums text-primary">
                  {value !== null ? config.format(value) : "—"}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-5 flex items-center justify-end border-t border-border pt-3">
        <span
          className={`inline-flex items-center gap-1 text-sm font-medium ${
            config.live
              ? "text-primary group-hover:gap-2"
              : "text-muted-foreground"
          } transition-all`}
        >
          {config.live ? "Utforsk →" : "Kommer snart"}
        </span>
      </div>
    </article>
  );

  if (config.live) {
    return (
      <Link href={`/stats/pga/${config.slug}`} className="block">
        {Inner}
      </Link>
    );
  }
  return <div>{Inner}</div>;
}
