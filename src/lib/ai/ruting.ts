/**
 * Leser AiModel/RoutingRule og velger modell. Tom tabell eller DB-feil
 * faller til Anthropic, deretter Ollama (src/lib/domain/ai-ruting.ts).
 *
 * Cache: 60 s i prosessminnet, så modelFor() kan forbli synkron.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import {
  velgRutetModell,
  type RuteRad,
  type RuteValg,
} from "@/lib/domain/ai-ruting";

const TTL_MS = 60_000;

let cache: { at: number; regler: RuteRad[] } | null = null;
let inflight: Promise<void> | null = null;

function anthropicTilgjengelig(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function lesRutingCache(): readonly RuteRad[] {
  return cache?.regler ?? [];
}

async function lastRegler(): Promise<RuteRad[]> {
  const rader = await prisma.routingRule.findMany({
    include: { aiModel: { select: { active: true, provider: true, modelId: true } } },
  });
  return rader.map((r) => ({
    agentName: r.agentName,
    active: r.active,
    modelActive: r.aiModel.active,
    provider: r.aiModel.provider,
    modelId: r.aiModel.modelId,
  }));
}

async function refresh(): Promise<void> {
  try {
    const regler = await lastRegler();
    cache = { at: Date.now(), regler };
  } catch {
    cache = cache ?? { at: Date.now(), regler: [] };
  }
}

/** Bakgrunnsoppdatering — kastes aldri. Brukes av synkron modelFor(). */
export function kickRutingCache(): void {
  if (cache && Date.now() - cache.at < TTL_MS) return;
  if (inflight) return;
  inflight = refresh().finally(() => {
    inflight = null;
  });
}

export async function hentRutetModell(agentName: string): Promise<RuteValg> {
  if (!cache || Date.now() - cache.at >= TTL_MS) {
    await (inflight ?? refresh());
  }
  return velgRutetModell({
    agentName,
    regler: cache?.regler ?? [],
    anthropicTilgjengelig: anthropicTilgjengelig(),
  });
}
