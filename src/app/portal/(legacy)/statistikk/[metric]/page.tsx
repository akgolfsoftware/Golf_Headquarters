/**
 * PlayerHQ · Statistikk · Drill-down per disipplin
 *
 * Dynamisk rute som åpner detalj-visning for én disipplin. Dekker:
 *   - 5 pyramide-disipliner: fys, tek, slag, spill, turn
 *   - 4 SG-disipliner: sg-tee (ott), sg-approach (app), sg-around-green (arg), sg-putting (putt)
 *   - Legacy-aliaser: putts, sg-ott, sg-app, sg-arg, sg-putt
 *
 * Innhold:
 *   - Hero med disiplinkort + delta + trend
 *   - 90-dagers trendgraf
 *   - Antall økter + total tid
 *   - Topp 5 drills med mest tid brukt
 *   - SG-trend hvis SG-disipplin
 *   - Sammenligning vs kategori-snitt
 *   - "Be coach om mer fokus her"-CTA
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Clock,
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

const PERIODS = ["7 d", "30 d", "90 d", "Sesong", "Alle"];

type Kind = "pyramid" | "sg";

type MetricInfo = {
  slug: string;
  kind: Kind;
  /** Pyramide-enum hvis kind=pyramid. */
  pyramid?: PyramidArea;
  /** SG-felt hvis kind=sg. */
  sgField?: "sgOtt" | "sgApp" | "sgArg" | "sgPutt";
  title: string;
  italic: string;
  /** Norsk label til breadcrumb og sub. */
  unit: string;
  /** Plot-akse min/maks. */
  yMin: number;
  yMax: number;
  /** Format-funksjon for verdier. */
  format: (n: number) => string;
  /** Benchmark-snitt for kategori A1 (proxy). */
  benchmark: number;
};

const METRICS: Record<string, MetricInfo> = {
  // Pyramide
  fys: {
    slug: "fys",
    kind: "pyramid",
    pyramid: "FYS",
    title: "Fysisk",
    italic: "trening",
    unit: "Treningstimer · siste 30 d",
    yMin: 0,
    yMax: 25,
    format: (n) => `${n.toFixed(1).replace(".", ",")} t`,
    benchmark: 12,
  },
  tek: {
    slug: "tek",
    kind: "pyramid",
    pyramid: "TEK",
    title: "Teknisk",
    italic: "kvalitet",
    unit: "Treningstimer · siste 30 d",
    yMin: 0,
    yMax: 40,
    format: (n) => `${n.toFixed(1).replace(".", ",")} t`,
    benchmark: 22,
  },
  slag: {
    slug: "slag",
    kind: "pyramid",
    pyramid: "SLAG",
    title: "Slag",
    italic: "trening",
    unit: "Treningstimer · siste 30 d",
    yMin: 0,
    yMax: 40,
    format: (n) => `${n.toFixed(1).replace(".", ",")} t`,
    benchmark: 18,
  },
  spill: {
    slug: "spill",
    kind: "pyramid",
    pyramid: "SPILL",
    title: "Spill",
    italic: "trening",
    unit: "Treningstimer · siste 30 d",
    yMin: 0,
    yMax: 25,
    format: (n) => `${n.toFixed(1).replace(".", ",")} t`,
    benchmark: 14,
  },
  turn: {
    slug: "turn",
    kind: "pyramid",
    pyramid: "TURN",
    title: "Turnering",
    italic: "spill",
    unit: "Treningstimer · siste 30 d",
    yMin: 0,
    yMax: 25,
    format: (n) => `${n.toFixed(1).replace(".", ",")} t`,
    benchmark: 8,
  },
  // SG-disipliner
  "sg-tee": {
    slug: "sg-tee",
    kind: "sg",
    sgField: "sgOtt",
    title: "SG",
    italic: "Off-the-tee",
    unit: "SG/runde · snitt 30 d",
    yMin: -1,
    yMax: 2,
    format: (n) => formatSg(n),
    benchmark: 0,
  },
  "sg-approach": {
    slug: "sg-approach",
    kind: "sg",
    sgField: "sgApp",
    title: "SG",
    italic: "Approach",
    unit: "SG/runde · snitt 30 d",
    yMin: -1,
    yMax: 2,
    format: (n) => formatSg(n),
    benchmark: 0,
  },
  "sg-around-green": {
    slug: "sg-around-green",
    kind: "sg",
    sgField: "sgArg",
    title: "SG",
    italic: "Around-green",
    unit: "SG/runde · snitt 30 d",
    yMin: -1,
    yMax: 2,
    format: (n) => formatSg(n),
    benchmark: 0,
  },
  "sg-putting": {
    slug: "sg-putting",
    kind: "sg",
    sgField: "sgPutt",
    title: "SG",
    italic: "Putting",
    unit: "SG/runde · snitt 30 d",
    yMin: -1,
    yMax: 2,
    format: (n) => formatSg(n),
    benchmark: 0,
  },
};

