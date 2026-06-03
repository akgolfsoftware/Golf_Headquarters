// src/lib/meg/env.ts
// Defensiv lesing av Meg-env-vars. Returnerer null hvis ufullstendig —
// krasjer aldri resten av appen om Meg ikke er konfigurert.
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
