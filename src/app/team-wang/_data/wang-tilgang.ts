import "server-only";
import { prisma } from "@/lib/prisma";
import { WangGruppeHentefeil } from "./hent-wang-gruppe";

const WANG_SLUGS = ["wang-toppidrett", "wang-ung"] as const;

async function finnWangTrenerRad(coachId: string, elevId?: string) {
  try {
    return await prisma.groupMember.findFirst({
      where: {
        userId: coachId,
        endedAt: null,
        role: { in: ["COACH", "ASSISTANT"] },
        group: {
          slug: { in: [...WANG_SLUGS] },
          ...(elevId
            ? { members: { some: { userId: elevId, endedAt: null } } }
            : {}),
        },
      },
      select: { id: true },
    });
  } catch (e) {
    if (e instanceof WangGruppeHentefeil) throw e;
    throw new WangGruppeHentefeil();
  }
}

export async function erWangGruppeTrener(bruker: {
  id: string;
  role: string;
}): Promise<boolean> {
  if (bruker.role === "ADMIN") return true;
  if (bruker.role !== "COACH") return false;
  const rad = await finnWangTrenerRad(bruker.id);
  return rad != null;
}

export async function erWangCoachForElev(
  coachId: string,
  elevId: string,
): Promise<boolean> {
  const rad = await finnWangTrenerRad(coachId, elevId);
  return rad != null;
}
