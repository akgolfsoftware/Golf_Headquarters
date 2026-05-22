/**
 * Webhook retry-kø
 *
 * Når en webhook-handler kaster en intern feil (DB-write, Resend, etc.) ønsker
 * vi ikke å returnere 500 til avsenderen — Stripe vil da retry-e webhooken og
 * vi får doble side-effekter (dobbel e-post, dobbel kalender-push).
 *
 * I stedet logger vi feilen til `webhook_failures`-tabellen og returnerer 200.
 * En cron-job eller manuell prosess kan senere reprosessere PENDING-rader.
 */

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type WebhookSource = "stripe" | "google-cal" | "resend" | (string & {});

export type RecordFailureInput = {
  source: WebhookSource;
  eventId: string;
  payload: unknown;
  error: unknown;
};

/**
 * Persister webhook-feil. Bruker upsert på eventId slik at gjentatte retries
 * fra samme event øker attemptCount i stedet for å feile på unique-constraint.
 */
export async function recordWebhookFailure(
  input: RecordFailureInput,
): Promise<void> {
  const errorMessage =
    input.error instanceof Error
      ? input.error.message
      : typeof input.error === "string"
        ? input.error
        : "Unknown error";

  try {
    await prisma.webhookFailure.upsert({
      where: { eventId: input.eventId },
      create: {
        webhookSource: input.source,
        eventId: input.eventId,
        payload: input.payload as Prisma.InputJsonValue,
        errorMessage,
        status: "PENDING",
        attemptCount: 1,
      },
      update: {
        errorMessage,
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date(),
        status: "PENDING",
      },
    });
  } catch (err) {
    // Hvis selv logging av feilen feiler er det lite vi kan gjøre — vi vil ikke
    // kaste videre, fordi det vil bli en 500 til Stripe og dermed retry-loop.
    console.error("[webhook-retry] kunne ikke lagre webhook-feil", err);
  }
}

/**
 * Marker en webhook-failure som RESOLVED når reprosessering lykkes.
 */
export async function markWebhookResolved(eventId: string): Promise<void> {
  await prisma.webhookFailure.update({
    where: { eventId },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  });
}

/**
 * Marker en webhook-failure som DEAD når vi gir opp (f.eks. > 5 forsøk).
 */
export async function markWebhookDead(eventId: string): Promise<void> {
  await prisma.webhookFailure.update({
    where: { eventId },
    data: { status: "DEAD" },
  });
}

/**
 * Hent PENDING webhook-failures klare for retry. Brukes av cron/admin-UI.
 */
export async function listPendingWebhookFailures(limit = 50) {
  return prisma.webhookFailure.findMany({
    where: { status: "PENDING" },
    orderBy: { lastAttemptAt: "asc" },
    take: limit,
  });
}
