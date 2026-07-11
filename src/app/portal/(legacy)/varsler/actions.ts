"use server";

import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { markAllRead } from "@/lib/notifications";

/**
 * Marker spesifikke varsler som lest. Hvis ids er tom, markeres alle.
 */
export async function markNotificationsRead(ids?: string[]): Promise<void> {
  const user = await requireConsentingUser();

  if (!ids || ids.length === 0) {
    await markAllRead(user.id);
  } else {
    await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId: user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  revalidatePath("/portal/varsler");
  revalidatePath("/portal");
}

/**
 * Slett spesifikke varsler.
 */
export async function deleteNotifications(ids: string[]): Promise<void> {
  const user = await requireConsentingUser();
  if (ids.length === 0) return;

  await prisma.notification.deleteMany({
    where: {
      id: { in: ids },
      userId: user.id,
    },
  });

  revalidatePath("/portal/varsler");
  revalidatePath("/portal");
}
