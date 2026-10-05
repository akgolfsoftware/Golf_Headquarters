import type { Prisma } from "@/generated/prisma/client";
import { aktivtSpillerMedlemskapWhere, TEAM_NORWAY_SLUG } from "@/lib/domain/grupper";

/** Fireukers-/sesongspørsmål gjelder WANG-/TN-spillere, aldri et likt gruppenavn. */
export function aktivIupTilknytningWhere(): Prisma.GroupMemberWhereInput {
  return {
    ...aktivtSpillerMedlemskapWhere(),
    group: {
      arkivertAt: null,
      OR: [
        { program: { in: ["WANG_UNG", "WANG_TOPPIDRETT"] } },
        { slug: TEAM_NORWAY_SLUG },
      ],
    },
  };
}

/**
 * Hvem som ser IUP i PlayerHQ (Anders 04.10.2026): bare aktive, ikke-slettede
 * spillere med aktivt WANG-/TN-medlemskap. Ender medlemskapet, skjules IUP med
 * en gang — også tidligere svar. Eksport og sletting (GDPR) går egen vei.
 */
export function iupSynligForSpillerWhere(userId: string): Prisma.UserWhereInput {
  return {
    id: userId,
    deletedAt: null,
    anonymisertAt: null,
    groupMemberships: { some: aktivIupTilknytningWhere() },
  };
}
