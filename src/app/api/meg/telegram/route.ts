// src/app/api/meg/telegram/route.ts
// Webhook-route: tar imot Telegram-oppdateringer, verifiserer avsender,
// klassifiserer meldingen via Claude, lagrer i Meg-DB og svarer i Telegram.
import { NextResponse } from "next/server";
import { readMegEnv } from "@/lib/meg/env";
import { isAuthorizedUpdate, sendTelegramMessage } from "@/lib/meg/telegram";
import { classifyMessage } from "@/lib/meg/classify";
import { storeLog, storeConversation } from "@/lib/meg/store";

export const runtime = "nodejs";
export const maxDuration = 30;

type TgUpdate = {
  message?: { chat?: { id?: number }; text?: string };
};

export async function POST(req: Request) {
  const env = readMegEnv();
  if (!env) return NextResponse.json({ ok: false }, { status: 503 });

  const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const chatId = update.message?.chat?.id ?? null;
  const text = update.message?.text?.trim() ?? "";

  // Verifiser avsender — svar 200 uansett så Telegram ikke re-sender, men gjør ingenting.
  const authInput = { headerSecret, chatId };
  if (!isAuthorizedUpdate(authInput, {
    webhookSecret: env.telegramWebhookSecret,
    allowedChatId: env.allowedChatId,
  })) {
    console.warn("[meg/webhook] uautorisert request", { chatId });
    return NextResponse.json({ ok: true });
  }

  if (!text) {
    await sendTelegramMessage(env.telegramBotToken, authInput.chatId, "Tom melding — send tekst.");
    return NextResponse.json({ ok: true });
  }

  await storeConversation("user", text);

  const classification = await classifyMessage(text);
  let reply: string;
  if (classification) {
    const stored = await storeLog(text, classification, "telegram_text");
    reply = `Lagret (${classification.kind}): ${classification.summary}`;
    await storeConversation("assistant", reply, stored?.id ?? null);
  } else {
    reply = "Klarte ikke tolke meldingen akkurat nå.";
    await storeConversation("assistant", reply);
  }

  await sendTelegramMessage(env.telegramBotToken, authInput.chatId, reply);
  return NextResponse.json({ ok: true });
}
