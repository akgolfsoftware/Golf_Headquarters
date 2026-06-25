// Server-side provider-register for Kommando-chat.
// Claude via @ai-sdk/anthropic direkte (baseURL normalisert til /v1 — se gotchas.md).
// Gemini/Grok/Ollama via OpenAI-kompatible endepunkter. Nøkler i .env.local, aldri i kode.

import "server-only";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getKommandoModel, type KommandoModelId } from "./models";

const ANTHROPIC_BASE = (process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com").replace(/\/+$/, "");
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: ANTHROPIC_BASE.endsWith("/v1") ? ANTHROPIC_BASE : `${ANTHROPIC_BASE}/v1`,
});

// Returtypen utledes (union av provider-modellene). Vi annoterer den IKKE med
// `ai`-pakkens `LanguageModel`, som er smalere (V2/V3) enn provider-modellene (V4)
// — streamText godtar V4-modellene direkte, slik caddie-ruten også gjør.
export function resolveKommandoModel(id: KommandoModelId) {
  const m = getKommandoModel(id);
  if (!m) throw new Error(`Ukjent Kommando-modell: ${id}`);
  switch (m.provider) {
    case "anthropic":
      return anthropic(m.modelName);
    case "gemini":
      return createOpenAICompatible({
        name: "gemini",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
        apiKey: process.env.GEMINI_API_KEY,
      })(m.modelName);
    case "grok":
      return createOpenAICompatible({
        name: "grok",
        baseURL: "https://api.x.ai/v1",
        apiKey: process.env.XAI_API_KEY,
      })(m.modelName);
    case "ollama":
      return createOpenAICompatible({
        name: "ollama",
        baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
        apiKey: process.env.OLLAMA_API_KEY ?? "ollama",
      })(m.modelName);
  }
}

/** Har modellen en konfigurert nøkkel? Brukes til status-prikk på dashboard. */
export function kommandoModelReady(id: KommandoModelId): boolean {
  const m = getKommandoModel(id);
  if (!m) return false;
  switch (m.provider) {
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY);
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY);
    case "grok":
      return Boolean(process.env.XAI_API_KEY);
    case "ollama":
      return true; // lokal — antas tilgjengelig
  }
}
