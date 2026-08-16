// Tilgangsregel for hvilke TestDefinition-er en spiller kan se og bruke.
// ÉN kilde til sannhet — brukes av katalogen, test-detalj, gjennomfør-siden
// og fullforTestSession/logTest, slik at regelen ikke kan divergere
// (review-funn K6: dypsidene slapp gjennom andres PRIVATE-tester når
// katalogen filtrerte).
//
// CANON-regel (Anders 2026-08-16, T5): spilleren ser KUN de 21 CANON-radene
// (20 protokoller — Putt Speed har to varianter) + sine egne isCustom-tester.
// Coach/admin-flatene (src/app/admin/tester m.fl.) bruker IKKE denne regelen
// og ser fortsatt alle 36.

import type { Prisma } from "@/generated/prisma/client";

export function testTilgangWhere(userId: string): Prisma.TestDefinitionWhereInput {
  return {
    OR: [
      { erCanon: true },
      { isCustom: true, createdById: userId },
    ],
  };
}
