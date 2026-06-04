// Anthropic-klient (singleton) for ny AI-foundation under `src/lib/ai/`.
//
// Eksisterende `src/lib/anthropic.ts` brukes av AI-coach (spiller) og
// ai-plan/generate. Denne klienten er foundation for det videre arbeidet
// (Caddie 2.0, Skills, Tools, agents) — uavhengig av legacy-kontekst-bygger.
//
// Hvis ANTHROPIC_API_KEY mangler logger vi en advarsel og eksporterer null
// slik at koden importerer trygt under build (eks. på Vercel uten env satt).

import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn("[AI] ANTHROPIC_API_KEY mangler — AI-funksjoner deaktivert");
}

export const anthropic: Anthropic | null = apiKey
  ? new Anthropic({ apiKey })
  : null;

// Standard-modell for nye AI-agents. Eksisterende `src/lib/anthropic.ts` bruker
// samme modell-streng (COACH_MODEL). Holdes synkronisert manuelt.
export const AI_MODEL = "claude-sonnet-4-6";

// Meg-assistenten — modell-bryter via env.
export const MEG_MODEL_SMART = process.env.MEG_MODEL_SMART ?? "claude-sonnet-4-6";
export const MEG_MODEL_FAST = process.env.MEG_MODEL_FAST ?? "claude-haiku-4-5-20251001";

// Max tokens for ett chat-svar fra agent (uten streaming).
export const AI_MAX_TOKENS = 2048;

export function isAiEnabled(): boolean {
  return anthropic !== null;
}
