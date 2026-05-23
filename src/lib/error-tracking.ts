/**
 * Error-tracking lib — L1 Observability fra master-plan.
 *
 * Logger feil til:
 *  1. console.error (Vercel Logs fanger automatisk)
 *  2. ErrorLog-tabell i Prisma (for historikk + UI-visning)
 *  3. Slack-webhook ved fatal/critical (via slack-alert.ts)
 *
 * Brukes overalt der vi har try/catch på kritiske paths.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type ErrorSeverity = "fatal" | "error" | "warn" | "info";

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
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // 1. Strukturert console-log (Vercel Logs henter dette)
  console.error(
    JSON.stringify({
      level: severity,
      context,
      message,
      stack,
      meta,
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
        meta: meta ? (JSON.parse(JSON.stringify(meta)) as Prisma.InputJsonValue) : undefined,
        severity,
      },
    });
  } catch (dbError) {
    // Hvis ErrorLog selv feiler: kun console-log
    console.error("ErrorLog write failed:", dbError);
  }

  // 3. Slack-alert ved fatal/error
  if (severity === "fatal" || severity === "error") {
    try {
      const { sendSlackAlert } = await import("./slack-alert");
      await sendSlackAlert({
        title: `[${severity.toUpperCase()}] ${context}`,
        message,
        meta,
      });
    } catch {
      // Slack-fail skal ikke krasje hele flyten
    }
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
