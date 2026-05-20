/**
 * PlayerHQ · Trening · Turneringsplan
 *
 * Liste over TournamentEntry for brukeren — fra katalogen eller manuelt.
 * Kobles mot SeasonPlan og Tournament-katalogen (admin-data).
 */

import { Calendar, Medal } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { AgentStrip } from "@/components/coachhq/agent-strip";
import {
  TurneringerInteraktiv,
  type TurnEntry,
  type TurneringKatalog,
  type SesonPlanOption,
} from "./turneringer-interaktiv";

export default async function TurneringerPage() {
  const user = await requirePortalUser();

  const [entries, turneringer, sesongplaner, resultater] = await Promise.all([
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
    prisma.tournamentResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        tournament: { select: { name: true, startDate: true } },
      },
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
      <div className="mx-auto max-w-[1200px] px-4 py-6 pb-20 md:px-6 md:py-8 md:pb-8">
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

        <div className="mb-6">
          <AgentStrip label="Turnerings-agent">
            Viser {katalog.length} turneringer for {new Date().getFullYear()}-sesongen — kretsmesterskap, Olyo, Srixon og Østlandstour. Filtrer på &quot;Tilgjengelige&quot; for å melde deg på direkte.
          </AgentStrip>
        </div>

        <TurneringerInteraktiv
          entries={typedEntries}
          katalog={katalog}
          sesongplaner={sesongplanerOptions}
        />

        {/* Historiske turneringsresultater */}
        {resultater.length > 0 && (
          <section aria-label="Historiske resultater" className="mt-12">
            <div className="mb-6 flex items-center gap-3">
              <Medal size={20} strokeWidth={1.5} className="text-primary" aria-hidden />
              <h2 className="font-display text-2xl font-medium tracking-tight">
                Historiske resultater
              </h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div
                className="hidden sm:grid border-b border-border bg-secondary px-6 py-4 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
                style={{ gridTemplateColumns: "1fr 160px 80px" }}
              >
                <div>Turnering</div>
                <div>Dato</div>
                <div>Resultat</div>
              </div>
              {resultater.map((r) => {
                const dato = r.tournament?.startDate
                  ? new Date(r.tournament.startDate).toLocaleDateString("nb-NO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <div
                    key={r.id}
                    className="flex flex-col gap-1 border-b border-border px-4 py-4 last:border-b-0 sm:grid sm:items-center sm:gap-4 sm:px-6"
                    style={{ gridTemplateColumns: "1fr 160px 80px" }}
                  >
                    <div>
                      <strong className="block text-sm font-semibold text-foreground">
                        {r.tournament?.name ?? "Ukjent turnering"}
                      </strong>
                      {r.notes && (
                        <span className="font-mono text-xs text-muted-foreground">
                          {r.notes}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                      <Calendar size={14} strokeWidth={1.5} aria-hidden />
                      {dato}
                    </div>
                    <div className="font-mono text-sm font-medium tabular-nums text-foreground">
                      {r.position != null ? `#${r.position}` : "—"}
                      {r.score != null && (
                        <span className="ml-2 text-muted-foreground">
                          ({r.score > 0 ? "+" : ""}{r.score})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
