/**
 * Send Web Push-varsling til en bruker.
 *
 * STATUS: `web-push`-pakken er IKKE installert ennå. Skjelettet under er
 * klart, men selve sendingen er en TODO inntil pakken er godkjent for
 * install:
 *
 *   npm install web-push
 *   npm install -D @types/web-push
 *
 * Når pakken er installert: fjern stub-blokken og fjern kommentaren rundt
 * den ekte webpush-implementasjonen lengre nede.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { getServerVapidConfig } from "./vapid";

export type PushPayload = {
  title: string;
  body: string;
  link?: string;
  tag?: string;
  requireInteraction?: boolean;
};

/**
 * Send push til alle subscriptions registrert for `userId`.
 * Best-effort: feil per endpoint logges men kaster ikke.
 * Subscriptions som returnerer 404/410 slettes automatisk.
 */
export async function sendPush(
  userId: string,
  payload: PushPayload,
): Promise<{ ok: boolean; sent: number; failed: number }> {
  const vapid = getServerVapidConfig();
  if (!vapid) {
    console.warn(
      "[push] VAPID-keys mangler — push deaktivert. Legg inn NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY i .env.",
    );
    return { ok: false, sent: 0, failed: 0 };
  }

  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  });
  if (subs.length === 0) {
    return { ok: true, sent: 0, failed: 0 };
  }

  // TODO: aktivér når web-push-pakken er godkjent for install
  // ------------------------------------------------------------
  // import webpush from "web-push";
  // webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  //
  // const json = JSON.stringify(payload);
  // let sent = 0;
  // let failed = 0;
  // const slettEndpoints: string[] = [];
  //
  // await Promise.all(
  //   subs.map(async (sub) => {
  //     try {
  //       await webpush.sendNotification(
  //         {
  //           endpoint: sub.endpoint,
  //           keys: { p256dh: sub.p256dh, auth: sub.auth },
  //         },
  //         json,
  //       );
  //       sent++;
  //     } catch (err) {
  //       failed++;
  //       const statusCode = (err as { statusCode?: number }).statusCode;
  //       if (statusCode === 404 || statusCode === 410) {
  //         slettEndpoints.push(sub.endpoint);
  //       } else {
  //         console.warn("[push] Sendingen feilet:", err);
  //       }
  //     }
  //   }),
  // );
  //
  // // Marker oppdaterte endpoints med ny lastUsedAt
  // await prisma.pushSubscription
  //   .updateMany({
  //     where: { userId, endpoint: { notIn: slettEndpoints } },
  //     data: { lastUsedAt: new Date() },
  //   })
  //   .catch(() => undefined);
  //
  // if (slettEndpoints.length > 0) {
  //   await prisma.pushSubscription
  //     .deleteMany({ where: { endpoint: { in: slettEndpoints } } })
  //     .catch(() => undefined);
  // }
  //
  // return { ok: failed === 0, sent, failed };
  // ------------------------------------------------------------

  // Stub — fjern når pakken er installert.
  void payload;
  console.info(
    `[push] STUB — ville sendt push til ${subs.length} subscription(s). Installer "web-push" for å aktivere.`,
  );
  return { ok: false, sent: 0, failed: subs.length };
}
