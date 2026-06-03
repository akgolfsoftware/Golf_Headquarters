// src/lib/meg/telegram.ts
// Telegram-verifisering og sendMessage-helper for Meg-boten.
import "server-only";

export type AuthInput = { headerSecret: string | null; chatId: number | null };
export type AuthConfig = { webhookSecret: string; allowedChatId: string };

/** Sant kun hvis webhook-secret matcher OG chat-id er Anders' allowlistede id. */
export function isAuthorizedUpdate(input: AuthInput, cfg: AuthConfig): boolean {
  if (!input.headerSecret || input.headerSecret !== cfg.webhookSecret) return false;
  if (input.chatId == null) return false;
  return String(input.chatId) === cfg.allowedChatId;
}

/** Sender en tekstmelding til en Telegram-chat via Bot API. */
export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string,
): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
