import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import {
  aktivtSpillerMedlemskapWhere,
  aktivtTrenerMedlemskapWhere,
} from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";

export const WANG_TOPPIDRETT_SLUG = "wang-toppidrett";

type WangBruker = { id: string; role: UserRole };

export class WangDataUtilgjengeligError extends Error {
  readonly code = "WANG_DATA_UTILGJENGELIG";

  constructor() {
    super("Kunne ikke hente WANG-data akkurat nå. Prøv igjen.");
    this.name = "WangDataUtilgjengeligError";
  }
}

async function hentGruppeId(): Promise<string | null> {
  const gruppe = await prisma.group.findUnique({
    where: { slug: WANG_TOPPIDRETT_SLUG },
    select: { id: true },
  });
  return gruppe?.id ?? null;
}

/** Gruppeporten for trenerflaten. Gruppemedlemskap er autoriteten, ikke global rolle. */
export async function hentWangCoachGruppeId(
  bruker: WangBruker,
): Promise<string | null> {
  try {
    const gruppeId = await hentGruppeId();
    if (!gruppeId) return null;
    if (bruker.role === "ADMIN") return gruppeId;
    if (bruker.role !== "COACH") return null;

    const medlemskap = await prisma.groupMember.findFirst({
      where: { groupId: gruppeId, ...aktivtTrenerMedlemskapWhere(bruker.id) },
      select: { id: true },
    });
    return medlemskap ? gruppeId : null;
  } catch (error) {
    if (error instanceof WangDataUtilgjengeligError) throw error;
    throw new WangDataUtilgjengeligError();
  }
}

/**
 * Felles ressursgrense for all IUP-lesing og -skriving.
 * Eleven må være aktiv spiller i WANG Toppidrett før noen rolle får tilgang.
 */
export async function hentWangElevGruppeId(
  bruker: WangBruker,
  elevId: string,
): Promise<string | null> {
  try {
    const gruppeId = await hentGruppeId();
    if (!gruppeId) return null;

    const elevMedlemskap = await prisma.groupMember.findFirst({
      where: {
        groupId: gruppeId,
        userId: elevId,
        ...aktivtSpillerMedlemskapWhere(),
      },
      select: { id: true },
    });
    if (!elevMedlemskap) return null;

    if (bruker.role === "ADMIN") return gruppeId;
    if (bruker.role === "PLAYER") {
      return bruker.id === elevId ? gruppeId : null;
    }
    if (bruker.role === "PARENT") {
      const relasjon = await prisma.parentRelation.findUnique({
        where: {
          parentId_childId: { parentId: bruker.id, childId: elevId },
        },
        select: { approved: true },
      });
      return relasjon?.approved === true ? gruppeId : null;
    }
    if (bruker.role === "COACH") {
      const medlemskap = await prisma.groupMember.findFirst({
        where: {
          groupId: gruppeId,
          ...aktivtTrenerMedlemskapWhere(bruker.id),
        },
        select: { id: true },
      });
      return medlemskap ? gruppeId : null;
    }
    return null;
  } catch (error) {
    if (error instanceof WangDataUtilgjengeligError) throw error;
    throw new WangDataUtilgjengeligError();
  }
}
