/**
 * Test-oppsummering etter fullført live-økt.
 * Vises i fullscreen-layout (ingen sidebar) for fokus.
 *
 * Innhold:
 *   - Hero: gratulasjon + score + delta mot PR / snitt
 *   - Sammenligning mot PGA-benchmark + baseline
 *   - "Hva nå?"-foreslag (be coach se · ta ny test om 14 dager · sammenlign på tvers)
 *   - CTA: tilbake til test-detalj / tilbake til alle tester
 */

import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, TrendingUp, Trophy } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

type Protocol = {
  scoringMode?: string;
  primaryMetric?: string;
  unit?: string;
  pgaBenchmark?: string;
  baselineNormal?: { junior?: number; amateur?: number; pro?: number };
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export default async function TestSummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const user = await requirePortalUser();
  const { testId } = await params;
  const { session: sessionId } = await searchParams;

  const test = await prisma.testDefinition.findUnique({ where: { id: testId } });
  if (!test) notFound();

  let session = null;
  if (sessionId) {
    session = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: { test: true },
    });
  }

  if (!session || session.userId !== user.id || session.status !== "COMPLETED") {
    redirect(`/portal/tren/tester/${testId}`);
  }

  const result = session.testResultId
    ? await prisma.testResult.findUnique({ where: { id: session.testResultId } })
    : null;
  if (!result) {
    redirect(`/portal/tren/tester/${testId}`);
  }

  // Hent tidligere resultater for delta-beregning
  const previousResults = await prisma.testResult.findMany({
    where: {
      userId: user.id,
      testId: testId,
      id: { not: result.id },
    },
    orderBy: { takenAt: "desc" },
  });

  const allResults = [result, ...previousResults];
  const scoresExceptThis = previousResults.map((r) => r.score);
  const prevBest =
    scoresExceptThis.length > 0 ? Math.max(...scoresExceptThis) : null;
  const prevAvg =
    scoresExceptThis.length > 0
      ? scoresExceptThis.reduce((a, b) => a + b, 0) / scoresExceptThis.length
      : null;

  const isPersonalRecord =
    prevBest === null || result.score > prevBest;

  const deltaVsPrev =
    previousResults.length > 0
      ? result.score - previousResults[0].score
      : null;

  const protocol = (isPlainObject(test.protocol) ? test.protocol : {}) as Protocol;
  const unit = protocol.unit ?? "";

  function fmt(v: number): string {
    return v.toFixed(2).replace(".", ",").replace(/,?00$/, "").replace(/(,\d)0$/, "$1");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          <Home className="h-3 w-3" strokeWidth={1.75} />
          PlayerHQ
        </Link>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Test fullført
        </div>
      </header>

      {/* Hero */}
      <section className="mt-10 flex flex-col items-center text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10">
          <CheckCircle2
            className="h-12 w-12 text-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
          {isPersonalRecord ? (
            <>
              Ny <em className="font-serif italic font-normal text-primary">personlig rekord!</em>
            </>
          ) : (
            <>
              Bra jobbet, <em className="font-serif italic font-normal text-primary">Markus</em>
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {test.name} · {allResults.length}. forsøk
        </p>

        {/* Score */}
        <div className="mt-8 flex items-baseline gap-2 font-mono tabular-nums">
          <span className="font-display text-7xl font-semibold leading-none text-foreground">
            {fmt(result.score)}
          </span>
          {unit && (
            <span className="text-lg font-medium text-muted-foreground">{unit}</span>
          )}
        </div>
        {deltaVsPrev !== null && (
          <div
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold ${
              deltaVsPrev >= 0
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            <TrendingUp
              className={`h-3.5 w-3.5 ${deltaVsPrev < 0 ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
            {deltaVsPrev >= 0 ? "+" : ""}
            {fmt(deltaVsPrev)} mot forrige
          </div>
        )}
      </section>

      {/* Sammenligning */}
      <section className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Personlig rekord"
          value={prevBest !== null ? fmt(Math.max(prevBest, result.score)) : fmt(result.score)}
          highlight={isPersonalRecord}
          icon={<Trophy className="h-4 w-4" strokeWidth={1.75} />}
          unit={unit}
        />
        <StatCard
          label="Snitt"
          value={
            prevAvg !== null
              ? fmt((prevAvg * scoresExceptThis.length + result.score) / allResults.length)
              : fmt(result.score)
          }
          unit={unit}
        />
        <StatCard
          label="Antall forsøk"
          value={String(allResults.length)}
          unit=""
        />
      </section>

      {/* PGA-benchmark */}
      {protocol.pgaBenchmark && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            PGA Benchmark
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {protocol.pgaBenchmark}
          </p>
        </section>
      )}

      {/* Hva nå */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-base font-semibold">Hva nå?</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <NextStep>
            Resultatet er sendt til coach automatisk
          </NextStep>
          <NextStep>
            Ta samme test om 14 dager for å måle progresjon
          </NextStep>
          <NextStep>
            Sammenlign mot kohort på <em>test-detalj</em>
          </NextStep>
        </ul>
      </section>

      {/* Spacer + CTA */}
      <div className="mt-auto pt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href={`/portal/tren/tester/${testId}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Tilbake til {test.name}
          </Link>
          <Link
            href="/portal/tren/tester"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Alle tester
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border p-4 ${
        highlight
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1 font-mono tabular-nums">
        <span className="text-2xl font-semibold leading-none text-foreground">{value}</span>
        {unit && <span className="text-[11px] text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

function NextStep({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-foreground">
      <CheckCircle2
        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
        strokeWidth={1.75}
      />
      <span>{children}</span>
    </li>
  );
}
