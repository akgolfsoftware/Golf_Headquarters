/**
 * <TesterInline> — inline tester-content for Analysere-tab.
 * Liste over siste TestResult med dato, test, score.
 */

import Link from "next/link";
import { ArrowUpRight, TestTube } from "lucide-react";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function TesterInline({ userId }: { userId: string }) {
  const [siste, total] = await Promise.all([
    prisma.testResult.findMany({
      where: { userId },
      orderBy: { takenAt: "desc" },
      take: 10,
      include: { test: { select: { name: true } } },
    }),
    prisma.testResult.count({ where: { userId } }),
  ]);

  if (total === 0) {
    return <TomTilstand />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Kpi label="Totalt antall tester" verdi={total.toString()} />
        <Kpi
          label="Siste test"
          verdi={siste[0] ? NB_DATE.format(siste[0].takenAt) : "—"}
        />
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Siste {siste.length} tester
          </h3>
          <Link
            href="/portal/tren/tester"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:gap-2"
          >
            Alle tester
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Dato
                </th>
                <th className="px-2 py-2 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Test
                </th>
                <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {siste.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="px-4 py-2 text-foreground">
                    {NB_DATE.format(t.takenAt)}
                  </td>
                  <td className="px-2 py-2 text-foreground">{t.test.name}</td>
                  <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums">
                    {t.score.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
        {verdi}
      </p>
    </div>
  );
}

function TomTilstand() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <TestTube className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">
        Ingen tester registrert
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Ta din første ferdighetstest for å sette baseline.
      </p>
      <Link
        href="/portal/tren/tester"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Start test
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
      </Link>
    </div>
  );
}
