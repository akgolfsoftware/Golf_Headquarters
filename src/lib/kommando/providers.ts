// Server-side provider-register for Kommando-chat.
// Modellvalg: RoutingRule (`kommando-<id>`) vinner. Tom tabell eller feil
// faller til den hardkodede katalogen, deretter Anthropic, deretter Ollama.

import "server-only";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { anthropicProvider } from "@/lib/ai/client";
import { getKommandoModel, type KommandoModelId } from "./models";
import { hentRutetModell } from "@/lib/ai/ruting";
import {
  FALLBACK_ANTHROPIC_MODEL,
  FALLBACK_OLLAMA_MODEL,
  type RuteProvider,
} from "@/lib/domain/ai-ruting";

const anthropic = anthropicProvider();

function ruteProviderKlar(provider: RuteProvider): boolean {
  switch (provider) {
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY);
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY);
    case "grok":
      return Boolean(process.env.XAI_API_KEY);
    case "ollama":
      return true;
  }
}

function languageModelFor(provider: RuteProvider, modelId: string) {
  switch (provider) {
    case "anthropic":
      return anthropic(modelId);
    case "gemini":
      return createOpenAICompatible({
        name: "gemini",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
        apiKey: process.env.GEMINI_API_KEY,
      })(modelId);
    case "grok":
      return createOpenAICompatible({
        name: "grok",
        baseURL: "https://api.x.ai/v1",
        apiKey: process.env.XAI_API_KEY,
      })(modelId);
    case "ollama":
      return createOpenAICompatible({
        name: "ollama",
        baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
        apiKey: process.env.OLLAMA_API_KEY ?? "ollama",
      })(modelId);
  }
}

function uniqueKandidater(
  liste: Array<{ provider: RuteProvider; modelId: string }>,
): Array<{ provider: RuteProvider; modelId: string }> {
  const sett = new Set<string>();
  const ut: Array<{ provider: RuteProvider; modelId: string }> = [];
  for (const k of liste) {
    const nøkkel = `${k.provider}:${k.modelId}`;
    if (sett.has(nøkkel)) continue;
    sett.add(nøkkel);
    ut.push(k);
  }
  return ut;
}

export async function resolveKommandoModel(id: KommandoModelId) {
  const m = getKommandoModel(id);
  if (!m) throw new Error(`Ukjent Kommando-modell: ${id}`);

  const valg = await hentRutetModell(`kommando-${id}`);
  const kandidater = uniqueKandidater([
    ...(valg.kilde === "db" ? [{ provider: valg.provider, modelId: valg.modelId }] : []),
    { provider: m.provider, modelId: m.modelName },
    { provider: "anthropic", modelId: FALLBACK_ANTHROPIC_MODEL },
    { provider: "ollama", modelId: FALLBACK_OLLAMA_MODEL },
  ]);

  for (const k of kandidater) {
    if (ruteProviderKlar(k.provider)) return languageModelFor(k.provider, k.modelId);
  }
  return languageModelFor("ollama", FALLBACK_OLLAMA_MODEL);
}

/** Har modellen en konfigurert nøkkel? Brukes til status-prikk på dashboard. */
export function kommandoModelReady(id: KommandoModelId): boolean {
  const m = getKommandoModel(id);
  if (!m) return false;
  return ruteProviderKlar(m.provider);
}
