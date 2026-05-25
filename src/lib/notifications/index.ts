/**
 * Sentral notifikasjons-dispatcher.
 *
 * Bruksmønster:
 * ```ts
 * await notify({
 *   userId: spiller.id,
 *   trigger: "booking-confirmed",
 *   title: "Booking bekreftet",
 *   body: "Markus R.P. · 28. mai 14:00",
 *   link: `/portal/booking/${bookingId}`,
 *   data: { bookingId },
 * });
 * ```
 *
 * Ruter til:
 * - In-app: prisma.notification.create()
 * - E-post: Resend via eksisterende send-funksjoner
 * - Push: web push via VAPID (ikke implementert ennå — silent fallback)
 *
 * Best-effort: feil i én kanal stopper ikke leveranse i en annen.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { getTrigger, type TriggerKeyValue } from "./triggers";

export type NotifyInput = {
  userId: string;
  trigger: TriggerKeyValue;
  title: string;
  body?: string;
  link?: string;
  data?: Record<string, unknown>;
  forceChannel?: ("in-app" | "email" | "push" | "sms")[];
};

export async function notify(input: NotifyInput): Promise<{ ok: boolean }> {
  const trigger = getTrigger(input.trigger);
  if (!trigger) {
    console.warn(`[notifications] Ukjent trigger: ${input.trigger}`);
    return { ok: false };
  }

  const channels = input.forceChannel ?? trigger.channels;

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    console.warn(`[notifications] Bruker finnes ikke: ${input.userId}`);
    return { ok: false };
  }

  if (channels.includes("in-app")) {
    try {
      await prisma.notification.create({
        data: {
          userId: input.userId,
          type: trigger.key,
          title: input.title,
          body: input.body,
          link: input.link,
        },
      });
    } catch (err) {
      console.error("[notifications] In-app create feilet:", err);
    }
  }

  if (channels.includes("email") && trigger.emailSlug && user.email) {
    try {
      await routeEmailByTrigger(trigger.key, user.email, input);
    } catch (err) {
      console.error(
        `[notifications] E-post-leveranse feilet (${trigger.key}):`,
        err,
      );
    }
  }

  if (channels.includes("push")) {
    try {
      const { sendPush } = await import("../push/send");
      await sendPush(input.userId, {
        title: input.title,
        body: input.body ?? "",
        link: input.link,
        tag: trigger.key,
      });
    } catch (err) {
      console.error(
        `[notifications] Push-leveranse feilet (${trigger.key}):`,
        err,
      );
    }
  }

  // SMS — placeholder for senere
  return { ok: true };
}

async function routeEmailByTrigger(
  triggerKey: string,
  toEmail: string,
  input: NotifyInput,
): Promise<void> {
  if (triggerKey === "booking-confirmed") {
    const { sendBookingConfirmation } = await import("@/lib/email/booking-emails");
    const bookingId = input.data?.bookingId as string | undefined;
    if (bookingId) await sendBookingConfirmation(bookingId);
    return;
  }

  if (triggerKey === "booking-reminder-24h") {
    const { sendBookingReminder } = await import("@/lib/email/booking-emails");
    const bookingId = input.data?.bookingId as string | undefined;
    if (bookingId) await sendBookingReminder(bookingId);
    return;
  }

  if (triggerKey === "booking-cancelled") {
    const { sendBookingCancellation } = await import("@/lib/email/booking-emails");
    const bookingId = input.data?.bookingId as string | undefined;
    if (bookingId) await sendBookingCancellation(bookingId);
    return;
  }

  if (triggerKey === "welcome") {
    const { sendVelkomstEpost } = await import("@/lib/email");
    await sendVelkomstEpost({
      email: toEmail,
      name: input.title.split(",")[1]?.trim() ?? undefined,
      source: "platform-notify",
    });
    return;
  }

  console.info(
    `[notifications] Trigger '${triggerKey}' har ikke dedikert e-post-sender. Hopper over e-post.`,
  );
}

export { TRIGGERS, getTrigger, triggersByCategory } from "./triggers";
export type { TriggerKey, TriggerKeyValue, TriggerCategory, Channel } from "./triggers";
