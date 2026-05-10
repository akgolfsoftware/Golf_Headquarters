"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

// HCP og spilleår lagres ikke i schema enda — utvides i Fase 1.4.
// Foreløpig persisterer vi kun phone (eneste felt på User i dag).
export async function saveOnboardingProfile(input: {
  phone?: string;
  // TODO Fase 1.4: hcp, playerYears, ambition
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone: input.phone ?? user.phone,
    },
  });

  revalidatePath("/portal");
}

export async function completeOnboarding() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  revalidatePath("/portal");
  redirect("/portal");
}
