import Link from "next/link";
import { notFound } from "next/navigation";
import { ListChecks } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
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

  const startStr = tournament.startDate.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const endStr = tournament.endDate
    ? tournament.endDate.toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;
  const periodStr = endStr ? `${startStr} – ${endStr}` : startStr;

  const titleParts = tournament.name.split(" ");
  const titleLead = titleParts[0];
  const titleTrail = titleParts.slice(1).join(" ");

  return (
    <div className="space-y-8">
      {/* Tournament-hero på mørk bakgrunn, matcher klubb-lagoppstilling-demo */}
      <section className="overflow-hidden rounded-2xl border border-border bg-[#0A1F17] p-8 text-[#F5F4EE]">
        <Link
          href="/admin/tournaments"
          className="font-mono text-[10px] uppercase tracking-[0.10em] text-accent hover:opacity-80"
        >
          ← CoachHQ · Turneringer
        </Link>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
              {tournament.format}
              {tournament.course && ` · ${tournament.course.name}`}
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold italic leading-tight tracking-tight">
              <em className="font-normal italic text-accent">{titleLead}</em>
              {titleTrail && ` ${titleTrail}`}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-6 font-mono text-[11px] tracking-[0.04em] text-[rgba(245,244,238,0.6)]">
              <span>
                Når: <b className="font-medium text-white">{periodStr}</b>
              </span>
              {tournament.course && (
                <span>
                  Bane: <b className="font-medium text-white">{tournament.course.name}</b>
                </span>
              )}
              <span>
                Deltakere:{" "}
                <b className="font-medium text-white">{tournament.results.length}</b>
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
        </div>
      </section>

      {tournament.notes && (() => {
        // Forsøk å parse som tour-metadata JSON
        try {
          const meta = JSON.parse(tournament.notes);
          if (meta && typeof meta === "object" && (meta.tour || meta.externalId)) {
            const TOUR_LABEL: Record<string, string> = {
              olyo: "Olyo Juniortour",
              srixon: "Srixon Tour",
              ostlandstour: "Titleist Østlandstour",
              garmin: "Garmin Norges Cup",
            };
            return (
              <div className="flex flex-wrap gap-2">
                {meta.tour && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/30 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-foreground">
                    {TOUR_LABEL[meta.tour] ?? meta.tour}
                  </span>
                )}
                {meta.krets && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
                    Krets · {meta.krets}
                  </span>
                )}
                {Array.isArray(meta.categories) && meta.categories.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
                    {meta.categories.length} kategori{meta.categories.length === 1 ? "" : "er"}
                  </span>
                )}
              </div>
            );
          }
        } catch {
          // Ikke JSON — vis som vanlig notat
        }
        return (
          <div className="rounded-lg border border-border bg-card p-6 text-sm whitespace-pre-wrap text-foreground">
            {tournament.notes}
          </div>
        );
      })()}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Resultater{" "}
            <span className="font-normal text-muted-foreground">
              ({tournament.results.length})
            </span>
          </h2>
          <ResultForm
            tournamentId={tournament.id}
            players={players.map((p) => ({ id: p.id, name: p.name ?? "(uten navn)" }))}
            triggerLabel="+ Nytt resultat"
          />
        </div>

        {tournament.results.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            titleItalic="Ingen resultater"
            titleTrail="registrert"
            sub="Klikk «+ Nytt resultat» øverst for å legge til en spillerplassering og score."
          />
        ) : (
          <ul className="space-y-2">
            {tournament.results.map((r) => {
              const initial = (r.user.name ?? "?").trim().charAt(0).toUpperCase();
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-card p-4"
                >
                  {r.position != null ? (
                    <span className="grid h-8 w-10 shrink-0 place-items-center rounded-md bg-accent/20 font-mono text-xs font-semibold text-accent-foreground">
                      #{r.position}
                    </span>
                  ) : (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
                      {initial}
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
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
