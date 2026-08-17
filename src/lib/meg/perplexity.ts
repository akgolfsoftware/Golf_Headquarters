// src/lib/meg/perplexity.ts
// Nett-søk via Perplexity Sonar API (OpenAI-kompatibelt chat/completions-endepunkt).
// Brukes av nett_sok-verktøyet i tools.ts. Returnerer ALLTID null ved
// manglende konfig/timeout/ugyldig svar — krasjer aldri resten av boten.
import "server-only";
import { z } from "zod";
import { readMegPerplexityEnv } from "@/lib/meg/env";
import { logError } from "@/lib/error-tracking";

const PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions";
const TIMEOUT_MS = 20_000;

const perplexityResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string(),
        }),
      }),
    )
    .min(1),
  citations: z.array(z.string()).optional(),
});

export type PerplexitySok = {
  svar: string;
  kilder: string[];
};

export function isPerplexityEnabled(): boolean {
  return readMegPerplexityEnv() !== null;
}

/**
 * Søker på nett via Perplexity Sonar. Returnerer null hvis ikke konfigurert,
 * ved API-feil, timeout eller uventet svarformat — kaller viser da egen
 * feilmelding/fallback fremfor å krasje.
 */
export async function perplexitySok(sporsmal: string): Promise<PerplexitySok | null> {
  const env = readMegPerplexityEnv();
  if (!env) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(PERPLEXITY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: sporsmal }],
      }),
    });
    if (!res.ok) {
      await logError({
        context: "meg.perplexity.api",
        error: `Perplexity API-feil (${res.status})`,
        meta: { status: res.status, body: await res.text() },
        severity: "warn",
      });
      return null;
    }
    const parsed = perplexityResponseSchema.safeParse(await res.json());
    if (!parsed.success) {
      await logError({
        context: "meg.perplexity.parse",
        error: "Uventet svarformat fra Perplexity",
        meta: { issues: parsed.error.issues },
        severity: "warn",
      });
      return null;
    }
    return {
      svar: parsed.data.choices[0].message.content,
      kilder: parsed.data.citations ?? [],
    };
  } catch (error) {
    await logError({
      context: "meg.perplexity.fetch",
      error,
      severity: "warn",
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
