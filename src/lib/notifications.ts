/**
 * In-app varslings-helper. Brukes fra server actions og webhook-handlers
 * for å opprette Notification-rader.
 *
 * Kategorier (Notification.type) — påvirker ikon/farge i Bell-dropdown:
 * - booking       — bookings opprettet/bekreftet/avlyst
 * - plan          — treningsplan oppdatert/godkjent
 * - achievement   — milepæl oppnådd
 * - melding       — coach sendte melding
 * - system        — generell systemmelding
 */
import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "booking"
  | "plan"
  | "achievement"
  | "melding"
  | "system";

export type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
};

/**
 * Opprett en notification. Best-effort — feiler stille.
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      },
    });
  } catch (err) {
    console.error("[notifications] notify failed", err);
  }
}

/**
 * Notify flere brukere samtidig (samme melding).
 */
export async function notifyMany(
  userIds: string[],
  input: Omit<NotifyInput, "userId">,
): Promise<void> {
  if (userIds.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      })),
    });
  } catch (err) {
    console.error("[notifications] notifyMany failed", err);
  }
}

/**
 * Marker alle som lest for en bruker.
 */
export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

/**
 * Marker én som lest.
 */
export async function markRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
}
