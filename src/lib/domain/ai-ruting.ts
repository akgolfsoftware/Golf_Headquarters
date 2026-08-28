/**
 * Ren AI-ruting — velger modell fra RoutingRule/AiModel-rader.
 * Kalleren (src/lib/ai/ruting.ts) henter rader fra DB. Denne fila har
 * ingen Prisma, så den kan testes uten tilkobling.
 *
 * Fallback: Anthropic Claude, deretter Ollama — aldri kast når tabellen
 * er tom eller en rad mangler.
 */

export const FALLBACK_ANTHROPIC_MODEL = "claude-sonnet-4-6";
export const FALLBACK_OLLAMA_MODEL = "llama3.1:8b";

export type RuteProvider = "anthropic" | "gemini" | "grok" | "ollama";

export type RuteRad = {
  agentName: string;
  active: boolean;
  modelActive: boolean;
  provider: string;
  modelId: string;
};

export type RuteValg = {
  provider: RuteProvider;
  modelId: string;
  kilde: "db" | "fallback-anthropic" | "fallback-ollama";
};

const PROVIDERE = new Set<RuteProvider>(["anthropic", "gemini", "grok", "ollama"]);

export function somProvider(v: string): RuteProvider | null {
  return PROVIDERE.has(v as RuteProvider) ? (v as RuteProvider) : null;
}

export function velgRutetModell(opts: {
  agentName: string;
  regler: readonly RuteRad[];
  anthropicTilgjengelig: boolean;
}): RuteValg {
  const treff = opts.regler.find(
    (r) => r.agentName === opts.agentName && r.active && r.modelActive && r.modelId.trim().length > 0,
  );
  if (treff) {
    const provider = somProvider(treff.provider) ?? "anthropic";
    return { provider, modelId: treff.modelId, kilde: "db" };
  }
  if (opts.anthropicTilgjengelig) {
    return { provider: "anthropic", modelId: FALLBACK_ANTHROPIC_MODEL, kilde: "fallback-anthropic" };
  }
  return { provider: "ollama", modelId: FALLBACK_OLLAMA_MODEL, kilde: "fallback-ollama" };
}
