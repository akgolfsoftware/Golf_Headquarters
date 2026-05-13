// Helpers for Foreldreportal — henter koblede barn for en innlogget forelder.

import { prisma } from "@/lib/prisma";

export async function hentBarnForForelder(parentUserId: string) {
  const links = await prisma.parentRelation.findMany({
    where: { parentId: parentUserId },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          hcp: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return links.map((l) => ({
    linkId: l.id,
    relationship: l.relationship,
    child: l.child,
  }));
}

export async function assertBarnTilhorerForelder(
  parentUserId: string,
  childId: string
): Promise<boolean> {
  const rel = await prisma.parentRelation.findUnique({
    where: { parentId_childId: { parentId: parentUserId, childId } },
  });
  return !!rel;
}
