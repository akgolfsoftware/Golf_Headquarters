/**
 * <DrillsInline> — inline drills-content for Planlegge-tab.
 * Viser drills i ukens treningsplan + populære drills.
 */

import Link from "next/link";
import { ArrowUpRight, Dumbbell, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

export async function DrillsInline({ userId }: { userId: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [ukensDrills, populaere] = await Promise.all([
    prisma.trainingDrillV2.findMany({
      where: {
        session: {
          studentId: userId,
          startTime: { gte: today, lte: in7 },
        },
      },
      orderBy: { sortOrder: "asc" },
      take: 12,
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        repetitions: true,
        pyramide: true,
        omraade: true,
        session: {
          select: { title: true, startTime: true },
        },
      },
    }),
    prisma.drillMal.findMany({
      where: { erGlobal: true },
      orderBy: [{ bruktAntall: "desc" }],
      take: 6,
      select: {
        id: true,
        navn: true,
        kategori: true,
        pyramide: true,
        bruktAntall: true,
        erFavoritt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Ukens drills */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Drills i ukens økter
          </h3>
          <Link
            href="/portal/drills"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:gap-2"
          >
            Hele biblioteket
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>

        {ukensDrills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <Dumbbell className="mx-auto h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-2 text-sm text-muted-foreground">
              Ingen drills planlagt denne uken.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ukensDrills.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
                    {d.pyramide}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {d.session?.startTime
                      ? NB_DATE.format(d.session.startTime)
                      : "—"}
                  </span>
                </div>
                <h4 className="mt-1 font-display text-base font-semibold tracking-tight">
                  {d.name}
                </h4>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {d.session?.title}
                  {d.omraade && ` · ${d.omraade}`}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[12px] text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {d.durationMinutes} min
                  </span>
                  {d.repetitions && (
                    <span className="font-mono tabular-nums">
                      × {d.repetitions}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Populære drills fra global pool */}
      {populaere.length > 0 && (
        <section>
          <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Populære drills
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {populaere.map((d) => (
              <Link
                key={d.id}
                href={`/portal/drills/${d.id}`}
                className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
                    {d.pyramide}
                  </span>
                  {d.erFavoritt && (
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={1.5} />
                  )}
                </div>
                <h4 className="mt-1 font-display text-base font-semibold tracking-tight">
                  {d.navn}
                </h4>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {d.kategori}
                </p>
                <p className="mt-2 font-mono text-[10px] tabular-nums text-muted-foreground">
                  Brukt {d.bruktAntall} ganger
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
