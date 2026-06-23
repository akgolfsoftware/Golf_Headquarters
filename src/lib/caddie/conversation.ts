import { prisma } from "@/lib/prisma";

/**
 * Henter brukerens nyeste Caddie-samtale, eller oppretter en fersk hvis ingen
 * finnes. Fase 1 bruker én løpende samtale per bruker; Fase 2 kan legge til en
 * samtale-bytter (CaddieConversation-liste finnes allerede i DB).
 */
export async function getOrCreateActiveConversation(userId: string) {
  const existing = await prisma.caddieConversation.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;
  return prisma.caddieConversation.create({ data: { userId } });
}
