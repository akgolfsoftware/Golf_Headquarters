import "server-only";

/**
 * Henter en teknisk plan i formen tp-visning.ts forventer. Én spørring for
 * PH-TP-01 (spiller) og AG-10/AG-TP-01 (coach). Tilgang sjekkes av kalleren:
 * `hvor` avgrenser alltid til riktig spiller.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const TP_INCLUDE = {
  opprettetAv: { select: { name: true } },
  positions: {
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      pNummer: true,
      sortOrder: true,
      hovedfokus: true,
      tasks: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true, tittel: true, slagNavn: true, pyramide: true, omraade: true, omraadeKode: true, koller: true,
          motorikk: true, belastning: true, press: true, dimensjon: true, sandTrinn: true, maaleutstyr: true,
          status: true, repsMaalDry: true, repsMaalLav: true, repsMaalFull: true,
          repsGjortDry: true, repsGjortLav: true, repsGjortFull: true,
          logs: {
            orderBy: { loggedAt: "desc" },
            select: { id: true, reps: true, hastighet: true, belastning: true, notater: true, sessionV2Id: true, trackmanShotId: true, loggedAt: true },
          },
          maalMatrise: { select: { motorikk: true, belastning: true, maalReps: true } },
          tmGoals: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  },
} satisfies Prisma.TechnicalPlanInclude;

export type TpPlanRad = Prisma.TechnicalPlanGetPayload<{ include: typeof TP_INCLUDE }>;

export async function hentTekniskPlan(hvor: { id: string; userId: string }): Promise<TpPlanRad | null> {
  return prisma.technicalPlan.findFirst({ where: hvor, include: TP_INCLUDE });
}
