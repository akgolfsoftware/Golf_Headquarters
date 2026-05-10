import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TournamentForm } from "./tournament-form";

export default async function Turneringer() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [tournaments, courses] = await Promise.all([
    prisma.tournament.findMany({
      include: {
        course: { select: { name: true } },
        _count: { select: { results: true } },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.courseDefinition.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const idag = new Date();
  const kommende = tournaments.filter((t) => t.startDate >= idag);
  const tidligere = tournaments.filter((t) => t.startDate < idag);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Turneringer
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">Turnerings</em>-kalender
          </h1>
        </div>
        <TournamentForm courses={courses} triggerLabel="+ Ny turnering" />
      </header>

      {tournaments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen turneringer registrert ennå.
        </div>
      ) : (
        <>
          {kommende.length > 0 && (
            <section>
              <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
                Kommende ({kommende.length})
              </h3>
              <ul className="space-y-2">
                {kommende.map((t) => (
                  <TurneringRad key={t.id} tournament={t} />
                ))}
              </ul>
            </section>
          )}

          {tidligere.length > 0 && (
            <section>
              <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
                Tidligere ({tidligere.length})
              </h3>
              <ul className="space-y-2">
                {tidligere.slice(0, 20).map((t) => (
                  <TurneringRad key={t.id} tournament={t} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

type TournamentRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  format: string;
  course: { name: string } | null;
  _count: { results: number };
};

function TurneringRad({ tournament }: { tournament: TournamentRow }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
      <Link
        href={`/admin/tournaments/${tournament.id}`}
        className="font-medium text-foreground hover:text-primary"
      >
        {tournament.name}
      </Link>
      {tournament.course && (
        <span className="text-sm text-muted-foreground">
          · {tournament.course.name}
        </span>
      )}
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {tournament.startDate.toLocaleDateString("nb-NO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </span>
      <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {tournament.format}
      </span>
      <span className="ml-auto font-mono text-xs text-muted-foreground">
        {tournament._count.results} deltakere
      </span>
    </li>
  );
}
