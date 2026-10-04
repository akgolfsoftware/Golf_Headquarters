import "server-only";

import type { Prisma, UserRole } from "@/generated/prisma/client";
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

/** Bare et nytt, avgrenset oppslag; gruppe-ID er aldri et varig innsynsbevis. */
export async function hentWangElevGruppeId(bruker: WangBruker, elevId: string): Promise<string | null> {
  return medWangElevData(bruker, elevId, async (_tx, gruppeId) => gruppeId);
}

/** Beholder aktuell delingskontroll og spillerlås gjennom hele profiloppslaget. */
export async function medWangElevData<T>(
  bruker: WangBruker,
  elevId: string,
  les: (tx: Prisma.TransactionClient, gruppeId: string) => Promise<T>,
): Promise<T | null> {
  try {
    const gruppeId = await hentGruppeId();
    if (!gruppeId) return null;
    if ((bruker.role === "COACH" || bruker.role === "ADMIN") && bruker.id !== elevId) {
      const { medNavngittProfil } = await import("@/lib/deling/profil-lesing");
      return await medNavngittProfil(bruker.id, elevId, gruppeId, (tx) => les(tx, gruppeId));
    }
    return await prisma.$transaction(async (tx) => {
      const medlem = await tx.groupMember.findFirst({
        where: { groupId: gruppeId, userId: elevId, ...aktivtSpillerMedlemskapWhere(), user: { deletedAt: null, anonymisertAt: null }, group: { arkivertAt: null } },
        select: { id: true },
      });
      if (!medlem) return null;
      if (["PLAYER", "COACH", "ADMIN"].includes(bruker.role) && bruker.id === elevId) return les(tx, gruppeId);
      if (bruker.role !== "PARENT") return null;
      const relasjon = await tx.parentRelation.findUnique({
        where: { parentId_childId: { parentId: bruker.id, childId: elevId } }, select: { approved: true },
      });
      return relasjon?.approved === true ? les(tx, gruppeId) : null;
    });
  } catch (error) {
    if (error instanceof WangDataUtilgjengeligError) throw error;
    throw new WangDataUtilgjengeligError();
  }
}
