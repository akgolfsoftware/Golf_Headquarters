"use server";

/**
 * Server actions for /portal/meg — PlayerHQ "Meg"-profil.
 *
 * Hent, oppdater og logg ut. Bruker getCurrentUser + Prisma. Ingen schema-endringer.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { lesPreferences, type UserPreferences } from "@/lib/preferences";
import type { ProfileData } from "@/components/portal/profile/ProfileShell";

export async function hentProfil(): Promise<ProfileData> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [achievements] = await Promise.all([
    prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
      select: { id: true, kind: true, earnedAt: true, payload: true },
    }),
  ]);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      hcp: user.hcp,
      homeClub: user.homeClub,
      dateOfBirth: user.dateOfBirth,
    },
    preferences: lesPreferences(user),
    authProvider: authUser?.app_metadata?.provider ?? "email",
    achievements,
  };
}

export async function oppdaterProfil(input: {
  name?: string;
  phone?: string | null;
  hcp?: number | null;
  playingYears?: number | null;
  ambition?: string | null;
  homeClub?: string | null;
  school?: string | null;
  prevSeasonAvgScore?: number | null;
  dateOfBirth?: Date | null;
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
      school: input.school === "" ? null : input.school ?? user.school,
      prevSeasonAvgScore: input.prevSeasonAvgScore ?? user.prevSeasonAvgScore,
      dateOfBirth: input.dateOfBirth ?? user.dateOfBirth,
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
    enhet: input.enhet ?? eksisterende.enhet,
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: oppdatert },
  });

  revalidatePath("/portal/meg");
  revalidatePath("/portal/meg/innstillinger");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/auth/login");
}
