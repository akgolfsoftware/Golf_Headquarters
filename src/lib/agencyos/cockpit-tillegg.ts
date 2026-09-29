/**
 * Tillegg til Cockpit (AG-01) i Precision Athletics som loadDailyBrief ikke
 * leverer: «Følger ikke planen» og «Turneringer denne uka».
 *
 * Bare lesing av eksisterende felt, i coachens spillerskop
 * (coachScopedPlayerWhere). Ingen nye tabeller, ingen skjemaendring.
 *
 * «Følger ikke planen» (beslutninger.md §SKJERMENE … RUNDE 8, 28.09.2026):
 * de to siste hele ukene, gjennomført tid mot planlagt tid (adherencePct —
 * minutter, bare forfalte økter). Med når begge ukene er under 70 %
 * («under 70 % av plan to uker på rad»). Mangler en uke plan, er spilleren
 * ikke med — ingen prosent uten nevner.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { startOfWeek, endOfWeek, ukenummer } from "@/lib/uke-helpers";
import type { UserRole } from "@/generated/prisma/client";
import { velgUtenforPlan, dagerMellom, type CockpitTillegg, type CockpitTurnering } from "./cockpit-tillegg-regler";

export type { CockpitTillegg, CockpitTurnering, UtenforPlanRad } from "./cockpit-tillegg-regler";

const DAG_MS = 86_400_000;

export async function lastCockpitTillegg(coach: { id: string; role: UserRole }): Promise<CockpitTillegg> {
  const naa = new Date();
  const denneUka = startOfWeek(naa);
  const ukeSlutt = endOfWeek(naa);
  const forrigeUke = new Date(denneUka.getTime() - 7 * DAG_MS);
  const ukeFor = new Date(denneUka.getTime() - 14 * DAG_MS);
  const scope = coachScopedPlayerWhere(coach);

  const [okter, entries] = await Promise.all([
    prisma.trainingPlanSession.findMany({
      where: { scheduledAt: { gte: ukeFor, lt: denneUka }, plan: { user: scope } },
      select: {
        scheduledAt: true,
        durationMin: true,
        status: true,
        plan: { select: { userId: true, user: { select: { name: true } } } },
      },
    }),
    prisma.tournamentEntry.findMany({
      where: {
        entryStatus: { not: "WITHDRAWN" },
        user: scope,
        OR: [
          { tournament: { startDate: { gte: denneUka, lt: ukeSlutt } } },
          { tournament: { endDate: { gte: denneUka, lt: ukeSlutt } } },
          { tournamentId: null, manualDate: { gte: denneUka, lt: ukeSlutt } },
        ],
      },
      select: {
        id: true,
        manualName: true,
        manualDate: true,
        user: { select: { name: true } },
        tournament: { select: { name: true, startDate: true, location: true, course: { select: { name: true } } } },
      },
      take: 20,
    }),
  ]);

  const utenforPlan = velgUtenforPlan(
    okter.map((o) => ({
      userId: o.plan.userId,
      navn: o.plan.user.name ?? "Spiller",
      scheduledAt: o.scheduledAt,
      durationMin: o.durationMin,
      status: o.status,
    })),
    forrigeUke,
    naa,
  );

  const turneringer: CockpitTurnering[] = entries
    .map((e) => {
      const start = e.tournament?.startDate ?? e.manualDate;
      if (!start) return null;
      return {
        id: e.id,
        hvem: e.user.name ?? "Spiller",
        navn: e.tournament?.name ?? e.manualName ?? "Turnering uten navn",
        sted: e.tournament ? (e.tournament.course?.name ?? (e.tournament.location || null)) : null,
        dagerTil: dagerMellom(naa, start),
      };
    })
    .filter((t): t is CockpitTurnering => t != null)
    .sort((a, b) => a.dagerTil - b.dagerTil || a.hvem.localeCompare(b.hvem, "nb"));

  return {
    utenforPlan,
    utenforPlanUker: `UKE ${ukenummer(ukeFor)}–${ukenummer(forrigeUke)}`,
    turneringer,
  };
}
