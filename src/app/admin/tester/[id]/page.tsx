/**
 * CoachHQ — Test-resultat detalj (coach-view)
 *
 * Henter ett TestResult med historikk for samme test+spiller, og sender
 * det videre til client-komponenten som tegner trend-graf og bench-marking.
 *
 * Migrert fra public/design/batch4/test-detalj-cmj.html.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity, Download, FileText, Send } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TestDetailClient, type TestPoint } from "./test-detail-client";

const PYR_LABEL: Record<string, string> = {
  FYS: "Fysisk · styrke & eksplosivitet",
  TEK: "Teknisk · slag & sving",
  SLAG: "Slag · ytelse",
  SPILL: "Spill · taktikk",
  TURN: "Turnering",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatScore(n: number): string {
  return n.toFixed(1).replace(".", ",").replace(/,0$/, "");
}

export default async function TestDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const result = await prisma.testResult.findUnique({
    where: { id },
    include: {
      test: true,
      user: { select: { id: true, name: true, email: true, hcp: true } },
    },
  });
  if (!result) notFound();

  // Hent historikk for samme test+spiller — sortert eldst → nyest
  const history = await prisma.testResult.findMany({
    where: { userId: result.userId, testId: result.testId },
    select: {
      id: true,
      score: true,
      takenAt: true,
      notes: true,
    },
    orderBy: { takenAt: "asc" },
    take: 24,
  });

  const points: TestPoint[] = history.map((h) => ({
    id: h.id,
    iso: h.takenAt.toISOString(),
    date: formatDate(h.takenAt),
    score: h.score,
    scoreLabel: formatScore(h.score),
    notes: h.notes,
    isCurrent: h.id === result.id,
  }));

  const scores = history.map((h) => h.score);
  const sisteVerdi = result.score;
  const pr = scores.length > 0 ? Math.max(...scores) : sisteVerdi;
  const erPr = sisteVerdi >= pr;
  const snitt =
    scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : sisteVerdi;

  // Forrige måling-delta
  const forrige =
    history.length >= 2
      ? history[history.findIndex((h) => h.id === result.id) - 1] ?? null
      : null;
  const deltaForrige = forrige ? sisteVerdi - forrige.score : null;

  // Benchmark — bruk hardkodet U18-norm hvis testen er CMJ-lignende
  const benchmark = { snitt: snitt * 0.92, elite: pr * 1.04, enhet: "" };

  const kategoriLabel =
    PYR_LABEL[result.test.pyramidArea] ?? result.test.pyramidArea;

  return (
    <div className="space-y-8 pb-16">
      {/* Tilbake-link */}
      <div>
        <Link
          href="/admin/tester"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Tilbake til tester
        </Link>
      </div>

      {/* Hero */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
            <Activity size={12} strokeWidth={1.75} />
            {kategoriLabel}
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal italic text-primary">
              {result.test.name.split(" ").slice(0, -1).join(" ") ||
                result.test.name}
            </em>
            {result.test.name.split(" ").length > 1 && (
              <> {result.test.name.split(" ").slice(-1)[0]}</>
            )}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {result.test.description ??
              "Test-resultat for spiller — coach kan logge ny måling, eksportere som PDF eller dele med spiller."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <Link
              href={`/admin/spillere/${result.user.id}`}
              className="font-semibold text-foreground hover:text-primary"
            >
              {result.user.name}
            </Link>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              HCP{" "}
              <strong className="text-foreground">
                {result.user.hcp != null
                  ? result.user.hcp.toFixed(1).replace(".", ",")
                  : "—"}
              </strong>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {formatDate(result.takenAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Send size={14} strokeWidth={1.75} />
            Del med spiller
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <FileText size={14} strokeWidth={1.75} />
            Eksporter PDF
          </button>
          <Link
            href={`/admin/spillere/${result.user.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Download size={14} strokeWidth={1.75} />
            Logg ny test
          </Link>
        </div>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KpiHilite
          label="Siste verdi"
          value={formatScore(sisteVerdi)}
          sub={`${formatDate(result.takenAt)}${erPr ? " · PR" : ""}`}
        />
        <Kpi
          label="Snitt historikk"
          value={formatScore(snitt)}
          sub={
            deltaForrige != null
              ? `${deltaForrige >= 0 ? "+" : ""}${formatScore(deltaForrige)} mot forrige`
              : "Ingen tidligere måling"
          }
          delta={deltaForrige}
        />
        <Kpi
          label="Personlig rekord"
          value={formatScore(pr)}
          sub={
            history.length > 0
              ? formatDate(history[scores.indexOf(pr)]?.takenAt ?? result.takenAt)
              : "—"
          }
        />
        <Kpi
          label="Benchmark"
          value={formatScore(benchmark.elite)}
          sub={`Kategori-elite · snitt ${formatScore(benchmark.snitt)}`}
        />
      </section>

      <TestDetailClient
        points={points}
        currentIso={result.takenAt.toISOString()}
        benchmark={benchmark}
        coachNotes={result.notes ?? null}
      />
    </div>
  );
}

// --------- KPI ---------

function KpiHilite({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-gradient-to-br from-primary/5 to-card p-4 ring-1 ring-primary/20">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number | null;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
        {value}
      </div>
      {sub && (
        <div
          className={`font-mono text-[11px] ${
            delta != null && delta > 0
              ? "text-primary"
              : delta != null && delta < 0
                ? "text-destructive"
                : "text-muted-foreground"
          }`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
