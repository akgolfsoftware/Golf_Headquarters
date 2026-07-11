import "server-only";

/** Sist spilte bane-id for en spiller — aldri fabrikkert, kun ekte Round-historikk. */
import { prisma } from "@/lib/prisma";

export async function sisteSpilteBaneId(userId: string): Promise<string | null> {
  const siste = await prisma.round.findFirst({
    where: { userId },
    orderBy: { playedAt: "desc" },
    select: { courseId: true },
  });
  return siste?.courseId ?? null;
}
