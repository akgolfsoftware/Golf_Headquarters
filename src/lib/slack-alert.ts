/**
 * Slack-alert wrapper — L1 Observability fra master-plan.
 *
 * Sender posts til Slack incoming-webhook ved kritiske hendelser.
 * env-var: SLACK_ALERTS_WEBHOOK (incoming webhook URL)
 *
 * Rate-limit: en alert per (title+message)-kombo per 5 min, for å unngå
 * å spamme Slack ved gjentakelser.
 */

import "server-only";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 min
const lastSent = new Map<string, number>();

export type SlackAlert = {
  title: string;
  message: string;
  meta?: Record<string, unknown>;
};

export async function sendSlackAlert({
  title,
  message,
  meta,
}: SlackAlert): Promise<void> {
  const webhookUrl = process.env.SLACK_ALERTS_WEBHOOK;
  if (!webhookUrl) {
    // Ingen webhook konfigurert — ignorer stille (dev/preview)
    return;
  }

  // Rate-limit
  const key = `${title}::${message.slice(0, 200)}`;
  const now = Date.now();
  const last = lastSent.get(key);
  if (last && now - last < RATE_LIMIT_WINDOW_MS) {
    return;
  }
  lastSent.set(key, now);

  const env = process.env.VERCEL_ENV ?? "development";
  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `🚨 ${title}` },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Environment:* ${env}\n*Message:* \`${message.slice(0, 500)}\``,
      },
    },
  ];

  if (meta) {
    const metaLines = Object.entries(meta)
      .map(([k, v]) => `*${k}:* ${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join("\n");
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: metaLines.slice(0, 2000) },
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `<https://vercel.com/akgolf/akgolf-hq|akgolf-hq> · ${new Date().toISOString()}`,
      },
    ],
  });

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
    if (!res.ok) {
      console.error("Slack webhook returned non-ok:", res.status);
    }
  } catch (err) {
    console.error("Slack webhook fetch failed:", err);
  }
}
