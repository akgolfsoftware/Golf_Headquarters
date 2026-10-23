import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { aktivtSpillerMedlemskapWhere, ikkeOrgGruppeWhere } from "@/lib/domain/grupper";
import { coachingRelasjonWhere } from "./coaching-relasjon";

/**
 * Kun manuell booking/prøvetime, aldri trening eller profilinnsyn.
 * Bevarer eksisterende bookingrett for egen kunde med aktiv enrollment og leads,
 * selv om profilinnsyn nå krever AK-gruppe. Listen og opprettelsen bruker samme
 * regel; assistentmedlemskap alene ga aldri skriverett til booking.
 */
export function bookingSpillerWhere(viewer: { id: string; role: string }): Prisma.UserWhereInput {
  if (!["COACH", "ADMIN"].includes(viewer.role) || !viewer.id) return { id: { in: [] } };
  const aktivSpiller = { role: "PLAYER", deletedAt: null } as const;
  if (viewer.role === "ADMIN") return aktivSpiller;
  return {
    ...aktivSpiller,
    OR: [
      { NOT: coachingRelasjonWhere() },
      { enrollmentsAsPlayer: { some: { endedAt: null, program: { not: "PLATFORM_ONLY" }, coachId: viewer.id } } },
      { groupMemberships: { some: { ...aktivtSpillerMedlemskapWhere(), group: { ...ikkeOrgGruppeWhere(), coachId: viewer.id } } } },
      { groupMemberships: { some: { ...aktivtSpillerMedlemskapWhere(), group: {
        ...ikkeOrgGruppeWhere(), members: { some: { userId: viewer.id, role: "COACH", endedAt: null } },
      } } } },
    ],
  };
}

export async function harBookingTilgangTilSpiller(viewer: { id: string; role: string }, spillerId: string): Promise<boolean> {
  return (await prisma.user.findFirst({
    where: { AND: [{ id: spillerId }, bookingSpillerWhere(viewer)] }, select: { id: true },
  })) != null;
}
