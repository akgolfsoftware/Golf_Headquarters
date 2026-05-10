"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function saveOnboardingProfile(input: {
  phone?: string | null;
  hcp?: number | null;
  playingYears?: number | null;
  ambition?: string | null;
  homeClub?: string | null;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone: input.phone ?? user.phone,
      hcp: input.hcp ?? user.hcp,
      playingYears: input.playingYears ?? user.playingYears,
      ambition: input.ambition ?? user.ambition,
      homeClub: input.homeClub ?? user.homeClub,
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
