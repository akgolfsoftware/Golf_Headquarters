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
import { createAnthropic } from "@ai-sdk/anthropic";
import { FALLBACK_ANTHROPIC_MODEL, velgRutetModell } from "@/lib/domain/ai-ruting";
import { kickRutingCache, lesRutingCache } from "@/lib/ai/ruting";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn("[AI] ANTHROPIC_API_KEY mangler — AI-funksjoner deaktivert");
}

export const anthropic: Anthropic | null = apiKey
  ? new Anthropic({ apiKey })
  : null;

// Modell-id-er for Meg-bryteren og fallback når RoutingRule-tabellen er tom.
const SONNET_MODEL = FALLBACK_ANTHROPIC_MODEL;
const HAIKU_MODEL = "claude-haiku-4-5-20251001";

/**
 * Modellvalg per agent. Leser AiModel/RoutingRule via cache (kickes i
 * bakgrunnen). Tom tabell eller kald cache → Anthropic Sonnet, ellers Ollama.
 */
export function modelFor(agentId: string): string {
  kickRutingCache();
  return velgRutetModell({
    agentName: agentId,
    regler: lesRutingCache(),
    anthropicTilgjengelig: Boolean(apiKey),
  }).modelId;
}

// Meg-assistenten — modell-bryter via env.
export const MEG_MODEL_SMART = process.env.MEG_MODEL_SMART ?? SONNET_MODEL;
export const MEG_MODEL_FAST = process.env.MEG_MODEL_FAST ?? HAIKU_MODEL;

// Max tokens for ett chat-svar fra agent (uten streaming).
export const AI_MAX_TOKENS = 2048;

export function isAiEnabled(): boolean {
  return anthropic !== null;
}

// ── Delt AI-rørlegging (forenkling bølge 3, 2026-08-03) ──
// Én kilde for de tre mønstrene som lå kopiert rundt i kodebasen:
// provider-oppsett for AI SDK, tekst-uttrekk fra svar, og stream-kropp.

/**
 * Anthropic-provider for AI SDK (`@ai-sdk/anthropic`) med /v1-normalisert
 * baseURL. ANTHROPIC_BASE_URL i miljøet mangler "/v1" — raw @anthropic-ai/sdk
 * legger den på selv, men @ai-sdk/anthropic bruker verdien som-den-er og
 * treffer 404 uten normaliseringen (jf. gotchas.md §AI Caddie).
 */
export function anthropicProvider() {
  const base = (process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com").replace(/\/+$/, "");
  return createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: base.endsWith("/v1") ? base : `${base}/v1`,
  });
}

/** All tekst fra et Anthropic-svar — text-blokkene joinet med linjeskift, trimmet. */
export function tekstFra(response: Anthropic.Message): string {
  return response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();
}

/**
 * Streamer et Anthropic-svar som ren tekst (text_delta-events) til en
 * ReadableStream. Feil underveis skrives inn i streamen som «[Feil: …]»
 * slik chat-rutene alltid har gjort — responsen tas aldri ned.
 * `onFerdig` kjører etter fullført stream (persistering); kaster den, går
 * også det til [Feil]-linja.
 */
export function streamAnthropicTekst(opts: {
  klient: Anthropic;
  model: string;
  maxTokens: number;
  system: string;
  messages: Anthropic.MessageParam[];
  onFerdig?: (fullSvar: string) => Promise<void>;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      let fullSvar = "";
      try {
        const respons = await opts.klient.messages.stream({
          model: opts.model,
          max_tokens: opts.maxTokens,
          system: opts.system,
          messages: opts.messages,
        });

        for await (const event of respons) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullSvar += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        await opts.onFerdig?.(fullSvar);
      } catch (err) {
        const melding = err instanceof Error ? err.message : "AI-feil. Prøv igjen.";
        controller.enqueue(encoder.encode(`\n\n[Feil: ${melding}]`));
      } finally {
        controller.close();
      }
    },
  });
}