// Legacy-aliaser
const ALIASES: Record<string, string> = {
  putts: "sg-putting",
  "sg-ott": "sg-tee",
  "sg-app": "sg-approach",
  "sg-arg": "sg-around-green",
  "sg-putt": "sg-putting",
};

function resolveMetric(slug: string): MetricInfo | null {
  const resolved = ALIASES[slug] ?? slug;
  return METRICS[resolved] ?? null;
}

function formatSg(v: number): string {
  const formatted = v.toFixed(2).replace(".", ",");
  return v > 0 ? `+${formatted}` : formatted;
}

export default async function MetricDrillDownPage({
  params,
}: {
  params: Promise<{ metric: string }>;
}) {
  const user = await requirePortalUser();
  const { metric } = await params;
  const info = resolveMetric(metric);
  if (!info) notFound();

  const naa = new Date();
  const naaMs = naa.getTime();
  const ninetyDaysAgo = new Date(naaMs - 90 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(naaMs - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(naaMs - 60 * 24 * 60 * 60 * 1000);

  // Hent data parallelt — felles oppslag
  const [drills, sessions, recentRounds] = await Promise.all([
    info.kind === "pyramid"
      ? prisma.sessionDrill.findMany({
          where: {
            session: {
              plan: { userId: user.id },
              scheduledAt: { gte: ninetyDaysAgo },
              status: "COMPLETED",
              pyramidArea: info.pyramid!,
            },
          },
          select: {
            sets: true,
            reps: true,
            notes: true,
            exercise: {
              select: {
                name: true,
                durationMin: true,
              },
            },
            session: {
              select: { id: true, durationMin: true, scheduledAt: true },
            },
          },
        })
      : Promise.resolve([]),
    info.kind === "pyramid"
      ? prisma.trainingPlanSession.findMany({
          where: {
            plan: { userId: user.id },
            scheduledAt: { gte: ninetyDaysAgo },
            status: "COMPLETED",
            pyramidArea: info.pyramid!,
          },
          select: {
            id: true,
            durationMin: true,
            scheduledAt: true,
          },
          orderBy: { scheduledAt: "asc" },
        })
      : Promise.resolve([]),
    info.kind === "sg"
      ? prisma.round.findMany({
          where: {
            userId: user.id,
            playedAt: { gte: ninetyDaysAgo },
          },
          select: {
            id: true,
            playedAt: true,
            [info.sgField!]: true,
          },
          orderBy: { playedAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  // Trendgraf (90 d, 30 punkter)
  const trendpunkter = info.kind === "pyramid"
    ? byggPyramidTrend(sessions, ninetyDaysAgo, naaMs)
    : byggSgTrend(
        recentRounds as Array<Record<string, unknown> & { playedAt: Date }>,
        info.sgField!,
        ninetyDaysAgo,
        naaMs,
      );

  // Hovedtall — siste 30 d snitt
  const verdi30d = info.kind === "pyramid"
    ? summer(sessions.filter((s) => s.scheduledAt >= thirtyDaysAgo).map((s) => s.durationMin)) / 60
    : snittSg(
        recentRounds as Array<{ playedAt: Date } & Record<string, unknown>>,
        info.sgField!,
        thirtyDaysAgo,
      );

  // Forrige 30d (30-60 d siden)
  const forrige30d = info.kind === "pyramid"
    ? summer(
        sessions
          .filter((s) => s.scheduledAt >= sixtyDaysAgo && s.scheduledAt < thirtyDaysAgo)
          .map((s) => s.durationMin),
      ) / 60
    : snittSg(
        recentRounds as Array<{ playedAt: Date } & Record<string, unknown>>,
        info.sgField!,
        sixtyDaysAgo,
        thirtyDaysAgo,
      );

  const delta = verdi30d - forrige30d;
  const harData = info.kind === "pyramid"
    ? sessions.length > 0
    : (recentRounds as unknown[]).length > 0;

  // Antall økter + total tid (pyramid)
  const okterTotalt = sessions.length;
  const totalMin = summer(sessions.map((s) => s.durationMin));

  // Topp 5 drills med mest tid brukt
  const drillTopp = harData && info.kind === "pyramid"
    ? aggregerTopDrills(drills)
    : [];

  // SG best
  const sgBest = info.kind === "sg" && harData
    ? (recentRounds as Array<{ playedAt: Date } & Record<string, unknown>>)
        .filter((r) => typeof r[info.sgField!] === "number")
        .reduce<{ verdi: number; dato: Date } | null>((best, r) => {
          const v = r[info.sgField!] as number;
          if (!best || v > best.verdi) return { verdi: v, dato: r.playedAt };
          return best;
        }, null)
    : null;

  const benchmarkDiff = verdi30d - info.benchmark;

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-16">
      {/* Editorial light header */}
      <header role="banner" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/portal/analysere"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={12} strokeWidth={1.75} /> Analyse
          </Link>
          <div className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {`PlayerHQ · Statistikk · ${info.slug.toUpperCase()}`}
          </div>
          <h1 className="font-display mt-1.5 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {info.title}{" "}
            <em
              className="font-normal not-italic text-primary"
              style={{
                fontFamily: "var(--font-familjen-grotesk), sans-serif",
                fontStyle: "italic",
              }}
            >
              {info.italic}
            </em>{" "}
            30 d
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{info.unit}</p>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:overflow-x-visible md:px-0">
          <div className="flex gap-1 rounded-full border border-border bg-card p-1">
            {PERIODS.map((p, i) => (
              <button
                key={p}
                type="button"
                disabled
                className={`whitespace-nowrap rounded-full px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] ${
                  i === 2
                    ? "bg-foreground text-accent"
                    : "text-muted-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      {!harData ? (
        <EmptyForDiscipline kind={info.kind} title={info.title} />
      ) : (
        <>
          {/* Hero stat — forest gradient detalj-kort + terminal-tall */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* DetailHero (forest gradient) */}
            <div
              className="relative col-span-1 overflow-hidden rounded-2xl p-6 text-white sm:col-span-2 md:col-span-1"
              style={{
                background: "linear-gradient(150deg, var(--forest), var(--ink))",
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--lime) 20%, transparent), transparent 65%)",
                }}
              />
              <div className="relative z-10">
                <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-accent">
                  Snitt 30 d
                </div>
                <div className="mt-3 font-mono text-4xl font-bold leading-none tabular-nums text-accent md:text-5xl">
                  {info.format(verdi30d)}
                </div>
                <div className="mt-3 font-mono text-[10.5px] text-white/65">
                  {forrige30d === 0 && info.kind === "sg"
                    ? "ny baseline"
                    : `${delta >= 0 ? "▲ +" : "▼ "}${info.format(Math.abs(delta))} vs forrige 30 d`}
                </div>
              </div>
            </div>
            {/* vs kategori-snitt */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                vs kategori-snitt
              </div>
              <div
                className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${
                  benchmarkDiff >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {benchmarkDiff >= 0 ? "+" : ""}
                {info.format(Math.abs(benchmarkDiff))}
              </div>
              <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                Snitt A1 = {info.format(info.benchmark)}
              </div>
            </div>
            {/* Total tid / Beste */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                {info.kind === "pyramid" ? "Total tid 90 d" : "Beste 90 d"}
              </div>
              {info.kind === "pyramid" ? (
                <>
                  <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">
                    {(totalMin / 60).toFixed(1).replace(".", ",")} t
                  </div>
                  <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                    {okterTotalt} {okterTotalt === 1 ? "økt" : "økter"} fullført
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-2 font-mono text-3xl font-semibold tabular-nums text-primary">
                    {sgBest ? info.format(sgBest.verdi) : "—"}
                  </div>
                  <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                    {sgBest
                      ? sgBest.dato.toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* TrendBand — utvikling */}
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold tracking-tight">
                Utvikling
              </h2>
              <span className="rounded border border-border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
                Siste 90 d
              </span>
            </div>
            <TrendChart
              values={trendpunkter}
              yMin={info.yMin}
              yMax={info.yMax}
              kind={info.kind}
            />
            <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>90 d</span>
              <span>60 d</span>
              <span>30 d</span>
              <span>i dag</span>
            </div>
            <div className="mt-2 flex gap-4 font-mono text-[9.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-[3px] w-2.5 rounded-sm bg-primary/15" />
                {info.kind === "pyramid" ? "Mål-nivå" : "Team Norway"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-[3px] w-2.5 rounded-sm bg-primary" />
                Din linje
              </span>
            </div>
          </section>

          {/* Topp 5 drills (kun pyramid) */}
          {info.kind === "pyramid" && (
            <section>
              <div className="mb-2">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  Topp 5 drills · {info.title.toLowerCase()}
                </h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Mest tid brukt siste 90 d
                </p>
              </div>
              {drillTopp.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
                  Ingen drills logget for denne disiplinen ennå.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                  <div className="min-w-[480px]">
                  <div className="grid grid-cols-[2fr_80px_80px_80px] gap-4 border-b border-border bg-muted/40 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground md:px-6">
                    <span>Drill</span>
                    <span className="text-right">Antall</span>
                    <span className="text-right">Tid</span>
                    <span className="text-right">Andel</span>
                  </div>
                  {drillTopp.map((d) => (
                    <div
                      key={d.navn}
                      className="grid grid-cols-[2fr_80px_80px_80px] items-center gap-4 border-b border-border/60 px-4 py-2 last:border-0 md:px-6"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Target
                          size={12}
                          strokeWidth={1.75}
                          className="text-muted-foreground"
                        />
                        {d.navn}
                      </span>
                      <span className="text-right font-mono text-sm tabular-nums">
                        {d.antall}
                      </span>
                      <span className="text-right font-mono text-sm tabular-nums">
                        {(d.totalMin / 60).toFixed(1).replace(".", ",")} t
                      </span>
                      <span className="text-right font-mono text-sm font-semibold tabular-nums text-primary">
                        {Math.round(d.andel * 100)}%
                      </span>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* SG-detaljer (kun SG) */}
          {info.kind === "sg" && (
            <section>
              <div className="mb-2">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  SG-utvikling per uke
                </h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  Snitt {info.italic.toLowerCase()} per uke · siste 90 d
                </p>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <div className="min-w-[420px]">
                <div className="grid grid-cols-[1fr_80px_80px] gap-4 border-b border-border bg-muted/40 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground md:px-6">
                  <span>Periode</span>
                  <span className="text-right">Runder</span>
                  <span className="text-right">SG snitt</span>
                </div>
                {byggSgUkeRader(
                  recentRounds as Array<{ playedAt: Date } & Record<string, unknown>>,
                  info.sgField!,
                  ninetyDaysAgo,
                  naaMs,
                ).map((u) => (
                  <div
                    key={u.label}
                    className="grid grid-cols-[1fr_80px_80px] items-center gap-4 border-b border-border/60 px-4 py-2 last:border-0 md:px-6"
                  >
                    <span className="font-medium">{u.label}</span>
                    <span className="text-right font-mono text-sm tabular-nums">
                      {u.runder}
                    </span>
                    <span
                      className={`text-right font-mono text-sm font-semibold tabular-nums ${
                        u.sg == null
                          ? "text-muted-foreground"
                          : u.sg >= 0
                            ? "text-primary"
                            : "text-destructive"
                      }`}
                    >
                      {u.sg == null ? "—" : info.format(u.sg)}
                    </span>
                  </div>
                ))}
                </div>
              </div>
            </section>
          )}

          {/* Økt-sammendrag (kun pyramid) */}
          {info.kind === "pyramid" && okterTotalt > 0 && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Tile
                icon={ClipboardList}
                label="Antall økter"
                value={String(okterTotalt)}
                sub="siste 90 d"
              />
              <Tile
                icon={Clock}
                label="Total tid"
                value={`${(totalMin / 60).toFixed(1).replace(".", ",")} t`}
                sub={`Snitt ${Math.round(totalMin / Math.max(okterTotalt, 1))} min/økt`}
              />
              <Tile
                icon={Sparkles}
                label="Drill-bredde"
                value={String(drillTopp.length)}
                sub="unike drills brukt"
              />
            </section>
          )}
        </>
      )}

      {/* Coach-CTA */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Be coachen om mer fokus
          </span>
          <h3 className="mt-2 font-display text-lg font-semibold">
            Vil du jobbe mer med {info.italic.toLowerCase()}?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Send en melding til coach Anders og be ham legge mer av denne
            disiplinen inn i neste plan.
          </p>
        </div>
        <Link
          href={`/portal/coach/melding?type=fokus&omrade=${info.slug}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          <MessageSquare size={14} strokeWidth={1.75} /> Be om mer fokus
        </Link>
      </section>
    </div>
  );
}

/* ─────────── Sub-komponenter ─────────── */

function EmptyForDiscipline({
  kind,
  title,
}: {
  kind: Kind;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Ingen data ennå
      </span>
      <h3 className="mt-2 font-display text-xl font-semibold">
        {title} · ingen historikk
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {kind === "pyramid"
          ? "Du har ikke fullført økter i denne disiplinen ennå. Logg en økt for å se trender."
          : "Du har ikke registrert runder med SG-data ennå. Logg din første runde."}
      </p>
      <Link
        href={
          kind === "pyramid"
            ? "/portal/gjennomfore"
            : "/portal/analysere"
        }
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
      >
        {kind === "pyramid" ? "Til gjennomfør" : "Til analyse"}
        <ArrowRight size={14} strokeWidth={1.75} />
      </Link>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        <Icon size={11} strokeWidth={1.75} />
        {label}
      </div>
      <div className="font-mono text-2xl font-semibold tabular-nums">
        {value}
      </div>
      <div className="mt-1 font-mono text-[11px] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}

function TrendChart({
  values,
  yMin,
  yMax,
  kind,
}: {
  values: number[];
  yMin: number;
  yMax: number;
  kind: Kind;
}) {
  if (values.length === 0) {
    return (
      <div className="grid h-48 w-full place-items-center text-sm text-muted-foreground">
        Ingen datapunkter
      </div>
    );
  }
  const xy = values.map((v, i) => ({
    x: (i / Math.max(values.length - 1, 1)) * 100,
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
  const zeroY = ((yMax - 0) / (yMax - yMin)) * 100;

  return (
    <div className="relative h-48 w-full">
      <div className="absolute left-0 top-0 flex h-full w-10 flex-col justify-between font-mono text-[10px] text-muted-foreground">
        <span>{kind === "sg" ? "+2,0" : `${yMax}`}</span>
        <span>{kind === "sg" ? "+1,0" : `${Math.round(yMax / 2)}`}</span>
        <span>{kind === "sg" ? "0,0" : "0"}</span>
      </div>
      <div className="absolute inset-y-0 left-10 right-0">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {kind === "sg" && (
            <line
              x1="0"
              y1={zeroY}
              x2="100"
              y2={zeroY}
              stroke="hsl(var(--border))"
              strokeWidth="0.3"
              strokeDasharray="1 1"
            />
          )}
          <path d={areaPath} fill="url(#trend-grad)" stroke="none" />
          <path
            d={path}
            fill="none"
            stroke="#005840"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
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

/* ─────────── Helpers ─────────── */

function summer(arr: (number | null | undefined)[]): number {
  return arr.reduce<number>((s, v) => s + (typeof v === "number" ? v : 0), 0);
}

function snittSg(
  rounds: Array<{ playedAt: Date } & Record<string, unknown>>,
  field: string,
  from: Date,
  to?: Date,
): number {
  const filtered = rounds.filter(
    (r) => r.playedAt >= from && (to ? r.playedAt < to : true),
  );
  const values = filtered
    .map((r) => r[field])
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return 0;
  return values.reduce<number>((s, v) => s + v, 0) / values.length;
}

function byggPyramidTrend(
  sessions: { scheduledAt: Date; durationMin: number }[],
  from: Date,
  toMs: number,
): number[] {
  // 12 ukentlige buckets fra siste 90 d
  const buckets = 12;
  const startMs = from.getTime();
  const totalMs = toMs - startMs;
  const out: number[] = [];
  for (let i = 0; i < buckets; i++) {
    const bStart = startMs + (totalMs * i) / buckets;
    const bEnd = startMs + (totalMs * (i + 1)) / buckets;
    const inn = sessions.filter(
      (s) => s.scheduledAt.getTime() >= bStart && s.scheduledAt.getTime() < bEnd,
    );
    out.push(summer(inn.map((s) => s.durationMin)) / 60);
  }
  return out;
}

function byggSgTrend(
  rounds: Array<{ playedAt: Date } & Record<string, unknown>>,
  field: string,
  from: Date,
  toMs: number,
): number[] {
  const buckets = 12;
  const startMs = from.getTime();
  const totalMs = toMs - startMs;
  const out: number[] = [];
  let lastValid = 0;
  for (let i = 0; i < buckets; i++) {
    const bStart = startMs + (totalMs * i) / buckets;
    const bEnd = startMs + (totalMs * (i + 1)) / buckets;
    const inn = rounds.filter(
      (r) =>
        r.playedAt.getTime() >= bStart && r.playedAt.getTime() < bEnd,
    );
    const values = inn
      .map((r) => r[field])
      .filter((v): v is number => typeof v === "number");
    if (values.length > 0) {
      const snitt = values.reduce<number>((s, v) => s + v, 0) / values.length;
      lastValid = snitt;
      out.push(snitt);
    } else {
      out.push(lastValid);
    }
  }
  return out;
}

function byggSgUkeRader(
  rounds: Array<{ playedAt: Date } & Record<string, unknown>>,
  field: string,
  from: Date,
  toMs: number,
): Array<{ label: string; runder: number; sg: number | null }> {
  const buckets = 6;
  const startMs = from.getTime();
  const totalMs = toMs - startMs;
  const out: Array<{ label: string; runder: number; sg: number | null }> = [];
  for (let i = 0; i < buckets; i++) {
    const bStart = startMs + (totalMs * i) / buckets;
    const bEnd = startMs + (totalMs * (i + 1)) / buckets;
    const inn = rounds.filter(
      (r) =>
        r.playedAt.getTime() >= bStart && r.playedAt.getTime() < bEnd,
    );
    const values = inn
      .map((r) => r[field])
      .filter((v): v is number => typeof v === "number");
    const sg =
      values.length === 0
        ? null
        : values.reduce<number>((s, v) => s + v, 0) / values.length;
    out.push({
      label: `${new Date(bStart).toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "short",
      })} → ${new Date(bEnd).toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "short",
      })}`,
      runder: inn.length,
      sg,
    });
  }
  return out;
}

type DrillEntry = {
  exercise: { name: string; durationMin: number | null };
  session: { id: string; durationMin: number; scheduledAt: Date };
};

function aggregerTopDrills(
  drills: DrillEntry[],
): Array<{ navn: string; antall: number; totalMin: number; andel: number }> {
  const groups = new Map<string, { antall: number; totalMin: number }>();
  for (const d of drills) {
    const navn = d.exercise.name;
    const tid =
      d.exercise.durationMin ??
      Math.round(d.session.durationMin / Math.max(1, 4));
    const prev = groups.get(navn) ?? { antall: 0, totalMin: 0 };
    groups.set(navn, { antall: prev.antall + 1, totalMin: prev.totalMin + tid });
  }
  const total = [...groups.values()].reduce((s, g) => s + g.totalMin, 0);
  return [...groups.entries()]
    .map(([navn, g]) => ({
      navn,
      antall: g.antall,
      totalMin: g.totalMin,
      andel: total === 0 ? 0 : g.totalMin / total,
    }))
    .sort((a, b) => b.totalMin - a.totalMin)
    .slice(0, 5);
}
