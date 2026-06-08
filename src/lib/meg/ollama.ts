// src/lib/meg/ollama.ts
// Lokal/gratis modell via Ollama. Brukes til enkle oppgaver (klassifisering)
// for å spare Claude-tokens. Returnerer ALLTID null ved feil/timeout/av —
// kallere faller da tilbake til Claude. Ollama er aldri en hard avhengighet.
import "server-only";
import { readMegOllamaEnv } from "@/lib/meg/env";

export function isOllamaEnabled(): boolean {
  return readMegOllamaEnv() !== null;
}

/** Henter ut message.content fra et Ollama /api/chat-svar. Ren funksjon (testbar). */
export function parseOllamaContent(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const msg = (json as { message?: { content?: unknown } }).message;
  if (!msg || typeof msg.content !== "string") return null;
  const content = msg.content.trim();
  return content.length > 0 ? content : null;
}

/**
 * Ber lokal modell svare med strukturert JSON (Ollama `format`-feltet).
 * Returnerer det parsede objektet (uvalidert), eller null ved feil/timeout/av.
 * timeoutMs hindrer at en treg lokal server blokkerer webhook-en.
 */
export async function ollamaChatJson(
  system: string,
  user: string,
  format: Record<string, unknown>,
  timeoutMs = 8000,
): Promise<unknown | null> {
  const env = readMegOllamaEnv();
  if (!env) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${env.url}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: env.model,
        stream: false,
        format,
        options: { temperature: 0 },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.warn("[meg/ollama] svar ikke ok", res.status);
      return null;
    }
    const content = parseOllamaContent(await res.json());
    if (!content) return null;
    return JSON.parse(content);
  } catch (err) {
    // Connection refused (ikke kjørende), abort (timeout), ugyldig JSON — alt → fallback.
    console.warn("[meg/ollama] utilgjengelig, faller tilbake til Claude:", err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
