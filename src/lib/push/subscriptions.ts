/**
 * Push-subscription server actions.
 *
 * Brukes av /api/push/subscribe og /api/push/unsubscribe for å lagre og
 * fjerne endpoint i Prisma. Hver bruker kan ha flere subscriptions
 * (laptop + telefon + ulike browsere).
 */
"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export type LagrePushInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};

/**
 * Lagre eller oppdater en push-subscription for innlogget bruker.
 * Idempotent — eksisterende endpoint får oppdatert keys/lastUsedAt.
 */
export async function lagrePushSubscription(input: LagrePushInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: input.endpoint },
    select: { id: true, userId: true },
  });

  if (existing) {
    // Hvis subscription er overført til en annen bruker (delt enhet),
    // oppdater eier.
    await prisma.pushSubscription.update({
      where: { endpoint: input.endpoint },
      data: {
        userId: user.id,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent ?? null,
        lastUsedAt: new Date(),
      },
    });
    return { ok: true, id: existing.id };
  }

  const created = await prisma.pushSubscription.create({
    data: {
      userId: user.id,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    },
    select: { id: true },
  });
  return { ok: true, id: created.id };
}

/**
 * Slett push-subscription. Tillatt for innlogget bruker (kun deres egne),
 * og som best-effort fra server (etter 410 Gone fra push-service).
 */
export async function slettPushSubscription(endpoint: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  await prisma.pushSubscription
    .deleteMany({
      where: { endpoint, userId: user.id },
    })
    .catch(() => undefined);

  return { ok: true };
}
