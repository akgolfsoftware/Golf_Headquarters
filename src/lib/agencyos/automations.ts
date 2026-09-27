/**
 * AgencyOS Trener-Automatiseringer (AgenticOS / Coach Intelligence)
 *
 * Automatiske rutiner for stallovervåking, svingmilepæler og forberedelse:
 * - Helsekontroll på stallen (stagnerende / inaktive oppgaver)
 * - Automatisk forslag til neste P-posisjon når en milepæl nås
 * - Automatisk kobling mellom turneringskalender og treningsfokus
 */

import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";

export interface StallHealthReport {
  stalledTasksCount: number;
  completedMilestonesCount: number;
  upcomingTournamentsCount: number;
  recommendations: Array<{
    playerId: string;
    playerName: string;
    type: "STAGNATION" | "MILESTONE_REACHED" | "UPCOMING_TOURNAMENT";
    title: string;
    actionDescription: string;
  }>;
}

/**
 * Kjører helsesjekk på coachens stall for å avdekke spillere som trenger oppfølging.
 */
export async function runStallHealthCheck(coachId: string): Promise<StallHealthReport> {
  const playerScope = coachScopedPlayerWhere({ id: coachId, role: "COACH" });
  const players = await prisma.user.findMany({
    where: playerScope,
    select: {
      id: true,
      name: true,
      technicalPlans: {
        where: { status: "ACTIVE" },
        take: 1,
        select: {
          id: true,
          positions: {
            select: {
              pNummer: true,
              tasks: {
                where: { status: { in: ["ACTIVE", "PENDING"] } },
                select: {
                  id: true,
                  tittel: true,
                  trackStatus: true,
                  lastRepLoggedAt: true,
                  tmGoals: {
                    select: { inTarget: true, targetType: true },
                  },
                },
              },
            },
          },
        },
      },
      tournamentEntries: {
        take: 3,
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              startDate: true,
            },
          },
        },
      },
    },
  });

  const recommendations: StallHealthReport["recommendations"] = [];
  let stalledCount = 0;
  let completedCount = 0;
  let upcomingCount = 0;

  const fjortenDagerSiden = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  for (const player of players) {
    const activePlan = player.technicalPlans[0];
    if (activePlan) {
      for (const pos of activePlan.positions) {
        for (const task of pos.tasks) {
          // 1. Sjekk for stagnerende/inaktive oppgaver
          if (
            task.trackStatus === "STAGNERER" ||
            task.trackStatus === "INAKTIV" ||
            (task.lastRepLoggedAt && task.lastRepLoggedAt < fjortenDagerSiden)
          ) {
            stalledCount++;
            recommendations.push({
              playerId: player.id,
              playerName: player.name ?? "Spiller",
              type: "STAGNATION",
              title: `Stagnerende fremdrift i ${pos.pNummer}: ${task.tittel}`,
              actionDescription: `Ingen fremgang siste 14 dager på ${player.name}. Juster reps-mål eller vurder annen drill.`,
            });
          }

          // 2. Sjekk for fullførte TM-mål
          const tmNonHitRate = task.tmGoals.filter(
            (g: { targetType: string; inTarget: boolean }) => g.targetType !== "HIT_RATE",
          );
          if (
            tmNonHitRate.length > 0 &&
            tmNonHitRate.every((g: { inTarget: boolean }) => g.inTarget)
          ) {
            completedCount++;
            recommendations.push({
              playerId: player.id,
              playerName: player.name ?? "Spiller",
              type: "MILESTONE_REACHED",
              title: `TrackMan-mål nådd i ${pos.pNummer}: ${task.tittel}`,
              actionDescription: `Data bekrefter at ${player.name} er i mål på ${pos.pNummer}. Godkjenn milepælen og lås opp neste ledd.`,
            });
          }
        }
      }
    }

    // 3. Kommende turneringer
    if (player.tournamentEntries && player.tournamentEntries.length > 0) {
      for (const entry of player.tournamentEntries) {
        if (!entry.tournament) continue;
        const tourn = entry.tournament;
        upcomingCount++;
        recommendations.push({
          playerId: player.id,
          playerName: player.name ?? "Spiller",
          type: "UPCOMING_TOURNAMENT",
          title: `Turnering: ${tourn.name}`,
          actionDescription: `${player.name} er påmeldt ${tourn.name} (${tourn.startDate.toLocaleDateString("nb-NO")}). Kontroller banestrategi og slagspredning.`,
        });
      }
    }
  }

  return {
    stalledTasksCount: stalledCount,
    completedMilestonesCount: completedCount,
    upcomingTournamentsCount: upcomingCount,
    recommendations,
  };
}
