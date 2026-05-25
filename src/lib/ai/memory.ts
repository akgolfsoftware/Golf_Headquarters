// Bruker-spesifikk minne-skjelett for AI-agents.
//
// Tanken: hver bruker (Anders som coach, eller en spiller) har persistert
// kontekst som overlever mellom samtaler — f.eks. preferanser, fokusområder,
// tidligere coachings-beslutninger.
//
// Foreløpig in-memory-stub. Persistering via Prisma kommer i egen fase
// (ny modell `AiMemory` eies av Spor 3). Når den landes, swappes denne
// modulen til å lese/skrive til DB uten endringer i kallerne.

import "server-only";

export type AiMemoryEntry = {
  userId: string;
  key: string;
  value: string;
  updatedAt: Date;
};

// Midlertidig in-memory-store. Reset ved server-restart — kun for utvikling.
const _store = new Map<string, AiMemoryEntry>();

function makeKey(userId: string, key: string): string {
  return `${userId}::${key}`;
}

/**
 * Lagre eller oppdatere en minne-oppføring for en bruker.
 *
 * TODO: persistering via Prisma (modell AiMemory) — Spor 3 sin fase.
 */
export async function rememberFact(opts: {
  userId: string;
  key: string;
  value: string;
}): Promise<AiMemoryEntry> {
  const entry: AiMemoryEntry = {
    userId: opts.userId,
    key: opts.key,
    value: opts.value,
    updatedAt: new Date(),
  };
  _store.set(makeKey(opts.userId, opts.key), entry);
  return entry;
}

/**
 * Hent alle minne-oppføringer for en bruker. Brukes til å bygge system-prompt
 * med bruker-spesifikk kontekst.
 */
export async function recallMemory(userId: string): Promise<AiMemoryEntry[]> {
  const out: AiMemoryEntry[] = [];
  for (const entry of _store.values()) {
    if (entry.userId === userId) out.push(entry);
  }
  return out;
}

/**
 * Slett en minne-oppføring (f.eks. når bruker korrigerer eller saken er løst).
 */
export async function forgetFact(opts: {
  userId: string;
  key: string;
}): Promise<boolean> {
  return _store.delete(makeKey(opts.userId, opts.key));
}

/**
 * Format minne som tekst-blokk for system-prompt-injeksjon.
 */
export function formatMemoryForPrompt(entries: AiMemoryEntry[]): string {
  if (entries.length === 0) return "";
  const lines = entries.map((e) => `- ${e.key}: ${e.value}`);
  return `\n\nBRUKER-MINNE (persistert kontekst):\n${lines.join("\n")}\n`;
}
