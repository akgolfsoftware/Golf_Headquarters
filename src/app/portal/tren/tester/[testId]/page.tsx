import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

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

  const snitt =
    resultater.length > 0
      ? resultater.reduce((s, r) => s + r.score, 0) / resultater.length
      : 0;
  const best = resultater.length > 0 ? maxScore : 0;
  const siste = resultater.length > 0 ? resultater[resultater.length - 1] : null;

  // Split test name for italic display — last word goes italic
  const navnOrd = test.name.trim().split(" ");
  const titleItalic = navnOrd.length > 1 ? navnOrd[navnOrd.length - 1] : test.name;
  const titleLead =
    navnOrd.length > 1 ? navnOrd.slice(0, -1).join(" ") : undefined;

  return (
    <div className="space-y-8">
      <Link
        href="/portal/tren/tester"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Alle tester
      </Link>

      <PageHeader
        eyebrow={`PlayerHQ · Trening · ${PYR_LABEL[test.pyramidArea]}`}
        titleLead={titleLead}
        titleItalic={titleItalic}
        sub={test.description ?? undefined}
      />

      {resultater.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Siste"
            value={siste!.score.toFixed(1).replace(".", ",")}
            sub={siste!.takenAt.toLocaleDateString("nb-NO", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          />
          <StatCard
            label="Best"
            value={best.toFixed(1).replace(".", ",")}
            sub={`${resultater.length} forsøk`}
            highlight
          />
          <StatCard
            label="Snitt"
            value={snitt.toFixed(1).replace(".", ",")}
            sub="Over alle forsøk"
          />
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Scoring-regel
        </span>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {test.scoringRule}
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Min historikk
            </span>
            <h3 className="mt-1 font-display text-lg font-semibold leading-tight tracking-tight">
              {resultater.length} forsøk
            </h3>
          </div>
        </div>

        {resultater.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={ClipboardList}
              titleItalic="Ingen forsøk"
              titleTrail="ennå"
              sub="Du har ikke tatt denne testen. Avtal en test med coachen din for å starte å måle progresjonen."
            />
          </div>
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
                      strokeLinecap="round"
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
                <li
                  key={r.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {r.takenAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    {r.notes && (
                      <div className="mt-1 text-xs italic text-muted-foreground">
                        {r.notes}
                      </div>
                    )}
                  </div>
                  <div className="font-display text-lg font-semibold tabular-nums text-foreground">
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

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-3xl font-semibold tabular-nums leading-none ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
