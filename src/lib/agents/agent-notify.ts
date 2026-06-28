// Felles varsling FRA agenter. Ruter til alle tilgjengelige kanaler så funnet
// når coachen "overalt":
//   - in-app  : kanonisk notify() (Notification-rad, type "system")
//   - web push: sendPush() (best-effort, stille av uten VAPID-keys)
//   - Telegram: speiles til Anders' allowlistede chat (samme env som Meg-briefene)
// Best-effort: feil i én kanal stopper aldri de andre — en agent skal ikke
// kræsje fordi et varsel ikke kom fram.

import "server-only";
import { notify } from "@/lib/notifications";
import { sendPush } from "@/lib/push/send";
import { readMegEnv } from "@/lib/meg/env";
import { sendTelegramMessage } from "@/lib/meg/telegram";

export type AgentVarsel = {
  /** Coachen som eier funnet — mottar in-app + push. */
  coachId: string;
  tittel: string;
  tekst: string;
  /** Lenke i appen (valgfri). */
  lenke?: string;
  /** Speil til Anders på Telegram. Default true (hastefunn). */
  telegram?: boolean;
};

/** Sender et agent-varsel via alle tilgjengelige kanaler. */
export async function varsleAgentFunn(v: AgentVarsel): Promise<void> {
  // In-app (kanonisk dispatcher — feiler stille internt).
  await notify({
    userId: v.coachId,
    type: "system",
    title: v.tittel,
    body: v.tekst,
    link: v.lenke,
  });

  // Web push (best-effort, av uten VAPID).
  try {
    await sendPush(v.coachId, {
      title: v.tittel,
      body: v.tekst,
      link: v.lenke,
      tag: "agent-alert",
    });
  } catch (err) {
    console.error("[agent-notify] push feilet:", err);
  }

  // Telegram-speil til Anders.
  if (v.telegram !== false) {
    const env = readMegEnv();
    if (env) {
      try {
        await sendTelegramMessage(
          env.telegramBotToken,
          env.allowedChatId,
          `${v.tittel}\n\n${v.tekst}`,
        );
      } catch (err) {
        console.error("[agent-notify] Telegram feilet:", err);
      }
    }
  }
}
