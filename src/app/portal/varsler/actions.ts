"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { markAllRead } from "@/lib/notifications";

/**
 * Marker spesifikke varsler som lest. Hvis ids er tom, markeres alle.
 */
export async function markNotificationsRead(ids?: string[]): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

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
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
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
