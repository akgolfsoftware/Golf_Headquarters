/**
 * Alert-wrapper — L1 Observability fra master-plan.
 *
 * Sender alerts til Anders sin Gmail-innboks via Resend.
 * Gmail-appen på iPhone gir push-notification som banner — samme effekt
 * som SMS uten å trenge en separat push-tjeneste.
 *
 * Subject prefix "🚨 ALERT" gjør det enkelt å filtrere/søke i Gmail.
 *
 * Rate-limit: en alert per (title+message)-kombo per 5 min, for å unngå
 * å spamme Gmail ved gjentakelser.
 *
 * Filnavn beholdes som slack-alert.ts for å unngå breaking changes på alle
 * eksisterende imports — funksjonen er den samme (push-varsler), men levert via e-post.
 */

import "server-only";
import { resendKlient, FRA_EPOST } from "@/lib/email";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 min
const lastSent = new Map<string, number>();

const ALERT_RECIPIENT = process.env.ALERT_EMAIL ?? "akgolfgroup@gmail.com";

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
  // Rate-limit
  const key = `${title}::${message.slice(0, 200)}`;
  const now = Date.now();
  const last = lastSent.get(key);
  if (last && now - last < RATE_LIMIT_WINDOW_MS) {
    return;
  }
  lastSent.set(key, now);

  const env = process.env.VERCEL_ENV ?? "development";

  const metaHtml = meta
    ? `<table style="margin:16px 0;border-collapse:collapse;">
        ${Object.entries(meta)
          .map(
            ([k, v]) =>
              `<tr>
                <td style="padding:4px 12px 4px 0;color:#5E5C57;font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">${k}</td>
                <td style="padding:4px 0;color:#0A1F18;font-family:monospace;font-size:12px;">${
                  typeof v === "string" ? v : JSON.stringify(v)
                }</td>
              </tr>`,
          )
          .join("")}
      </table>`
    : "";

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:24px;background:#FAFAF7;font-family:'Inter',-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:16px;border:1px solid #E5E3DD;padding:24px;">
    <div style="font-family:monospace;font-size:11px;color:#A32D2D;text-transform:uppercase;letter-spacing:0.10em;font-weight:600;">
      🚨 SYSTEM ALERT · ${env.toUpperCase()}
    </div>
    <h1 style="margin:8px 0 4px 0;font-family:'Inter Tight',sans-serif;font-size:22px;color:#0A1F18;line-height:1.2;">
      ${title}
    </h1>
    <p style="margin:12px 0;color:#0A1F18;font-size:14px;line-height:1.5;">
      ${message.slice(0, 1000)}
    </p>
    ${metaHtml}
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E5E3DD;font-family:monospace;font-size:10px;color:#9C9990;letter-spacing:0.06em;">
      ${new Date().toISOString()} · <a href="https://vercel.com/akgolf/akgolf-hq" style="color:#005840;text-decoration:none;">akgolf-hq dashboard</a>
    </div>
  </div>
</body></html>`;

  try {
    const klient = resendKlient();
    await klient.emails.send({
      from: FRA_EPOST,
      to: ALERT_RECIPIENT,
      subject: `🚨 ALERT: ${title}`,
      html,
    });
  } catch (err) {
    console.error("Alert e-post fetch failed:", err);
  }
}
