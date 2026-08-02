// Bruker-spesifikk minne for AI-agents.
//
// Tanken: hver bruker (Anders som coach, eller en spiller) har persistert
// kontekst som overlever mellom samtaler — f.eks. preferanser, fokusområder,
// tidligere coachings-beslutninger. Persistert via Prisma-modellen `AiMemory`.

import "server-only";
import { prisma } from "@/lib/prisma";

export type AiMemoryEntry = {
  userId: string;
  key: string;
  value: string;
  updatedAt: Date;
};

/**
 * Lagre eller oppdatere en minne-oppføring for en bruker.
 */
export async function rememberFact(opts: {
  userId: string;
  key: string;
  value: string;
}): Promise<AiMemoryEntry> {
  const row = await prisma.aiMemory.upsert({
    where: { userId_key: { userId: opts.userId, key: opts.key } },
    create: { userId: opts.userId, key: opts.key, value: opts.value },
    update: { value: opts.value },
  });
  return row;
}

/**
 * Hent alle minne-oppføringer for en bruker. Brukes til å bygge system-prompt
 * med bruker-spesifikk kontekst.
 */
export async function recallMemory(userId: string): Promise<AiMemoryEntry[]> {
  return prisma.aiMemory.findMany({ where: { userId } });
}

/**
 * Slett en minne-oppføring (f.eks. når bruker korrigerer eller saken er løst).
 */
export async function forgetFact(opts: {
  userId: string;
  key: string;
}): Promise<boolean> {
  const result = await prisma.aiMemory
    .delete({ where: { userId_key: { userId: opts.userId, key: opts.key } } })
    .catch(() => null);
  return result !== null;
}

/**
 * Format minne som tekst-blokk for system-prompt-injeksjon.
 */
export function formatMemoryForPrompt(entries: AiMemoryEntry[]): string {
  if (entries.length === 0) return "";
  const lines = entries.map((e) => `- ${e.key}: ${e.value}`);
  return `\n\nBRUKER-MINNE (persistert kontekst):\n${lines.join("\n")}\n`;
}
