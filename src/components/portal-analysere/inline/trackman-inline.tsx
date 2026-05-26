/**
 * <TrackManInline> — inline TrackMan-content for Analysere-tab.
 * Liste over siste sessions med dato, antall slag, miljø.
 */

import Link from "next/link";
import { ArrowUpRight, Wifi } from "lucide-react";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export async function TrackManInline({ userId }: { userId: string }) {
  const now = new Date();
  const trettiagSiden = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [siste, total, siste30] = await Promise.all([
    prisma.trackManSession.findMany({
      where: { userId },
      orderBy: { recordedAt: "desc" },
      take: 8,
      select: {
        id: true,
        recordedAt: true,
        shotCount: true,
        environment: true,
      },
    }),
    prisma.trackManSession.count({ where: { userId } }),
    prisma.trackManSession.count({
      where: { userId, recordedAt: { gte: trettiagSiden } },
    }),
  ]);

  if (total === 0) {
    return <TomTilstand />;
  }

  const totalShots = siste.reduce((s, x) => s + x.shotCount, 0);

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Kpi label="Totalt antall økter" verdi={total.toString()} />
        <Kpi label="Siste 30 dager" verdi={siste30.toString()} />
        <Kpi
          label="Slag siste 8 økter"
          verdi={totalShots.toString()}
        />
      </div>

      {/* Liste */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Siste økter
          </h3>
          <Link
            href="/portal/trackman"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:gap-2"
          >
            Full TrackMan
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
                  Miljø
                </th>
                <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Antall slag
                </th>
              </tr>
            </thead>
            <tbody>
              {siste.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="px-4 py-2 text-foreground">
                    {NB_DATE.format(s.recordedAt)}
                  </td>
                  <td className="px-2 py-2 text-muted-foreground">
                    {s.environment ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums">
                    {s.shotCount}
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
      <Wifi className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">
        Ingen TrackMan-data ennå
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Importer fra TrackMan-app eller logg en økt manuelt.
      </p>
      <Link
        href="/portal/trackman"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Åpne TrackMan
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
      </Link>
    </div>
  );
}
