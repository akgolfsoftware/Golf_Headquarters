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

// Modellvalg bor i `modeller.ts` — én kilde for både denne klienten og
// `src/lib/anthropic.ts`. Tidligere hardkodet begge samme streng og skulle
// «holdes synkronisert manuelt».
export { modelFor, nivaaFor, MODELL, type ModellNivaa } from "./modeller";
import { MODELL } from "./modeller";

/**
 * Standardmodell når ingen agent er oppgitt.
 * Foretrekk `modelFor(agentId)` i ny kode — den gir riktig nivå per agent.
 */
export const AI_MODEL: string = MODELL.sonnet;

// Meg-assistenten — modell-bryter via env.
export const MEG_MODEL_SMART = process.env.MEG_MODEL_SMART ?? "claude-sonnet-4-6";
export const MEG_MODEL_FAST = process.env.MEG_MODEL_FAST ?? "claude-haiku-4-5-20251001";

// Max tokens for ett chat-svar fra agent (uten streaming).
export const AI_MAX_TOKENS = 2048;

export function isAiEnabled(): boolean {
  return anthropic !== null;
}
