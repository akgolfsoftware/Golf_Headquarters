import { NextResponse } from "next/server";
import { readMegEnv } from "@/lib/meg/env";
import { isAuthorizedUpdate, sendTelegramMessage } from "@/lib/meg/telegram";
import { storeConversation } from "@/lib/meg/store";
import { hentSamtaleHistorikk } from "@/lib/meg/read";
import { runMegAgent } from "@/lib/meg/agent";
import { handleConfirmation } from "@/lib/meg/confirm";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  // Bekreftelsesflyt: hvis en ventende skrive-handling finnes og dette er
  // BEKREFT/avbryt, utfør/forkast den her — uten å gå via agenten.
  const confirmReply = await handleConfirmation(text);
  if (confirmReply !== null) {
    await storeConversation("assistant", confirmReply);
    await sendTelegramMessage(env.telegramBotToken, authInput.chatId, confirmReply);
    return NextResponse.json({ ok: true });
  }

  const history = await hentSamtaleHistorikk(20);
  // Fjern siste user-melding fra historikk (er lagt til rett over, sendes separat til agenten)
  const trimmedHistory = history.filter((_, i) => i < history.length - 1);

  const result = await runMegAgent({ text, history: trimmedHistory });

  const reply = result.ok ? result.text : "Noe gikk galt. Prøv igjen.";
  if (!result.ok) console.error("[meg/webhook] agent-feil:", result.error);

  await sendTelegramMessage(env.telegramBotToken, authInput.chatId, reply);
  return NextResponse.json({ ok: true });
}
