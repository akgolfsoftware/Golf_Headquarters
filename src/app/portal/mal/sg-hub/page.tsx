/**
 * PlayerHQ · Mål · SG-Hub
 *
 * Executive overhaul (AK Golf v2): hero med min SG-pipeline, 4 store
 * discipline-kort (OTT/APP/ARG/PUTT), topp 3 prioriteringer for neste turnering
 * og siste TrackMan-økt. Per-kølle grid og verktøy beholdes nederst.
 */
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Circle,
  Crosshair,
  Lightbulb,
  MapPin,
  Package,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { extractClubs } from "@/lib/sg-hub/extract-shots";
import type { InsightCategory } from "@/generated/prisma/client";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";

const CLUB_ORDER = [
  "Driver",
  "1W",
  "3W",
  "5W",
  "7W",
  "1i",
  "2i",
  "3i",
  "4i",
  "5i",
  "6i",
  "7i",
  "8i",
  "9i",
  "PW",
  "AW",
  "GW",
  "SW",
  "LW",
  "PT",
];

function sortClubs(clubs: string[]): string[] {
  return [...clubs].sort((a, b) => {
    const ai = CLUB_ORDER.indexOf(a);
    const bi = CLUB_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

const CATEGORY_LABELS: Record<InsightCategory, string> = {
  DISTANCE_GAPPING: "Distansegap",
  CONSISTENCY_LEAK: "Konsistens",
  TRAINING_GAP: "Treningsgap",
  D_PLANE_DRIFT: "D-Plane drift",
  STRIKE_QUALITY: "Kontaktkvalitet",
  FATIGUE_PATTERN: "Fatigue",
  EQUIPMENT_FIT: "Utstyrstilpasning",
  TEMPO_VARIANCE: "Tempo",
  PROGRESSION_TREND: "Progresjon",
  SAME_DISTANCE_OPPORTUNITY: "Same-distance",
};

type DisciplineKey = "ott" | "app" | "arg" | "putt";

type DisciplineCard = {
  key: DisciplineKey;
  slug: string;
  label: string;
  italic: string;
  benchmark: number;
};

const DISCIPLINES: DisciplineCard[] = [
  { key: "ott", slug: "sg-tee", label: "Off-the-tee", italic: "tee", benchmark: 0 },
  { key: "app", slug: "sg-approach", label: "Approach", italic: "approach", benchmark: 0 },
  { key: "arg", slug: "sg-around-green", label: "Around-green", italic: "kort", benchmark: 0 },
  { key: "putt", slug: "sg-putting", label: "Putting", italic: "putt", benchmark: 0 },
];

type FeatureCard = {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  fase: string;
};

const LIVE_FEATURES: FeatureCard[] = [
  {
    href: "/portal/mal/sg-hub/yardage",
    icon: BarChart2,
    title: "Stock Yardage Chart",
    description:
      "Auto-generert yardage-kort med carry, 3/4, soft og PDF-eksport.",
    fase: "Fase 3",
  },
  {
    href: "/portal/mal/sg-hub/conditions",
    icon: Wind,
    title: "Værjustert distanse",
    description: "Slidere for temp, vind og høyde — live-oppdatert per kølle.",
    fase: "Fase 3",
  },
  {
    href: "/portal/mal/sg-hub/strategy",
    icon: MapPin,
    title: "Same-Distance strategi",
    description:
      "Beste kølle for valgt mål-distanse rangert etter expected SG.",
    fase: "Fase 3",
  },
  {
    href: "/portal/mal/sg-hub/best-vs-now",
    icon: Crosshair,
    title: "Best vs Today",
    description:
      "Sammenlign dagens økt med din beste økt noensinne — delta per metrikk.",
    fase: "Fase 4",
  },
  {
    href: "/portal/mal/sg-hub/equipment",
    icon: Package,
    title: "Equipment Fit",
    description:
      "Per-kølle helsesjekk — launch, spin og smash mot optimale targets.",
    fase: "Fase 5",
  },
];

export default async function SgHubPage() {
  const user = await requirePortalUser();
  const { sgHubMode } = lesPreferences(user);
  const advanced = sgHubMode === "advanced";

  const naa = new Date();
  const ninetiDagSiden = new Date(naa.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [sessions, sisteOkt, runder, insightCount, insights] = await Promise.all([
    prisma.trackManSession.findMany({
      where: { userId: user.id },
      select: { rawJson: true },
    }),
    prisma.trackManSession.findFirst({
      where: { userId: user.id },
      orderBy: { recordedAt: "desc" },
      select: {
        id: true,
        recordedAt: true,
        shotCount: true,
        environment: true,
        rawJson: true,
      },
    }),
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: ninetiDagSiden } },
      orderBy: { playedAt: "desc" },
    }),
    prisma.sgInsight.count({
      where: { userId: user.id, resolvedAt: null, acknowledgedAt: null },
    }),
    prisma.sgInsight.findMany({
      where: { userId: user.id, resolvedAt: null, acknowledgedAt: null },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 3,
      select: {
        id: true,
        category: true,
        severity: true,
        title: true,
        body: true,
        createdAt: true,
      },
    }),
  ]);

  const sg = aggregateSg(runder);

  // Discipline-deltaer mot benchmark (= 0 for SG)
  const disciplines = DISCIPLINES.map((d) => {
    const verdi =
      d.key === "ott"
        ? sg.ott
        : d.key === "app"
          ? sg.app
          : d.key === "arg"
            ? sg.arg
            : sg.putt;
    return {
      ...d,
      verdi,
      delta: verdi == null ? null : verdi - d.benchmark,
      mini: byggMiniTrend(
        runder.map((r) => ({
          playedAt: r.playedAt,
          sg:
            d.key === "ott"
              ? r.sgOtt
              : d.key === "app"
                ? r.sgApp
                : d.key === "arg"
                  ? r.sgArg
                  : r.sgPutt,
        })),
      ),
    };
  });

  // Prioriter etter mest negativ SG
  const prioriteringer = [...disciplines]
    .filter((d) => d.verdi != null)
    .sort((a, b) => (a.verdi ?? 0) - (b.verdi ?? 0))
    .slice(0, 3);

  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const club of extractClubs(s.rawJson)) {
      clubSet.add(club);
    }
  }
  const clubs = sortClubs([...clubSet]);

  const sisteOktDato = sisteOkt
    ? sisteOkt.recordedAt.toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-10 md:pb-0">
      <PageHeader
        eyebrow="PlayerHQ · /portal/mal/sg-hub"
        titleLead="Min"
        titleItalic="SG-pipeline"
        sub={
          sg.rundeAntall === 0
            ? "Logg din første runde for å låse opp SG-pipelinen."
            : `Snitt siste ${sg.rundeAntall} runder · ${runder.length} totalt`
        }
      />

      {/* HERO — SG total + tone-graf */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-primary bg-primary p-4 text-primary-foreground md:p-8">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] opacity-80">
              SG Total · 90 d
            </span>
            <span className="rounded-full bg-accent/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-accent">
              {sessions.length} TrackMan-økter
            </span>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-5xl font-semibold tabular-nums leading-none md:text-6xl">
              {sg.total == null ? "—" : formatSg(sg.total)}
            </span>
            {sg.total != null && (
              <span className="mb-2 font-mono text-sm opacity-90">
                {sg.total >= 0 ? "↑ over snitt A1" : "↓ under snitt A1"}
              </span>
            )}
          </div>
          <p className="mt-4 max-w-md text-sm opacity-90">
            SG-pipelinen viser hvor du tjener eller taper strokes mot benchmark.
            Bygd på {runder.length}{" "}
            {runder.length === 1 ? "runde" : "runder"} siste 90 dager.
          </p>
          <div className="mt-6 h-16 w-full">
            <BigTrend
              values={runder
                .slice()
                .reverse()
                .map((r) => r.sgTotal)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <KpiTile
            label="TrackMan-økter"
            value={String(sessions.length)}
            sub="totalt"
          />
          <KpiTile
            label="Aktive innsikter"
            value={String(insightCount)}
            sub="ikke kvittert"
          />
          <KpiTile
            label="Snitt-score"
            value={
              sg.snittScore == null
                ? "—"
                : sg.snittScore.toFixed(1).replace(".", ",")
            }
            sub={`${sg.rundeAntall} runder 90 d`}
          />
          <KpiTile
            label="Benchmark"
            value="PGA Tour"
            sub="kategori A1"
          />
        </div>
      </section>

      {/* 4 STORE DISCIPLINE-KORT */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            <em className="font-normal text-primary md:italic">
              Per disipplin
            </em>{" "}
            · klikk for drill-down
          </h2>
          {sg.rundeAntall === 0 && (
            <span className="font-mono text-[10px] text-muted-foreground">
              dummy-tall vises til du har 3+ runder
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {disciplines.map((d) => (
            <DisciplineLargeCard key={d.key} d={d} />
          ))}
        </div>
      </section>

      {/* Topp 3 prioriteringer */}
      <section className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-4 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.75} className="text-primary" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
            Topp 3 prioriteringer for neste turnering
          </span>
        </div>
        {prioriteringer.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Vi trenger flere runder for å rangere prioriteringer. Logg minst
            3 runder.
          </p>
        ) : (
          <ol className="space-y-3">
            {prioriteringer.map((p, idx) => (
              <li
                key={p.key}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="font-display text-sm font-semibold">
                    {p.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    Snitt {p.verdi == null ? "—" : formatSg(p.verdi)} ·{" "}
                    {p.delta != null && p.delta < -0.1
                      ? "klar svakhet"
                      : p.delta != null && p.delta < 0
                        ? "kan forbedres"
                        : "vedlikehold"}
                  </div>
                </div>
                <Link
                  href={`/portal/statistikk/${p.slug}`}
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-primary hover:underline"
                >
                  Åpne drill-down
                  <ArrowRight size={11} strokeWidth={1.75} />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Siste TrackMan-økt */}
      <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Activity size={14} strokeWidth={1.75} className="text-muted-foreground" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Sist TrackMan-økt
          </span>
        </div>
        {sisteOkt ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">
                {sisteOktDato}
              </h3>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {sisteOkt.shotCount} slag · {sisteOkt.environment ?? "ukjent miljø"}
              </p>
            </div>
            <Link
              href="/portal/mal/trackman"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90"
            >
              Åpne TrackMan-hub
              <ArrowUpRight size={12} strokeWidth={1.75} />
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ingen TrackMan-økter ennå.{" "}
            <Link
              href="/portal/mal/trackman"
              className="text-primary underline-offset-2 hover:underline"
            >
              Importer din første økt
            </Link>{" "}
            for å låse opp insights og per-kølle analyse.
          </p>
        )}
      </section>

      {/* Insights */}
      {insights.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb size={14} strokeWidth={1.75} className="text-muted-foreground" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Aktive innsikter ({insightCount})
            </span>
          </div>
          <ul className="space-y-3">
            {insights.map((ins) => (
              <li
                key={ins.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
              >
                <SeverityIcon severity={ins.severity} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold">{ins.title}</h4>
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                      {CATEGORY_LABELS[ins.category]}
                    </span>
                  </div>
                  {(advanced || ins.severity >= 3) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ins.body}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Per-kølle grid */}
      <section>
        <h3 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Per-kølle analyse
        </h3>
        {clubs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ingen TrackMan-data ennå.{" "}
              <Link
                href="/portal/mal/trackman"
                className="text-primary underline-offset-2 hover:underline"
              >
                Importer din første økt
              </Link>{" "}
              for å aktivere per-kølle analyse.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {clubs.map((club) => (
              <Link
                key={club}
                href={`/portal/mal/sg-hub/${encodeURIComponent(club)}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-card"
              >
                <Circle
                  className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary"
                  strokeWidth={1.75}
                />
                <span className="font-mono text-sm font-semibold">{club}</span>
                <ArrowRight
                  className="h-3 w-3 text-muted-foreground/40 transition-colors group-hover:text-primary"
                  strokeWidth={1.75}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Verktøy */}
      <section>
        <h3 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Verktøy
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_FEATURES.map((f) => (
            <FeatureLiveCard key={f.href} {...f} advanced={advanced} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─────────── Sub-komponenter ─────────── */

function DisciplineLargeCard({
  d,
}: {
  d: {
    slug: string;
    label: string;
    italic: string;
    verdi: number | null;
    delta: number | null;
    mini: number[];
  };
}) {
  const positiv = d.delta != null && d.delta >= 0;
  return (
    <Link
      href={`/portal/statistikk/${d.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            SG · {d.label}
          </span>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-none tabular-nums">
            {d.verdi == null ? "—" : formatSg(d.verdi)}
          </h3>
        </div>
        <ArrowUpRight
          size={14}
          strokeWidth={1.75}
          className="text-muted-foreground transition-colors group-hover:text-primary"
        />
      </div>
      <div className="h-10 w-full">
        <BigTrend values={d.mini} small />
      </div>
      <span
        className={`font-mono text-[11px] font-semibold ${
          d.delta == null
            ? "text-muted-foreground"
            : positiv
              ? "text-primary"
              : "text-destructive"
        }`}
      >
        {d.delta == null
          ? "Ingen data"
          : `${positiv ? "↑ +" : "↓ "}${Math.abs(d.delta)
              .toFixed(2)
              .replace(".", ",")} vs benchmark`}
      </span>
    </Link>
  );
}

function KpiTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">
        {value}
      </div>
      <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
        {sub}
      </span>
    </div>
  );
}

function BigTrend({
  values,
  small = false,
}: {
  values: (number | null)[];
  small?: boolean;
}) {
  const filled = values.map((v) => (v == null ? 0 : v));
  if (filled.length === 0) {
    return (
      <div className="grid h-full w-full place-items-center font-mono text-[10px] text-muted-foreground">
        —
      </div>
    );
  }
  const yMin = Math.min(-0.5, Math.min(...filled));
  const yMax = Math.max(0.5, Math.max(...filled));
  const xy = filled.map((v, i) => ({
    x: (i / Math.max(filled.length - 1, 1)) * 100,
    y: ((yMax - v) / (yMax - yMin)) * 100,
  }));
  let path = `M ${xy[0].x} ${xy[0].y}`;
  for (let i = 1; i < xy.length; i++) {
    const p0 = xy[i - 1];
    const p1 = xy[i];
    const midX = (p0.x + p1.x) / 2;
    path += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      <path
        d={path}
        fill="none"
        stroke={small ? "hsl(var(--primary))" : "hsl(var(--accent))"}
        strokeWidth={small ? "2" : "1.8"}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function byggMiniTrend(
  rounds: Array<{ playedAt: Date; sg: number | null }>,
): number[] {
  const sorted = [...rounds].sort(
    (a, b) => a.playedAt.getTime() - b.playedAt.getTime(),
  );
  return sorted
    .map((r) => r.sg)
    .filter((v): v is number => typeof v === "number");
}

function SeverityIcon({ severity }: { severity: number }) {
  if (severity <= 1) {
    return (
      <Sparkles
        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
        strokeWidth={1.75}
      />
    );
  }
  if (severity >= 4) {
    return (
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
        strokeWidth={1.75}
      />
    );
  }
  return (
    <Lightbulb
      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
      strokeWidth={1.75}
    />
  );
}

function FeatureLiveCard({
  href,
  icon: Icon,
  title,
  description,
  fase,
  advanced,
}: FeatureCard & { advanced: boolean }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Icon className="mt-0.5 h-4 w-4 text-primary" strokeWidth={1.75} />
        <span className="rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-accent-foreground">
          {fase}
        </span>
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
      {advanced && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      <div className="mt-3 flex items-center gap-1 text-xs text-primary">
        <span>Åpne</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
        <Zap className="ml-auto h-3 w-3 text-accent" strokeWidth={1.75} />
      </div>
    </Link>
  );
}
