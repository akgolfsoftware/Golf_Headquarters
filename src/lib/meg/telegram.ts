// src/lib/meg/telegram.ts
// Telegram-verifisering og sendMessage-helper for Meg-boten.
import "server-only";
import { timingSafeEqual } from "node:crypto";

export type AuthInput = { headerSecret: string | null; chatId: number | null };
export type AuthConfig = { webhookSecret: string; allowedChatId: string };

/** Tidskonstant streng-sammenligning — unngå timing attacks ved secret-verifisering. */
function secretsMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Sant hvis webhook-secret matcher (tidskonstant). Avsender-id sjekkes separat. */
export function webhookSecretOk(headerSecret: string | null, webhookSecret: string): boolean {
  if (!headerSecret) return false;
  return secretsMatch(headerSecret, webhookSecret);
}

/** Sant kun hvis webhook-secret matcher OG chat-id er den allowlistede id-en. */
export function isAuthorizedUpdate(
  input: AuthInput,
  cfg: AuthConfig,
): input is { headerSecret: string; chatId: number } {
  if (!webhookSecretOk(input.headerSecret, cfg.webhookSecret)) return false;
  if (input.chatId == null) return false;
  return String(input.chatId) === cfg.allowedChatId;
}

/** Sender en tekstmelding til en Telegram-chat via Bot API. */
export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string,
): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[meg/telegram] sendMessage feilet", res.status, body.slice(0, 200));
  }
}
