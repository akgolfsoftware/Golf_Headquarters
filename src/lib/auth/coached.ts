import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Tilgangsskillet selvbetjent vs. coachet (I0 — LÅST forretningsregel,
 * NORDSTJERNE.md): en spiller med kun PlayerHQ-abonnement og uten
 * Academy-tilhørighet er SELVBETJENT — ingen coachrelasjon, usynlig i hele
 * AgencyOS (stall, cockpit, køer, motor-batch).
 *
 * Definisjonen er forankret i datamodellen: PlayerProgram.PLATFORM_ONLY er
 * eksplisitt dokumentert i schema.prisma som «Selvbetjent — ingen
 * coachrelasjon (GDPR-skille)». Coachet = aktiv PlayerEnrollment
 * (endedAt null) i et annet program enn PLATFORM_ONLY, ELLER medlemskap i en
 * AK-gruppe (GroupMember).
 *
 * Dette er den ENESTE lovlige porten for spiller-synlighet i AgencyOS-loadere
 * (prosjektregel) — nye loadere skal bruke `coachedPlayerWhere()`, aldri
 * bygge sitt eget filter.
 *
 * Bevisst UNNTAK (dokumentert i NORDSTJERNE/plan): manuell booking-wizard
 * (lead-/prøvetime-flyt) — å booke en time for en ny kunde er business-flyt,
 * ikke innsyn i treningsdata.
 */

/** Prisma-where-fragment: kun coachede spillere. Kombineres med AND. */
export function coachedPlayerWhere(): Prisma.UserWhereInput {
  return {
    role: "PLAYER",
    OR: [
      {
        enrollmentsAsPlayer: {
          some: { endedAt: null, program: { not: "PLATFORM_ONLY" } },
        },
      },
      { groupMemberships: { some: {} } },
    ],
  };
}

/** Er spilleren coachet (synlig for AgencyOS)? */
export async function erCoachetSpiller(userId: string): Promise<boolean> {
  const treff = await prisma.user.findFirst({
    where: { id: userId, ...coachedPlayerWhere() },
    select: { id: true },
  });
  return treff != null;
}
