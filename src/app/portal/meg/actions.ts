"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { lesPreferences, type UserPreferences } from "@/lib/preferences";

export async function oppdaterProfil(input: {
  name?: string;
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
      name: input.name?.trim() || user.name,
      phone: input.phone === "" ? null : input.phone ?? user.phone,
      hcp: input.hcp ?? user.hcp,
      playingYears: input.playingYears ?? user.playingYears,
      ambition: input.ambition === "" ? null : input.ambition ?? user.ambition,
      homeClub: input.homeClub === "" ? null : input.homeClub ?? user.homeClub,
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/meg");
}

export async function oppdaterPreferences(input: Partial<UserPreferences>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const eksisterende = lesPreferences(user);
  const oppdatert: UserPreferences = {
    notif: { ...eksisterende.notif, ...(input.notif ?? {}) },
    spraak: input.spraak ?? eksisterende.spraak,
    sgHubMode: input.sgHubMode ?? eksisterende.sgHubMode,
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: oppdatert },
  });

  revalidatePath("/portal/meg/innstillinger");
}
