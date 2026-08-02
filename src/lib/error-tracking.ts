/**
 * Error-tracking lib — L1 Observability fra master-plan.
 *
 * Logger feil til:
 *  1. console.error (Vercel Logs fanger automatisk)
 *  2. ErrorLog-tabell i Prisma (for historikk + UI-visning på /admin/feillogg)
 *  3. Slack-webhook ved fatal/critical (via slack-alert.ts)
 *  4. Telegram til Anders ved fatal/error (samme mønster som benchmark-sync),
 *     strupet til én melding per kontekst per 15. minutt så en løpsk løkke
 *     ikke fyller telefonen.
 *
 * S-20: PII-sanitering — e-postadresser, telefonnumre, kortdata og
 * passord-relaterte felter strippes fra meta og message før logging.
 *
 * Brukes overalt der vi har try/catch på kritiske paths.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// S-20: PII-sanitering
// ---------------------------------------------------------------------------

/** Feltnavn som aldri skal logges — verdien erstattes med "[REDACTED]" */
const PII_FIELDS = new Set([
  "email",
  "mail",
  "phone",
  "telefon",
  "password",
  "passord",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "apiKey",
  "creditCard",
  "cardNumber",
  "cvv",
  "ssn",
  "dateOfBirth",
  "dob",
  "guardianEmail",
  "guestEmail",
  "guestPhone",
  "guestName",
]);

/** Regex for å finne e-postadresser i tekst-strenger */
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
/** Regex for norske/internasjonale telefonnumre (8+ siffer, evt. med +/mellomrom) */
const PHONE_RE = /(?:\+?[\d\s\-()]{8,20})/g;

/**
 * Saniterer et objekt rekursivt: erstattar kjente PII-feltnavn med "[REDACTED]"
 * og maskerer e-post/telefon i strengverdier.
 */
function sanitizeMeta(obj: unknown, depth = 0): unknown {
  if (depth > 5) return obj; // unngå uendelig rekursjon
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    // Masker e-postadresser og telefonnumre i fri tekst
    return obj
      .replace(EMAIL_RE, "[e-post-fjernet]")
      .replace(PHONE_RE, (m) => (m.replace(/\D/g, "").length >= 8 ? "[tlf-fjernet]" : m));
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeMeta(item, depth + 1));
  }
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (PII_FIELDS.has(key)) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = sanitizeMeta(value, depth + 1);
      }
    }
    return result;
  }
  return obj;
}

/** Saniterer en feilmeldings-streng */
function sanitizeMessage(msg: string): string {
  return msg
    .replace(EMAIL_RE, "[e-post-fjernet]")
    .replace(PHONE_RE, (m) => (m.replace(/\D/g, "").length >= 8 ? "[tlf-fjernet]" : m));
}

export type ErrorSeverity = "fatal" | "error" | "warn" | "info";

// ---------------------------------------------------------------------------
// Telegram-varsel ved alvorlig feil
// ---------------------------------------------------------------------------

/** Struping: én melding per kontekst per 15. minutt. */
export const VARSEL_STRUPE_MS = 15 * 60 * 1000;

/**
 * Ren avgjørelse: skal denne konteksten varsles nå?
 *
 * `sistSendt` er tidspunktet forrige varsel for samme kontekst gikk ut (eller
 * undefined om det aldri har gått ut noe). Skilt ut som ren funksjon så den
 * kan testes uten nettverk eller klokke-triksing.
 */
export function skalVarsle(sistSendt: number | undefined, naa: number): boolean {
  if (sistSendt === undefined) return true;
  return naa - sistSendt >= VARSEL_STRUPE_MS;
}

/** Siste varsel per kontekst i denne prosessen. Nullstilles ved kaldstart. */
const sisteVarsel = new Map<string, number>();

async function varsleTelegram(tekst: string, kontekst: string): Promise<void> {
  const token = process.env.MEG_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.MEG_TELEGRAM_ALLOWED_CHAT_ID;
  if (!token || !chatId) return;

  const naa = Date.now();
  if (!skalVarsle(sisteVarsel.get(kontekst), naa)) return;
  sisteVarsel.set(kontekst, naa);

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: tekst }),
    });
  } catch {
    // Varsel-fail skal aldri velte flyten som feilet i utgangspunktet.
  }
}

export type LogErrorInput = {
  context: string;
  error: unknown;
  meta?: Record<string, unknown>;
  severity?: ErrorSeverity;
  userId?: string;
};

/**
 * Logg en feil til console + Prisma ErrorLog.
 * Fatal/error severity sender også Slack-alert hvis SLACK_ALERTS_WEBHOOK er satt.
 *
 * Eksempel:
 * ```ts
 * try { ... }
 * catch (e) {
 *   await logError({ context: "stripe.webhook", error: e, meta: { bookingId } });
 * }
 * ```
 */
export async function logError({
  context,
  error,
  meta,
  severity = "error",
  userId,
}: LogErrorInput): Promise<void> {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);
  const rawStack = error instanceof Error ? error.stack : undefined;

  // S-20: sanitér PII fra alle felter som logges eksternt
  const message = sanitizeMessage(rawMessage);
  const stack = rawStack ? sanitizeMessage(rawStack) : undefined;
  const cleanMeta = meta ? (sanitizeMeta(meta) as Record<string, unknown>) : undefined;

  // 1. Strukturert console-log (Vercel Logs henter dette)
  console.error(
    JSON.stringify({
      level: severity,
      context,
      message,
      stack,
      meta: cleanMeta,
      userId,
      timestamp: new Date().toISOString(),
    }),
  );

  // 2. Persistent ErrorLog i Prisma
  try {
    await prisma.errorLog.create({
      data: {
        context,
        message,
        stack: stack ?? null,
        userId: userId ?? null,
        meta: cleanMeta
          ? (JSON.parse(JSON.stringify(cleanMeta)) as Prisma.InputJsonValue)
          : undefined,
        severity,
      },
    });
  } catch (dbError) {
    // Hvis ErrorLog selv feiler: kun console-log
    console.error("ErrorLog write failed:", dbError);
  }

  // 3. Slack-alert ved fatal/error (sanitert meta sendes videre)
  if (severity === "fatal" || severity === "error") {
    try {
      const { sendSlackAlert } = await import("./slack-alert");
      await sendSlackAlert({
        title: `[${severity.toUpperCase()}] ${context}`,
        message,
        meta: cleanMeta,
      });
    } catch {
      // Slack-fail skal ikke krasje hele flyten
    }

    // 4. Telegram til Anders — sanitert tekst, strupet per kontekst.
    await varsleTelegram(
      [
        `[${severity.toUpperCase()}] ${context}`,
        message.slice(0, 400),
        "Se /admin/feillogg for detaljer.",
      ].join("\n"),
      context,
    );
  }
}

/**
 * Wrap en async-funksjon med automatisk error-logging.
 * Returnerer Promise<T | null> — null hvis funksjonen feilet.
 */
export async function tryLog<T>(
  context: string,
  fn: () => Promise<T>,
  meta?: Record<string, unknown>,
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    await logError({ context, error, meta });
    return null;
  }
}
