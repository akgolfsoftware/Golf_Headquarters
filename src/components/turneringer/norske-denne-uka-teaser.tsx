/**
 * Kompakt "Nordmenn denne uka"-teaser for forsiden.
 * Henter data server-side fra DB (oppdatert via cron).
 * Returnerer null hvis ingen er aktive — siden skjuler seksjonen.
 */

import Link from "next/link";
import { Flag, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export async function NorskeDenneUkaTeaser() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const entries = await prisma.publicPlayerEntry.findMany({
    where: {
      player: { country: "NO" },
      tournament: {
        startDate: { gte: today, lte: in7 },
        status: { in: ["UPCOMING", "IN_PROGRESS"] },
      },
    },
    include: {
      player: { select: { name: true, slug: true, tier: true } },
      tournament: {
        select: {
          name: true,
          slug: true,
          startDate: true,
          tour: true,
          status: true,
        },
      },
    },
    orderBy: [{ position: "asc" }, { tournament: { startDate: "asc" } }],
    take: 6,
  });

  if (entries.length === 0) return null;

  // Tell unike turneringer
  const turneringer = new Set(entries.map((e) => e.tournament.name));

  return (
    <section className="border-y border-border bg-accent/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            <Flag className="mr-2 inline-block h-5 w-5 text-primary" strokeWidth={2} />
            Norske golfere{" "}
            <em className="font-display font-normal italic text-primary">
              denne uka
            </em>
          </h2>
          <Link
            href="/turneringer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2"
          >
            Hele oversikten
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>

        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
          {entries.length} {entries.length === 1 ? "spiller" : "spillere"} i{" "}
          {turneringer.size}{" "}
          {turneringer.size === 1 ? "turnering" : "turneringer"} — oppdateres
          automatisk hver dag.
        </p>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <li key={e.id}>
              <Link
                href={
                  e.tournament.slug
                    ? `/turneringer/${e.tournament.slug}`
                    : "/turneringer"
                }
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold tracking-tight">
                    {e.player.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {e.tournament.name}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {formaterTour(e.tournament.tour)} ·{" "}
                    {NB_DATE.format(e.tournament.startDate)}
                  </p>
                </div>
                {e.tournament.status === "IN_PROGRESS" &&
                  e.scoreToPar !== null && (
                    <span
                      className={`font-display text-xl font-semibold tabular-nums ${
                        e.scoreToPar < 0
                          ? "text-primary"
                          : e.scoreToPar > 0
                            ? "text-destructive"
                            : "text-foreground"
                      }`}
                    >
                      {e.scoreToPar > 0
                        ? `+${e.scoreToPar}`
                        : e.scoreToPar === 0
                          ? "E"
                          : e.scoreToPar}
                    </span>
                  )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function formaterTour(t: string | null): string {
  switch (t) {
    case "pga": return "PGA Tour";
    case "euro": return "DP World Tour";
    case "kft": return "Korn Ferry";
    case "alt": return "Alt-tour";
    case "lpga": return "LPGA";
    case "let": return "LET";
    case "amateur-no": return "Norge · Amatør";
    case "junior-no": return "Norge · Junior";
    default: return "Turnering";
  }
}
