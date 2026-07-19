#!/usr/bin/env node
/**
 * Stop-hook — «tapp på skulderen» (Agentic OS nivå 3).
 * Sender Telegram-melding via Meg-boten når en økt/autonom oppgave er ferdig.
 * Token/chat-id leses fra miljøet eller .env.local. Mangler de (f.eks.
 * sky-container uten Meg-oppsett), hopper vi stille over.
 * Opt-out: MEG_VARSLE_STOP=0.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

if (process.env.MEG_VARSLE_STOP === "0") process.exit(0);

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf-8"));
} catch {
  // fortsett — cwd-fallback under
}

function lesEnvLokal(nokkel) {
  if (process.env[nokkel]) return process.env[nokkel];
  const sti = join(input.cwd ?? process.cwd(), ".env.local");
  if (!existsSync(sti)) return undefined;
  try {
    const linje = readFileSync(sti, "utf-8")
      .split("\n")
      .find((l) => l.startsWith(`${nokkel}=`));
    return linje?.slice(nokkel.length + 1).trim().replace(/^["']|["']$/g, "");
  } catch {
    return undefined;
  }
}

const token = lesEnvLokal("MEG_TELEGRAM_BOT_TOKEN");
const chatId = lesEnvLokal("MEG_TELEGRAM_ALLOWED_CHAT_ID");
if (!token || !chatId) process.exit(0);

const mappe = (input.cwd ?? process.cwd()).split("/").pop();
const tekst = `✅ Claude-økt fullført i ${mappe}. Sjekk resultatet når du har et ledig øyeblikk.`;

try {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: tekst }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) process.exit(0);
} catch {
  // varsling feiler aldri en økt
}
process.exit(0);
