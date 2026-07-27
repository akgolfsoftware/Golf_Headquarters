// Bruker-spesifikk minne for AI-agents — nå DB-backet (ai_memories).
//
// recallMemory henter spillerens varige minner (semantisk/prosedyrisk/
// episodisk) fra ai_memories via Prisma, og flettes med den gamle in-memory-
// storen (beholdt som skrive-cache og test-/fallback-lag). ALLE DB-feil
// degraderer stille til in-memory — minne skal aldri knekke en agent.
//
// Skriveveien for økter ligger i memory-writer.ts (LLM-oppsummering ved
// øktslutt); konsolidering (episodisk → semantisk) kjøres av cron-agenten
// memory-consolidation.

import "server-only";
import { prisma } from "@/lib/prisma";

export type AiMemoryEntry = {
  userId: string;
  key: string;
  value: string;
  updatedAt: Date;
};

// In-memory L1 — skrive-cache + fallback (reset ved server-restart).
const _store = new Map<string, AiMemoryEntry>();

function makeKey(userId: string, key: string): string {
  return `${userId}::${key}`;
}

const KIND_LABEL: Record<string, string> = {
  EPISODIC: "tidligere økt",
  SEMANTIC: "om spilleren",
  PROCEDURAL: "virker for spilleren",
};

/** Maks minner injisert i prompt — hold konteksten lett. */
const RECALL_LIMIT = 12;

/**
 * Lagre en minne-oppføring. Skriver til in-memory-cachen umiddelbart og
 * persisterer som SEMANTIC-minne i ai_memories (best effort).
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
  try {
    const { writeMemories } = await import("./memory-store");
    await writeMemories([
      {
        playerId: opts.userId,
        kind: "SEMANTIC",
        content: `${opts.key}: ${opts.value}`,
        metadata: { key: opts.key },
        sourceType: "manual",
      },
    ]);
  } catch {
    // best effort — cachen har verdien
  }
  return entry;
}

/**
 * Hent minne for prompt-injeksjon: varige minner fra ai_memories (nyeste
 * først, maks RECALL_LIMIT) flettet med in-memory-oppføringer.
 */
export async function recallMemory(userId: string): Promise<AiMemoryEntry[]> {
  const out: AiMemoryEntry[] = [];
  try {
    const rader = await prisma.aiMemory.findMany({
      where: { playerId: userId },
      orderBy: { updatedAt: "desc" },
      take: RECALL_LIMIT,
      select: { kind: true, content: true, metadata: true, updatedAt: true },
    });
    for (const r of rader) {
      const meta =
        r.metadata && typeof r.metadata === "object" && !Array.isArray(r.metadata)
          ? (r.metadata as Record<string, unknown>)
          : {};
      out.push({
        userId,
        key:
          typeof meta.key === "string"
            ? meta.key
            : (KIND_LABEL[r.kind] ?? r.kind.toLowerCase()),
        value: r.content,
        updatedAt: r.updatedAt,
      });
    }
  } catch {
    // DB utilgjengelig (f.eks. tester) → kun in-memory
  }
  for (const entry of _store.values()) {
    if (entry.userId === userId && !out.some((e) => e.key === entry.key)) {
      out.push(entry);
    }
  }
  return out;
}

/**
 * Slett en minne-oppføring fra cachen (DB-sletting håndteres av
 * konsolidering/admin — bevisst ikke her).
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
