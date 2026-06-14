/**
 * AgencyOS — Test-resultat detalj (coach-view)
 *
 * Henter ett TestResult med historikk for samme test+spiller, og sender
 * det videre til client-komponenten som tegner trend-graf og bench-marking.
 *
 * Migrert fra public/design/batch4/test-detalj-cmj.html.
 */
import { notFound } from "next/navigation";
import { Activity, Download, FileText, Send } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard } from "@/components/ui";
import { AthleticBadge, AthleticButton } from "@/components/athletic";
import { TestDetailClient, type TestPoint, type BenchmarkView } from "./test-detail-client";
import { parseBenchmarks, achievedLevel, ladderText, DISPLAY_UNIT } from "@/lib/admin/test-benchmarks";

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

  // Benchmark/nivå — KUN fra ekte referanse (test-benchmarks). Tester uten
  // benchmarks (f.eks. FYS — formel ikke låst) får ingen nivå-verdikt.
  const bm = parseBenchmarks(result.test.protocol);
  const achieved = bm ? achievedLevel(bm, sisteVerdi) : null;
  const benchmark: BenchmarkView | null = bm
    ? {
        eliteValue: bm.levels[0].value,
        eliteLabel: bm.levels[0].label,
        achievedLabel: achieved?.label ?? null,
        lowerBetter: bm.direction === "lower",
        unitSuffix: ` ${DISPLAY_UNIT[bm.unit]}`,
        ladder: ladderText(bm),
      }
    : null;

  const kategoriLabel =
    PYR_LABEL[result.test.pyramidArea] ?? result.test.pyramidArea;

  const testNamnFront =
    result.test.name.split(" ").slice(0, -1).join(" ") || result.test.name;
  const testNamnBak =
    result.test.name.split(" ").length > 1
      ? result.test.name.split(" ").slice(-1)[0]
      : "";

  return (
    <DetailShell
      breadcrumb={[
        { label: "Tester", href: "/admin/tester" },
        { label: result.test.name },
      ]}
      backHref="/admin/tester"
      title={
        <>
          <em className="text-primary italic">{testNamnFront}</em>
          {testNamnBak && ` ${testNamnBak}`}
        </>
      }
      subtitle={`${result.user.name}${result.user.hcp != null ? ` · HCP ${result.user.hcp.toFixed(1).replace(".", ",")}` : ""} · ${formatDate(result.takenAt)}`}
      statusPill={
        <AthleticBadge variant="neutral">
          <Activity size={10} strokeWidth={1.75} className="mr-1" />
          {kategoriLabel}
        </AthleticBadge>
      }
      actions={
        <>
          <AthleticButton
            variant="ghost-light"
            size="sm"
            type="button"
          >
            <Send size={14} strokeWidth={1.75} />
            Del med spiller
          </AthleticButton>
          <AthleticButton
            variant="ghost-light"
            size="sm"
            type="button"
          >
            <FileText size={14} strokeWidth={1.75} />
            Eksporter PDF
          </AthleticButton>
          <AthleticButton
            variant="lime"
            size="sm"
            type="button"
          >
            <Download size={14} strokeWidth={1.75} />
            Logg ny test
          </AthleticButton>
        </>
      }
      kpiRow={
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <KPICard
            eyebrow="Siste verdi"
            value={formatScore(sisteVerdi)}
            variant="hero"
            footnote={`${formatDate(result.takenAt)}${erPr ? " · PR" : ""}`}
          />
          <KPICard
            eyebrow="Snitt historikk"
            value={formatScore(snitt)}
            variant="default"
            delta={
              deltaForrige != null
                ? {
                    value: `${deltaForrige >= 0 ? "+" : ""}${formatScore(deltaForrige)}`,
                    direction: deltaForrige > 0 ? "up" : deltaForrige < 0 ? "down" : "neutral",
                  }
                : undefined
            }
            footnote={
              deltaForrige != null ? "vs forrige måling" : "Ingen tidligere måling"
            }
          />
          <KPICard
            eyebrow="Personlig rekord"
            value={formatScore(pr)}
            variant="default"
            footnote={
              history.length > 0
                ? formatDate(history[scores.indexOf(pr)]?.takenAt ?? result.takenAt)
                : "—"
            }
          />
          {benchmark ? (
            <KPICard
              eyebrow={`Referanse · ${benchmark.eliteLabel}`}
              value={`${formatScore(benchmark.eliteValue)}${benchmark.unitSuffix}`}
              variant="default"
              footnote={benchmark.achievedLabel ? `Nå: ${benchmark.achievedLabel}` : "Under referansenivå"}
            />
          ) : (
            <KPICard
              eyebrow="Målinger"
              value={String(history.length)}
              variant="default"
              footnote="Ingen referansenivå ennå"
            />
          )}
        </div>
      }
    >
      <TestDetailClient
        points={points}
        currentIso={result.takenAt.toISOString()}
        resultId={result.id}
        egetSnitt={snitt}
        benchmark={benchmark}
        coachNotes={result.notes ?? null}
      />
    </DetailShell>
  );
}

