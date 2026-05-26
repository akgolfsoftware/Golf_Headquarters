/**
 * <RunderInline> — inline runder-content for Analysere-tab.
 * Liste over siste runder med dato, kurs, score, SG.
 */

import Link from "next/link";
import { ArrowUpRight, Flag } from "lucide-react";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function RunderInline({ userId }: { userId: string }) {
  const runder = await prisma.round.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: 10,
    include: { course: { select: { name: true, par: true } } },
  });

  if (runder.length === 0) {
    return <TomTilstand />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Siste {runder.length} runder
        </h3>
        <Link
          href="/portal/mal/runder"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:gap-2"
        >
          Alle runder
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
                Bane
              </th>
              <th className="px-2 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Par
              </th>
              <th className="px-2 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Score
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                SG
              </th>
            </tr>
          </thead>
          <tbody>
            {runder.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border/50 last:border-b-0"
              >
                <td className="px-4 py-2 text-foreground">
                  {NB_DATE.format(r.playedAt)}
                </td>
                <td className="px-2 py-2 text-foreground">{r.course.name}</td>
                <td className="px-2 py-2 text-right font-mono tabular-nums text-muted-foreground">
                  {r.course.par}
                </td>
                <td className="px-2 py-2 text-right font-mono font-semibold tabular-nums">
                  {r.score}
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums">
                  {formaterSg(r.sgTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TomTilstand() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <Flag className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">
        Ingen runder loggført
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Logg første runde for å bygge opp historikk.
      </p>
      <Link
        href="/portal/ny-okt?type=runde"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Logg første runde
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
      </Link>
    </div>
  );
}

function formaterSg(v: number | null): string {
  if (v === null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}`;
}
