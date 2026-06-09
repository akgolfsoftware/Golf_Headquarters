import Link from "next/link";
import { notFound } from "next/navigation";
import { ListChecks, Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard } from "@/components/ui";
import { AthleticBadge } from "@/components/athletic";
import { TournamentForm } from "../tournament-form";
import { ResultForm } from "./result-form";
import { UnmergeBanner } from "./unmerge-banner";
import {
  TournamentEnrollModal,
  PriorityPill,
} from "@/components/coachhq/tournament-enroll-modal";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

export default async function TurneringDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [tournament, courses, players, entries] = await Promise.all([
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
      select: { id: true, name: true, hcp: true, tier: true },
    }),
    prisma.tournamentEntry.findMany({
      where: { tournamentId: id },
      include: {
        user: { select: { id: true, name: true, hcp: true, tier: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!tournament) notFound();

  // Hvis turneringen er slått sammen (dublett), hent navnet på mål-turneringen
  // slik at vi kan vise en "opphev sammenslåing"-banner øverst.
  const mergedInto = tournament.mergedIntoId
    ? await prisma.tournament.findUnique({
        where: { id: tournament.mergedIntoId },
        select: { name: true },
      })
    : null;

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
    <DetailShell
      breadcrumb={[
        { label: "Turneringer", href: "/admin/tournaments" },
        { label: tournament.name },
      ]}
      backHref="/admin/tournaments"
      title={
        <>
          <em className="text-primary italic">{titleLead}</em>
          {titleTrail && ` ${titleTrail}`}
        </>
      }
      subtitle={`${periodStr}${tournament.course ? ` · ${tournament.course.name}` : ""} · ${tournament.format}`}
      statusPill={
        <AthleticBadge variant="neutral">{tournament.format}</AthleticBadge>
      }
      actions={
        <>
          <TournamentEnrollModal
            tournamentId={tournament.id}
            tournamentName={tournament.name}
            tournamentDate={periodStr}
            players={players.map((p) => ({
              id: p.id,
              name: p.name ?? "(uten navn)",
              hcp: p.hcp,
              tier: p.tier,
            }))}
            existing={entries.map((e) => ({
              entryId: e.id,
              userId: e.userId,
              name: e.user.name ?? "(uten navn)",
              hcp: e.user.hcp,
              tier: e.user.tier,
              priority: e.priority,
            }))}
            triggerLabel={entries.length === 0 ? "+ Meld på" : "+ Legg til"}
          />
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
        </>
      }
      kpiRow={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <KPICard
            eyebrow="Påmeldte"
            value={String(entries.length)}
            variant="hero"
            footnote="spillere"
          />
          <KPICard
            eyebrow="Resultater"
            value={String(tournament.results.length)}
            variant="default"
            footnote="registrert"
          />
          <KPICard
            eyebrow="Format"
            value={tournament.format}
            variant="default"
          />
          <KPICard
            eyebrow="Dato"
            value={periodStr}
            variant="default"
          />
        </div>
      }
    >
      {tournament.mergedIntoId && (
        <UnmergeBanner
          sourceId={tournament.id}
          targetName={mergedInto?.name ?? null}
        />
      )}

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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/30 px-4 py-1 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-foreground">
                    {TOUR_LABEL[meta.tour] ?? meta.tour}
                  </span>
                )}
                {meta.krets && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1 font-mono text-xs text-muted-foreground">
                    Krets · {meta.krets}
                  </span>
                )}
                {Array.isArray(meta.categories) && meta.categories.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1 font-mono text-xs text-muted-foreground">
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

      {/* Påmeldte spillere */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Påmeldte{" "}
            <span className="font-normal text-muted-foreground">
              ({entries.length})
            </span>
          </h2>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon={Users}
            titleItalic="Ingen påmeldte"
            titleTrail="spillere"
            sub="Klikk «Meld på spillere» øverst for rask multi-select-påmelding."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <ul className="divide-y divide-border">
              {entries.map((e) => {
                const navn = e.user.name ?? "(uten navn)";
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
                      style={{ background: avatarBg(navn) }}
                      aria-hidden="true"
                    >
                      {initialsFromName(navn)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/elever/${e.userId}`}
                        className="block truncate text-sm font-medium text-foreground hover:text-primary"
                      >
                        {navn}
                      </Link>
                      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        HCP {e.user.hcp ?? "—"} · {e.user.tier}
                      </div>
                    </div>
                    <PriorityPill priority={e.priority} />
                    <Link
                      href={`/admin/elever/${e.userId}`}
                      className="font-mono text-[10px] uppercase tracking-[0.06em] text-primary hover:underline"
                    >
                      Profil →
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

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
    </DetailShell>
  );
}
