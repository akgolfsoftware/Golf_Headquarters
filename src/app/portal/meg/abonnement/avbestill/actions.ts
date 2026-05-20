"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function cancelPro(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  // Marker subscription som cancelAtPeriodEnd. Sluttbruker beholder Pro til periodEnd.
  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (sub) {
    // Marker som CANCELED — beholder currentPeriodEnd så bruker ser dato.
    // Faktisk kansellering mot Stripe håndteres av webhook senere.
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "CANCELLED",
      },
    });
  }

  await audit({
    actorId: user.id,
    action: "pro.cancelled",
    target: user.id,
    metadata: { subscriptionId: sub?.id ?? null },
  });

  revalidatePath("/portal/meg/abonnement");
  redirect("/portal/meg/abonnement?cancelled=1");
}
