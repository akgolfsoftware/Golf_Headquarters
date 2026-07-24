/**
 * PlayerHQ · Statistikk · Drill-down per disipplin (/portal/statistikk/[metric]) — v2.
 * v2-port 17. juli 2026 (Team D3): `StatistikkMetrikkV2` erstatter den lyse
 * hybrid-siden, ruten flyttet ut av (legacy). Auth, metric-oppslaget (5 pyramide-
 * disipliner + 4 SG-disipliner + legacy-aliaser), Prisma-queries og all
 * aggregering (trend-buckets, snitt, topp-drills, SG-ukesrader) er uendret —
 * kun presentasjonslaget er nytt.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  StatistikkMetrikkV2,
  type StatistikkMetrikkV2Data,
} from "@/components/portal/v2/StatistikkMetrikkV2";

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
    italic: "tee-slag",
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
    italic: "innspill",
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
    italic: "nærspill",
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
    italic: "putting",
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

  // Trendgraf (90 d, 12 buckets)
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

  const nyBaseline = forrige30d === 0 && info.kind === "sg";

  const data: StatistikkMetrikkV2Data = {
    kind: info.kind,
    slugLabel: info.slug.toUpperCase(),
    tittel: info.title,
    em: info.italic,
    underLabel: info.unit,
    harData,
    hovedVerdi: info.format(verdi30d),
    hovedEnhet: info.kind === "pyramid" ? "" : "SG/runde",
    deltaLabel: nyBaseline
      ? null
      : `${delta >= 0 ? "+" : "−"}${info.format(Math.abs(delta))}`,
    deltaDir: delta >= 0 ? "up" : "down",
    deltaSub: nyBaseline ? "ny baseline — første 30 d med data" : "vs forrige 30 d",
    benchmarkDiffLabel: `${benchmarkDiff >= 0 ? "+" : "−"}${info.format(Math.abs(benchmarkDiff))}`,
    benchmarkPositiv: benchmarkDiff >= 0,
    benchmarkSnittLabel: `Snitt A1 = ${info.format(info.benchmark)} (referanse)`,
    tredjeLabel: info.kind === "pyramid" ? "Total tid 90 d" : "Beste 90 d",
    tredjeVerdi:
      info.kind === "pyramid"
        ? `${(totalMin / 60).toFixed(1).replace(".", ",")} t`
        : sgBest
          ? `${info.format(sgBest.verdi)} SG`
          : "—",
    tredjeSub:
      info.kind === "pyramid"
        ? `${okterTotalt} ${okterTotalt === 1 ? "økt" : "økter"} fullført · snitt ${Math.round(totalMin / Math.max(okterTotalt, 1))} min/økt`
        : sgBest
          ? sgBest.dato.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })
          : "—",
    trend: { punkter: trendpunkter, yMin: info.yMin, yMax: info.yMax },
    drillTopp: drillTopp.map((d) => ({
      navn: d.navn,
      antall: d.antall,
      tidLabel: `${(d.totalMin / 60).toFixed(1).replace(".", ",")} t`,
      andelPct: d.andel * 100,
    })),
    sgUker:
      info.kind === "sg" && harData
        ? byggSgUkeRader(
            recentRounds as Array<{ playedAt: Date } & Record<string, unknown>>,
            info.sgField!,
            ninetyDaysAgo,
            naaMs,
          )
        : [],
    fokusHref: `/portal/coach/melding?type=fokus&omrade=${info.slug}`,
    emptyTekst:
      info.kind === "pyramid"
        ? "Du har ikke fullført økter i denne disiplinen ennå. Logg en økt for å se trender."
        : "Du har ikke registrert runder med SG-data ennå. Logg din første runde.",
    emptyCtaHref: info.kind === "pyramid" ? "/portal/gjennomfore" : "/portal/analysere",
    emptyCtaTekst: info.kind === "pyramid" ? "Til gjennomfør" : "Til analyse",
  };

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/analysere">Analyse</TilbakeLenke>
      <StatistikkMetrikkV2 data={data} />
    </V2Shell>
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
