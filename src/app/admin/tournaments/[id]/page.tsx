import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TournamentForm } from "../tournament-form";
import { ResultForm } from "./result-form";

export default async function TurneringDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [tournament, courses, players] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, name: true } },
        results: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: [{ position: "asc" }, { score: "asc" }],
        },
      },
    }),
    prisma.courseDefinition.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "PLAYER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!tournament) notFound();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/tournaments"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
          >
            ← Turneringer
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">{tournament.name.split(" ")[0]}</em>
            {tournament.name.split(" ").slice(1).join(" ") &&
              " " + tournament.name.split(" ").slice(1).join(" ")}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {tournament.startDate.toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              {tournament.endDate &&
                " – " +
                  tournament.endDate.toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
            </span>
            {tournament.course && <span>· {tournament.course.name}</span>}
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em]">
              {tournament.format}
            </span>
          </div>
        </div>
        <TournamentForm
          initial={{
            id: tournament.id,
            name: tournament.name,
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            courseId: tournament.courseId,
            format: tournament.format,
            notes: tournament.notes,
          }}
          courses={courses.map((c) => ({ id: c.id, name: c.name }))}
          triggerLabel="Endre"
        />
      </header>

      {tournament.notes && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground whitespace-pre-wrap">
          {tournament.notes}
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Resultater ({tournament.results.length})
          </h2>
          <ResultForm
            tournamentId={tournament.id}
            players={players.map((p) => ({ id: p.id, name: p.name ?? "(uten navn)" }))}
            triggerLabel="+ Nytt resultat"
          />
        </div>

        {tournament.results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Ingen resultater registrert. Klikk «+ Nytt resultat» for å legge til.
          </div>
        ) : (
          <ul className="space-y-2">
            {tournament.results.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"
              >
                {r.position != null && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-xs font-semibold text-accent-foreground">
                    #{r.position}
                  </span>
                )}
                <span className="font-medium text-foreground">
                  {r.user.name ?? "(uten navn)"}
                </span>
                {r.score != null && (
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    Score: {r.score}
                  </span>
                )}
                {r.notes && (
                  <span className="text-sm text-muted-foreground">{r.notes}</span>
                )}
                <span className="ml-auto">
                  <ResultForm
                    tournamentId={tournament.id}
                    players={players.map((p) => ({
                      id: p.id,
                      name: p.name ?? "(uten navn)",
                    }))}
                    initial={{
                      id: r.id,
                      userId: r.userId,
                      position: r.position,
                      score: r.score,
                      notes: r.notes,
                    }}
                    triggerLabel="Endre"
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
