/**
 * <AnalyserOverview> — landings-skjerm for /portal/analysere.
 *
 * 6 kort som speiler tabbene: Statistikk, SG, Runder, TrackMan, Tester, Innsikt.
 */

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  Flag,
  Wifi,
  TestTube,
  Lightbulb,
  LineChart,
} from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

type Kort = {
  href: string;
  eyebrow: string;
  titel: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  primaryLine: string;
  secondaryLine: string;
};

export async function AnalyserOverview({ userId }: { userId: string }) {
  const now = new Date();
  const trettiagSiden = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRunder,
    sisteRunde,
    runder30,
    tmTotal,
    tmSiste30,
    sisteTm,
    testCount,
    sisteTest,
    insightCount,
    sisteInsight,
  ] = await Promise.all([
    prisma.round.count({ where: { userId } }),
    prisma.round.findFirst({
      where: { userId },
      orderBy: { playedAt: "desc" },
      select: { playedAt: true },
    }),
    prisma.round.count({
      where: { userId, playedAt: { gte: trettiagSiden } },
    }),
    prisma.trackManSession.count({ where: { userId } }),
    prisma.trackManSession.count({
      where: { userId, recordedAt: { gte: trettiagSiden } },
    }),
    prisma.trackManSession.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      select: { recordedAt: true },
    }),
    prisma.testResult.count({ where: { userId } }),
    prisma.testResult.findFirst({
      where: { userId },
      orderBy: { takenAt: "desc" },
      select: { takenAt: true },
    }),
    prisma.sgInsight.count({ where: { userId } }),
    prisma.sgInsight.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, category: true },
    }),
  ]);

  const kort: Kort[] = [
    {
      href: "/portal/analysere?tab=statistikk",
      eyebrow: "Oversikt",
      titel: "Statistikk",
      Icon: BarChart3,
      primaryLine:
        totalRunder > 0
          ? `${totalRunder} runde(r) totalt`
          : "Ingen runder enda",
      secondaryLine: "Sammendrag og trender",
    },
    {
      href: "/portal/analysere?tab=sg",
      eyebrow: "Strokes gained",
      titel: "SG-analyse",
      Icon: TrendingUp,
      primaryLine:
        runder30 > 0
          ? `${runder30} runde(r) siste 30 dager`
          : "Trenger flere runder",
      secondaryLine: "Hvor du tjener og taper slag",
    },
    {
      href: "/portal/analysere?tab=runder",
      eyebrow: "Runder",
      titel: "Runder",
      Icon: Flag,
      primaryLine:
        totalRunder > 0 ? `${totalRunder} runde(r) loggført` : "Ingen runder",
      secondaryLine: sisteRunde
        ? `Siste: ${NB_DATE.format(sisteRunde.playedAt)}`
        : "Loggfør første runde",
    },
    {
      href: "/portal/analysere?tab=trackman",
      eyebrow: "Range-data",
      titel: "TrackMan",
      Icon: Wifi,
      primaryLine:
        tmTotal > 0 ? `${tmTotal} TrackMan-økt(er)` : "Ingen TrackMan-data",
      secondaryLine: sisteTm
        ? `Siste: ${NB_DATE.format(sisteTm.recordedAt)} · ${tmSiste30} siste 30d`
        : "Importer fra TrackMan",
    },
    {
      href: "/portal/analysere?tab=tester",
      eyebrow: "Måling",
      titel: "Tester",
      Icon: TestTube,
      primaryLine:
        testCount > 0 ? `${testCount} test(er) tatt` : "Ingen tester ennå",
      secondaryLine: sisteTest
        ? `Siste: ${NB_DATE.format(sisteTest.takenAt)}`
        : "Gjør første ferdighetstest",
    },
    {
      href: "/portal/analysere?tab=innsikt",
      eyebrow: "AI-funn",
      titel: "Innsikt",
      Icon: Lightbulb,
      primaryLine:
        insightCount > 0
          ? `${insightCount} innsikt(er)`
          : "Ingen innsikt ennå",
      secondaryLine: sisteInsight
        ? `Siste: ${sisteInsight.category} · ${NB_DATE.format(sisteInsight.createdAt)}`
        : "Logg flere runder for analyse",
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <LineChart className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>PLAYERHQ · ANALYSERE</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Forstå{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontStyle: "italic",
                color: "hsl(var(--primary))",
              }}
            >
              spillet ditt
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Statistikk, Strokes gained, runder, TrackMan, tester og AI-innsikt.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kort.map((k) => (
          <OversiktKort key={k.href} {...k} />
        ))}
      </section>
    </div>
  );
}

function OversiktKort({
  href,
  eyebrow,
  titel,
  Icon,
  primaryLine,
  secondaryLine,
}: Kort) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.75}
        />
      </div>
      <span className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {eyebrow}
      </span>
      <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
        {titel}
      </h3>
      <div className="mt-4 border-t border-border/50 pt-3">
        <p className="text-[14px] font-medium text-foreground">{primaryLine}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {secondaryLine}
        </p>
      </div>
    </Link>
  );
}
