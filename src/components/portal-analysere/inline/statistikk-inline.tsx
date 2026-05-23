/**
 * <StatistikkInline> — inline statistikk-content for Analysere-tab.
 * Viser score-snitt og SG-snitt for siste 10/30/90 dager.
 */

import Link from "next/link";
import { ArrowUpRight, BarChart3, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

export async function StatistikkInline({ userId }: { userId: string }) {
  const today = new Date();
  const d10 = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
  const d30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const d90 = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [siste10, siste30, siste90, sisteRunde] = await Promise.all([
    prisma.round.findMany({
      where: { userId, playedAt: { gte: d10 } },
      select: { score: true, sgTotal: true },
    }),
    prisma.round.findMany({
      where: { userId, playedAt: { gte: d30 } },
      select: { score: true, sgTotal: true },
    }),
    prisma.round.findMany({
      where: { userId, playedAt: { gte: d90 } },
      select: { score: true, sgTotal: true },
    }),
    prisma.round.findFirst({
      where: { userId },
      orderBy: { playedAt: "desc" },
      include: { course: { select: { name: true, par: true } } },
    }),
  ]);

  if (siste90.length === 0) {
    return <TomTilstand />;
  }

  const periods = [
    { label: "Siste 10 dager", runder: siste10 },
    { label: "Siste 30 dager", runder: siste30 },
    { label: "Siste 90 dager", runder: siste90 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI-rad */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {periods.map((p) => (
          <div
            key={p.label}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              {p.label} · {p.runder.length} runder
            </p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
              {snittScore(p.runder)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Snittscore
            </p>
          </div>
        ))}
      </div>

      {/* Detalj-tabell */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Score + SG-snitt
          </h3>
          <Link
            href="/portal/statistikk"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:gap-2"
          >
            Full statistikk
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Periode
                </th>
                <th className="px-2 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Runder
                </th>
                <th className="px-2 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Snittscore
                </th>
                <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  SG total
                </th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr
                  key={p.label}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="px-4 py-2 text-foreground">{p.label}</td>
                  <td className="px-2 py-2 text-right font-mono tabular-nums">
                    {p.runder.length}
                  </td>
                  <td className="px-2 py-2 text-right font-mono tabular-nums">
                    {snittScore(p.runder)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums">
                    {snittSg(p.runder)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {sisteRunde && (
        <section>
          <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Siste runde
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">
                {sisteRunde.course.name}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {NB_DATE.format(sisteRunde.playedAt)} · Par {sisteRunde.course.par}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Score
              </p>
              <p className="font-display text-2xl font-semibold tabular-nums">
                {sisteRunde.score}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function TomTilstand() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
        Ingen runder loggført
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Logg første runde for å se score-trender og statistikk.
      </p>
      <Link
        href="/portal/ny-okt?type=runde"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Logg første runde
        <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
      </Link>
    </div>
  );
}

function snittScore(runder: { score: number | null }[]): string {
  const valid = runder.map((r) => r.score).filter((s): s is number => s !== null);
  if (valid.length === 0) return "—";
  return (valid.reduce((s, x) => s + x, 0) / valid.length).toFixed(1);
}

function snittSg(runder: { sgTotal: number | null }[]): string {
  const valid = runder
    .map((r) => r.sgTotal)
    .filter((s): s is number => s !== null);
  if (valid.length === 0) return "—";
  const avg = valid.reduce((s, x) => s + x, 0) / valid.length;
  const sign = avg > 0 ? "+" : "";
  return `${sign}${avg.toFixed(2)}`;
}
