"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function cancelPro(): Promise<void> {
  const user = await requireConsentingUser();

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
  // ?avbestilt=1 — egen banner for avbestilt abonnement.
  // (?cancelled=1 er reservert for avbrutt Stripe Checkout.)
  redirect("/portal/meg/abonnement?avbestilt=1");
}
