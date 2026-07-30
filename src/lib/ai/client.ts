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

// Modell-tier per agent (AgencyOS-designfasit-ordren, punkt 2). Ukjente
// agent-id-er faller til sonnet — samme modell alle agenter brukte før
// registeret fantes, så en glemt/ny agentId aldri ender opp dyrere eller
// tregere enn før.
const OPUS_MODEL = "claude-opus-4-8";
const SONNET_MODEL = "claude-sonnet-4-6";
const HAIKU_MODEL = "claude-haiku-4-5-20251001";

const OPUS_AGENTS = new Set([
  "plan-revisjon",
  "sg-interpretation",
  "performance-peaking",
  "swing-video-analyst",
  "plan-effectiveness",
  "ai-code-reviewer",
]);

const HAIKU_AGENTS = new Set([
  "notion-sync",
  "calendar-sync",
  "wagr-sync",
  "betalings-purring",
  "lead-oppfolging",
  "booking-conflict-monitor",
  "availability-24-7-monitor",
  "meg-loftesjekk",
  "meg-crm-nudge",
]);

export function modelFor(agentId: string): string {
  if (OPUS_AGENTS.has(agentId)) return OPUS_MODEL;
  if (HAIKU_AGENTS.has(agentId)) return HAIKU_MODEL;
  return SONNET_MODEL;
}

// Meg-assistenten — modell-bryter via env.
export const MEG_MODEL_SMART = process.env.MEG_MODEL_SMART ?? "claude-sonnet-4-6";
export const MEG_MODEL_FAST = process.env.MEG_MODEL_FAST ?? "claude-haiku-4-5-20251001";

// Max tokens for ett chat-svar fra agent (uten streaming).
export const AI_MAX_TOKENS = 2048;

export function isAiEnabled(): boolean {
  return anthropic !== null;
}
