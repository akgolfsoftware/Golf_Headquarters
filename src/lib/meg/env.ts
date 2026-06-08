// src/lib/meg/env.ts
// Defensiv lesing av Meg-env-vars. Returnerer null hvis ufullstendig —
// krasjer aldri resten av appen om Meg ikke er konfigurert.
import "server-only";
import { z } from "zod";

const megEnvSchema = z.object({
  MEG_SUPABASE_URL: z.string().url(),
  MEG_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MEG_TELEGRAM_BOT_TOKEN: z.string().min(1),
  MEG_TELEGRAM_WEBHOOK_SECRET: z.string().min(1),
  MEG_TELEGRAM_ALLOWED_CHAT_ID: z.string().min(1),
});

export type MegEnv = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  telegramBotToken: string;
  telegramWebhookSecret: string;
  allowedChatId: string;
};

/** Leser Meg-env defensivt. Returnerer null hvis ufullstendig — krasjer aldri resten av appen. */
export function readMegEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): MegEnv | null {
  const parsed = megEnvSchema.safeParse(source);
  if (!parsed.success) return null;
  return {
    supabaseUrl: parsed.data.MEG_SUPABASE_URL,
    supabaseServiceRoleKey: parsed.data.MEG_SUPABASE_SERVICE_ROLE_KEY,
    telegramBotToken: parsed.data.MEG_TELEGRAM_BOT_TOKEN,
    telegramWebhookSecret: parsed.data.MEG_TELEGRAM_WEBHOOK_SECRET,
    allowedChatId: parsed.data.MEG_TELEGRAM_ALLOWED_CHAT_ID,
  };
}

// Embeddings-env (Fase 2) — valgfri, adskilt fra kjerne-env så semantisk
// søk kan deaktiveres uten å brekke boten. Default: Voyage voyage-3-lite (512 dim).
const embeddingsEnvSchema = z.object({
  MEG_EMBEDDINGS_API_KEY: z.string().min(1),
  MEG_EMBEDDINGS_MODEL: z.string().default("voyage-3-lite"),
  MEG_EMBEDDINGS_BASE_URL: z
    .string()
    .url()
    .default("https://api.voyageai.com/v1/embeddings"),
});

export type MegEmbeddingsEnv = {
  apiKey: string;
  model: string;
  baseUrl: string;
};

/** Leser embeddings-env defensivt. Returnerer null hvis ikke konfigurert. */
export function readMegEmbeddingsEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): MegEmbeddingsEnv | null {
  const parsed = embeddingsEnvSchema.safeParse(source);
  if (!parsed.success) return null;
  return {
    apiKey: parsed.data.MEG_EMBEDDINGS_API_KEY,
    model: parsed.data.MEG_EMBEDDINGS_MODEL,
    baseUrl: parsed.data.MEG_EMBEDDINGS_BASE_URL,
  };
}

// Ollama-env (lokal/gratis modell for enkle oppgaver). Valgfri — aktiveres kun
// når MEG_OLLAMA_URL er satt. Uten den faller alt tilbake til Claude (som i dag).
const ollamaEnvSchema = z.object({
  MEG_OLLAMA_URL: z.string().url(),
  MEG_OLLAMA_MODEL: z.string().default("llama3.2"),
});

export type MegOllamaEnv = {
  url: string;
  model: string;
};

/** Leser Ollama-env defensivt. Returnerer null hvis ikke konfigurert (→ bruk Claude). */
export function readMegOllamaEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): MegOllamaEnv | null {
  const parsed = ollamaEnvSchema.safeParse(source);
  if (!parsed.success) return null;
  return {
    url: parsed.data.MEG_OLLAMA_URL.replace(/\/$/, ""),
    model: parsed.data.MEG_OLLAMA_MODEL,
  };
}

/** Secret for helse-inntak-endepunktet (Fase 3b). Returnerer null hvis ikke satt. */
export function readMegHealthIngestSecret(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): string | null {
  const v = source.MEG_HEALTH_INGEST_SECRET;
  return typeof v === "string" && v.length > 0 ? v : null;
}
