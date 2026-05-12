import Link from "next/link";
import { Trophy } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Turneringer"
        titleLead="Turnerings"
        titleItalic="kalender"
        sub={`${tournaments.length} totalt · ${kommende.length} kommende · ${tidligere.length} ferdige.`}
        actions={<TournamentForm courses={courses} triggerLabel="+ Ny turnering" />}
      />

      {tournaments.length === 0 ? (
        <EmptyState
          icon={Trophy}
          titleItalic="Ingen turneringer"
          titleTrail="registrert"
          sub="Opprett turnering for å spore påmeldte, lagoppstilling og resultater."
        />
      ) : (
        <>
          {kommende.length > 0 && (
            <section>
              <h3 className="mb-4 font-display text-lg font-semibold tracking-tight">
                Kommende{" "}
                <span className="font-normal text-muted-foreground">({kommende.length})</span>
              </h3>
              <ul className="space-y-2">
                {kommende.map((t) => (
                  <TurneringRad key={t.id} tournament={t} kommende />
                ))}
              </ul>
            </section>
          )}

          {tidligere.length > 0 && (
            <section>
              <h3 className="mb-4 font-display text-lg font-semibold tracking-tight">
                Tidligere{" "}
                <span className="font-normal text-muted-foreground">({tidligere.length})</span>
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

function TurneringRad({
  tournament,
  kommende = false,
}: {
  tournament: TournamentRow;
  kommende?: boolean;
}) {
  return (
    <li
      className={`flex flex-wrap items-center gap-4 rounded-md border bg-card p-4 ${
        kommende ? "border-primary/30" : "border-border"
      }`}
    >
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
      <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {tournament.format}
      </span>
      <span className="ml-auto font-mono text-xs text-muted-foreground">
        {tournament._count.results}{" "}
        {tournament._count.results === 1 ? "deltaker" : "deltakere"}
      </span>
    </li>
  );
}
