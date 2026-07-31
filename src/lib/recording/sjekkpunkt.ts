/**
 * Sjekkpunkt = tråd mellom ETTER (godkjent PlanAction) og neste FØR-kort.
 */

import { prisma } from "@/lib/prisma";

export type SisteSjekkpunkt = {
  planActionId: string;
  sjekkpunkt: string;
  fangstId: string | null;
  godkjentAt: Date;
  agentName: string;
};

/** Siste godkjente sjekkpunkt for en spiller (FØR-kort). */
export async function hentSisteSjekkpunkt(
  playerId: string,
): Promise<SisteSjekkpunkt | null> {
  const rad = await prisma.planAction.findFirst({
    where: {
      userId: playerId,
      status: "ACCEPTED",
      sjekkpunkt: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      sjekkpunkt: true,
      fangstId: true,
      updatedAt: true,
      agentName: true,
    },
  });
  if (!rad?.sjekkpunkt) return null;
  return {
    planActionId: rad.id,
    sjekkpunkt: rad.sjekkpunkt,
    fangstId: rad.fangstId,
    godkjentAt: rad.updatedAt,
    agentName: rad.agentName,
  };
}
