"use server";

/**
 * Server actions for /portal/meg — PlayerHQ "Meg"-profil.
 *
 * Hent, oppdater og logg ut. Bruker requireConsentingUser + Prisma. Ingen schema-endringer.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { lesPreferences, lesRaaPreferences, type UserPreferences } from "@/lib/preferences";
import type { ProfileData } from "@/components/portal/profile/ProfileShell";

export async function hentProfil(): Promise<ProfileData> {
  const user = await requireConsentingUser();

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
  const user = await requireConsentingUser();

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
  const user = await requireConsentingUser();

  const eksisterende = lesPreferences(user);
  const oppdatertKjente: UserPreferences = {
    notif: { ...eksisterende.notif, ...(input.notif ?? {}) },
    spraak: input.spraak ?? eksisterende.spraak,
    sgHubMode: input.sgHubMode ?? eksisterende.sgHubMode,
    enhet: input.enhet ?? eksisterende.enhet,
    venneOktSynlig: input.venneOktSynlig ?? eksisterende.venneOktSynlig,
    wbMode: input.wbMode ?? eksisterende.wbMode,
  };
  // Rå-merge bevarer ukjente nøkler (onboarding, trening) — kun de kjente
  // feltene over skal faktisk endres av denne handlingen.
  const oppdatert = { ...lesRaaPreferences(user), ...oppdatertKjente };

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


/** Spiller gir eget lydsamtykke (myndig SELV). Mindreårig → foresatt-flyt. */
export async function settEgetLydSamtykke(): Promise<
  { ok: true } | { ok: false; feil: string }
> {
  const { requireSpillerActionUser } = await import("@/lib/auth/action-guards");
  const { isMinor } = await import("@/lib/auth/minor");
  const { LYD_SAMTYKKE_ORDLYD } = await import("@/lib/recording/lyd-samtykke-ordlyd");
  const { audit } = await import("@/lib/audit");

  const user = await requireSpillerActionUser();
  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { dateOfBirth: true },
  });
  if (isMinor(full?.dateOfBirth)) {
    return {
      ok: false,
      feil: "Du er under 16 år. Foresatt må gi lydsamtykke via lenke fra treneren.",
    };
  }

  const now = new Date();
  await prisma.lydSamtykke.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      status: "GITT",
      gittAv: "SELV",
      foresattEpost: null,
      gittAt: now,
      trukketAt: null,
      ordlyd: LYD_SAMTYKKE_ORDLYD,
      token: null,
      tokenHash: null,
      tokenExpiresAt: null,
    },
    update: {
      status: "GITT",
      gittAv: "SELV",
      foresattEpost: null,
      gittAt: now,
      trukketAt: null,
      ordlyd: LYD_SAMTYKKE_ORDLYD,
      token: null,
      tokenHash: null,
      tokenExpiresAt: null,
    },
  });

  await audit({
    action: "lyd_samtykke.gitt_selv",
    actorId: user.id,
    target: `User:${user.id}`,
  });

  revalidatePath("/portal/meg");
  revalidatePath("/portal/meg/innstillinger/personvern");
  return { ok: true };
}
