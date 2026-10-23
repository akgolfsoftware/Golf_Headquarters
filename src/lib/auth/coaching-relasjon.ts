import type { Prisma } from "@/generated/prisma/client";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";

/**
 * Eksisterende forretningsklassifisering, IKKE rett til å lese spillerprofil.
 * Brukes bare for spillerens eget coachingtilbud og det særskilte bookingformålet.
 * En aktiv betalt enrollment kan fortsatt være et tilbud selv uten AK-gruppe.
 * AgencyOS-profiler bruker coached.ts, aldri dette filteret.
 */
export function coachingRelasjonWhere(): Prisma.UserWhereInput {
  return {
    role: "PLAYER", deletedAt: null,
    OR: [
      { enrollmentsAsPlayer: { some: { endedAt: null, program: { not: "PLATFORM_ONLY" } } } },
      { groupMemberships: { some: aktivtSpillerMedlemskapWhere() } },
    ],
  };
}
