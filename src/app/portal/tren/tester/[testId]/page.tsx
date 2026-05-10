import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

export default async function TestDetalj({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const user = await requirePortalUser();
  const { testId } = await params;

  const test = await prisma.testDefinition.findUnique({
    where: { id: testId },
  });
  if (!test) notFound();

  const resultater = await prisma.testResult.findMany({
    where: { userId: user.id, testId: test.id },
    orderBy: { takenAt: "asc" },
  });

  const minScore = resultater.length
    ? Math.min(...resultater.map((r) => r.score))
    : 0;
  const maxScore = resultater.length
    ? Math.max(...resultater.map((r) => r.score))
    : 100;
  const span = Math.max(maxScore - minScore, 1);

  return (
    <div className="space-y-6">
      <Link
        href="/portal/tren/tester"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Alle tester
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Test · {PYR_LABEL[test.pyramidArea]}
        </span>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight">
          {test.name}
        </h2>
        {test.description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {test.description}
          </p>
        )}
      </header>

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Scoring-regel
        </span>
        <p className="mt-2 text-sm text-foreground">{test.scoringRule}</p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Min historikk ({resultater.length})
          </span>
          {resultater.length > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Snitt:{" "}
              <span className="tabular-nums text-foreground">
                {(
                  resultater.reduce((s, r) => s + r.score, 0) /
                  resultater.length
                )
                  .toFixed(1)
                  .replace(".", ",")}
              </span>
            </span>
          )}
        </div>

        {resultater.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Du har ikke tatt denne testen ennå.
          </p>
        ) : (
          <>
            <div className="mt-4 h-32 w-full">
              <svg viewBox="0 0 400 100" className="h-full w-full">
                {resultater.map((r, i) => {
                  if (i === 0) return null;
                  const prev = resultater[i - 1];
                  const x1 = ((i - 1) / Math.max(resultater.length - 1, 1)) * 400;
                  const x2 = (i / Math.max(resultater.length - 1, 1)) * 400;
                  const y1 = 100 - ((prev.score - minScore) / span) * 80 - 10;
                  const y2 = 100 - ((r.score - minScore) / span) * 80 - 10;
                  return (
                    <line
                      key={r.id}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  );
                })}
                {resultater.map((r, i) => {
                  const x = (i / Math.max(resultater.length - 1, 1)) * 400;
                  const y = 100 - ((r.score - minScore) / span) * 80 - 10;
                  return (
                    <circle
                      key={r.id}
                      cx={x}
                      cy={y}
                      r={3}
                      fill="hsl(var(--primary))"
                    />
                  );
                })}
              </svg>
            </div>

            <ul className="mt-4 divide-y divide-border">
              {[...resultater].reverse().map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {r.takenAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    {r.notes && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {r.notes}
                      </div>
                    )}
                  </div>
                  <div className="font-display text-base font-semibold tabular-nums text-foreground">
                    {r.score.toFixed(1).replace(".", ",")}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
