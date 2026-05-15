/**
 * PlayerHQ · Trening · Årsplan
 *
 * Hierarkisk sesongplanlegger:
 *   Årsplan → PeriodBlokker (LPhase) → Turneringer
 *
 * Tidslinje viser periodisering visuelt jan–des.
 */

import Link from "next/link";
import { CalendarDays, Trophy } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import {
  AarsplanInteraktiv,
  OpprettSesonPlanSkjema,
  type SeasonPlanData,
} from "./aarsplan-interaktiv";

export default async function AarsplanPage() {
  const user = await requirePortalUser();

  const ar = new Date().getFullYear();

  const sesongplan = await prisma.seasonPlan.findFirst({
    where: { userId: user.id, year: ar },
    include: {
      periodBlocks: { orderBy: { startDate: "asc" } },
      tournamentEntries: {
        orderBy: { manualDate: "asc" },
        include: { tournament: { select: { name: true, startDate: true } } },
        take: 5,
      },
    },
  });

  const antallTurneringer = sesongplan?.tournamentEntries.length ?? 0;

  const plan: SeasonPlanData | null = sesongplan
    ? {
        id: sesongplan.id,
        year: sesongplan.year,
        name: sesongplan.name,
        startDate: sesongplan.startDate,
        endDate: sesongplan.endDate,
        periodBlocks: sesongplan.periodBlocks,
      }
    : null;

  const fornavn = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="mb-8">
          <PageHeader
            eyebrow="PlayerHQ · Trening · Årsplan"
            titleLead="Årsplan"
            titleItalic={String(ar)}
            sub={
              plan
                ? `${plan.periodBlocks.length} perioder · ${antallTurneringer} turneringer planlagt, ${fornavn}.`
                : `Ingen sesongplan for ${ar} enda, ${fornavn}. Opprett en for å starte planleggingen.`
            }
          />
        </div>

        {/* Ingen sesongplan → tom-tilstand */}
        {!plan && (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <CalendarDays
              className="mx-auto h-12 w-12 text-muted-foreground"
              strokeWidth={1}
            />
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
              Ingen sesongplan for {ar}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-[1.6] text-muted-foreground">
              En sesongplan hjelper deg å strukturere hele treningsåret med
              Mac O&apos;Grady-faser, volummål og turneringsplan.
            </p>
            <div className="mt-8 flex justify-center">
              <OpprettSesonPlanSkjema year={ar} />
            </div>
          </div>
        )}

        {/* Sesongplan funnet */}
        {plan && (
          <>
            <AarsplanInteraktiv plan={plan} />

            {/* Turneringer-lenke */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Turneringsplan
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {antallTurneringer === 0
                      ? "Ingen turneringer planlagt enda"
                      : `${antallTurneringer} turneringer i sesongplanen`}
                  </div>
                </div>
              </div>
              <Link
                href="/portal/tren/turneringer"
                className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-foreground/10"
              >
                Se turneringsplan
              </Link>
            </div>

            {/* Turneringsliste-forhåndsvisning */}
            {sesongplan && sesongplan.tournamentEntries.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border px-6 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Neste turneringer
                </div>
                <div className="divide-y divide-border">
                  {sesongplan.tournamentEntries.slice(0, 3).map((e) => {
                    const navn = e.tournament?.name ?? e.manualName ?? "Manuell turnering";
                    const dato = e.tournament?.startDate ?? e.manualDate;
                    return (
                      <div key={e.id} className="flex items-center gap-4 px-6 py-3">
                        <Trophy className="h-4 w-4 flex-none text-muted-foreground" strokeWidth={1.5} />
                        <span className="flex-1 text-sm font-medium text-foreground">{navn}</span>
                        {dato && (
                          <span className="font-mono text-xs tabular-nums text-muted-foreground">
                            {dato.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
                            e.priority === "MAJOR"
                              ? "bg-primary/10 text-primary"
                              : e.priority === "LOCAL"
                              ? "bg-secondary text-muted-foreground"
                              : "bg-accent/10 text-accent-foreground"
                          }`}
                        >
                          {e.priority === "MAJOR" ? "Trening" : e.priority === "LOCAL" ? "Prestasjon" : "Utvikling"}
                        </span>
                      </div>
                    );
                  })}
                  {sesongplan.tournamentEntries.length > 3 && (
                    <div className="px-6 py-3">
                      <Link
                        href="/portal/tren/turneringer"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Se alle {sesongplan.tournamentEntries.length} turneringer
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
