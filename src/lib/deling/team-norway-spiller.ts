import "server-only";

import { prisma } from "@/lib/prisma";
import { TEAM_NORWAY_SLUG, aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { TN_DEMO_SLUG } from "@/lib/domain/demo-grupper";

export type TnSpillergruppe = { id: string; navn: string };

/**
 * Team Norway-gruppene spilleren er aktivt spillermedlem i (også demoutgaven). Tom liste for alle andre.
 * Styrer om PlayerHQ viser lenken «Se hva Team Norway ser» (beslutninger.md §TEAM NORWAY-TRENERFLATEN
 * BYGGES I HQ, punkt 6).
 */
export async function hentTnSpillergrupper(userId: string): Promise<TnSpillergruppe[]> {
  const rader = await prisma.groupMember.findMany({
    where: { userId, ...aktivtSpillerMedlemskapWhere(), group: { arkivertAt: null, slug: { in: [TEAM_NORWAY_SLUG, TN_DEMO_SLUG] } } },
    select: { group: { select: { id: true, name: true } } },
    orderBy: { group: { name: "asc" } },
  });
  return [...new Map(rader.map((r) => [r.group.id, { id: r.group.id, navn: r.group.name }])).values()];
}
