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
