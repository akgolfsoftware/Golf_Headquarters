// Tilgangsregel for hvilke TestDefinition-er en spiller kan se og bruke.
// ÉN kilde til sannhet — brukes av katalogen, test-detalj, gjennomfør-siden
// og lagreTestResultat, slik at regelen ikke kan divergere (review-funn K6:
// dypsidene slapp gjennom andres PRIVATE-tester når katalogen filtrerte).

import type { Prisma } from "@/generated/prisma/client";

export function testTilgangWhere(userId: string): Prisma.TestDefinitionWhereInput {
  return {
    OR: [
      { isCustom: false },
      { createdById: userId },
      { isCustom: true, visibility: "ACADEMY" },
      { isCustom: true, isCoachApproved: true },
    ],
  };
}
