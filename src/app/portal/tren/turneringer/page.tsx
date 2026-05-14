/**
 * PlayerHQ · Trening · Turneringsplan
 *
 * Liste over TournamentEntry for brukeren — fra katalogen eller manuelt.
 * Kobles mot SeasonPlan og Tournament-katalogen (admin-data).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import {
  TurneringerInteraktiv,
  type TurnEntry,
  type TurneringKatalog,
  type SesonPlanOption,
} from "./turneringer-interaktiv";

export default async function TurneringerPage() {
  const user = await requirePortalUser();

  const [entries, turneringer, sesongplaner] = await Promise.all([
    prisma.tournamentEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        tournament: { select: { name: true, startDate: true } },
      },
    }),
    prisma.tournament.findMany({
      orderBy: { startDate: "asc" },
      select: { id: true, name: true, startDate: true, endDate: true },
    }),
    prisma.seasonPlan.findMany({
      where: { userId: user.id },
      orderBy: { year: "desc" },
      select: { id: true, year: true, name: true },
    }),
  ]);

  const fornavn = user.name.split(" ")[0];
  const antall = entries.length;

  const typedEntries: TurnEntry[] = entries.map((e) => ({
    id: e.id,
    priority: e.priority,
    category: e.category,
    notes: e.notes,
    tournamentId: e.tournamentId,
    manualName: e.manualName,
    manualDate: e.manualDate,
    manualEndDate: e.manualEndDate,
    tournament: e.tournament,
    seasonPlanId: e.seasonPlanId,
  }));

  const katalog: TurneringKatalog[] = turneringer.map((t) => ({
    id: t.id,
    name: t.name,
    startDate: t.startDate ?? null,
    endDate: t.endDate ?? null,
  }));

  const sesongplanerOptions: SesonPlanOption[] = sesongplaner.map((p) => ({
    id: p.id,
    year: p.year,
    name: p.name,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="mb-8">
          <PageHeader
            eyebrow="PlayerHQ · Trening · Turneringsplan"
            titleLead="Turneringer"
            titleItalic={String(new Date().getFullYear())}
            sub={
              antall === 0
                ? `Ingen turneringer planlagt enda, ${fornavn}. Legg til fra katalogen eller opprett manuell.`
                : `${antall} ${antall === 1 ? "turnering" : "turneringer"} i planen din, ${fornavn}.`
            }
          />
        </div>

        <TurneringerInteraktiv
          entries={typedEntries}
          katalog={katalog}
          sesongplaner={sesongplanerOptions}
        />
      </div>
    </div>
  );
}
