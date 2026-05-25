/**
 * Server-helper: getWeekProgress
 *
 * Henter spillerens siste 7 dager med trenings-økter og beregner
 * pyramide-vekting (faktisk vs ideell) + ukens stats.
 *
 * Returnerer props som sendes rett inn i `<WeekProgressCard />`.
 *
 * Brukes av Player Workbench (`/portal/page.tsx` i annen spor) — men
 * komponenten er server-component-vennlig så den kan kalles fra hvilken
 * som helst RSC.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import {
  vurderPyramide,
  type PyramidFordeling,
  type PyramidOkt,
} from "@/lib/domain/pyramid-weighting";
import type { WeekProgressCardProps } from "./week-progress-card";

// Default ideell pyramide hvis spilleren ikke har en aktiv plan med egen fordeling.
// Tallene er hentet fra AK Golf master-konseptet (Bompa-prinsipper).
const DEFAULT_IDEAL: PyramidFordeling = {
  fys: 0.30,
  tek: 0.30,
  slag: 0.25,
  spill: 0.10,
  turn: 0.05,
};

/**
 * Beregner antall dager tilbake (inkludert i dag) — returnerer Date for 00:00.
 */
function startenAvUken(): Date {
  const dato = new Date();
  dato.setDate(dato.getDate() - 6); // 7 dager inklusiv i dag
  dato.setHours(0, 0, 0, 0);
  return dato;
}

export async function getWeekProgress(
  userId: string,
): Promise<WeekProgressCardProps> {
  const fra = startenAvUken();
  const til = new Date();

  // Hent økter (V2-modell) for siste 7 dager — kun fullførte teller for vekting.
  const okter = await prisma.trainingSessionV2.findMany({
    where: {
      studentId: userId,
      startTime: { gte: fra, lte: til },
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      drills: {
        select: {
          pyramide: true,
          durationMinutes: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  // Bygg pyramide-okter: ett innslag per drill (vektet ved at drillen
  // teller én "økt" i fordeling). Dette matcher vurderPyramide-API-et.
  const pyramidOkter: PyramidOkt[] = okter.flatMap((okt) =>
    okt.drills.map((d) => ({ pyramid: d.pyramide })),
  );

  // Beregn total varighet i timer.
  const totalMinutter = okter.reduce(
    (sum, o) =>
      sum + o.drills.reduce((s, d) => s + (d.durationMinutes ?? 0), 0),
    0,
  );
  const okterTimer = Math.round((totalMinutter / 60) * 10) / 10;

  // Pyramide-vurdering.
  const vurdering = vurderPyramide(DEFAULT_IDEAL, pyramidOkter);

  // Antall runder i samme periode.
  const runder = await prisma.round.count({
    where: {
      userId,
      playedAt: { gte: fra, lte: til },
    },
  });

  // Antall drill-logger (fullførte drills) i samme periode.
  const drillLogs = await prisma.drillLogV2.count({
    where: {
      loggedBy: userId,
      loggedAt: { gte: fra, lte: til },
    },
  });

  // Antall tester — vi har ingen Test-modell i schema enda.
  // TODO: Når Test-modellen er på plass, telle her. Foreløpig 0.
  const tester = 0;

  return {
    fordeling: {
      actual: vurdering.faktisk,
      ideal: vurdering.ideal,
    },
    anbefaling: vurdering.anbefaling,
    ukens_stats: {
      okter: okter.length,
      okter_timer: okterTimer,
      runder,
      drills: drillLogs,
      tester,
    },
  };
}
