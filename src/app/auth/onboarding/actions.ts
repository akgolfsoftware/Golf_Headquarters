"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";

// ──────────────────────────────────────────────────────────────────────────────
// Typer
// ──────────────────────────────────────────────────────────────────────────────

export type SpillerOnboardingData = {
  // Steg 1 — Velkommen (ingen data)
  // Steg 2 — Om deg
  name?: string;
  phone?: string;
  // Steg 3 — Golf-erfaring
  hcp?: number;
  homeClub?: string;
  playingYears?: number;
  sessionFrequency?: number;
  playTournaments?: string;
  seasonGoals?: string[];
  // Steg 5 — Coach + abonnement
  selectedCoach?: string;
  selectedTier?: string;
  // Steg 6 — Avtaler
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
};

export type ForelderOnboardingData = {
  // Steg 2 — Om barnet
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentRelation?: string;
  // Steg 3 — Vilkår
  acceptedTermsParent?: boolean;
  acceptedPrivacyParent?: boolean;
  acceptedPaymentParent?: boolean;
  // Steg 4 — Betaling
  paymentMethod?: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// Lagre spiller-onboarding steg
// ──────────────────────────────────────────────────────────────────────────────

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

export async function saveSpillerOnboardingStep(
  data: SpillerOnboardingData
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const currentOnboarding =
    typeof (prefs as Record<string, unknown>).onboarding === "object" &&
    (prefs as Record<string, unknown>).onboarding !== null
      ? ((prefs as Record<string, unknown>).onboarding as Record<
          string,
          unknown
        >)
      : { stepCompleted: 0 };

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    onboarding: {
      ...currentOnboarding,
      ...data,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone: data.phone ?? user.phone,
      hcp: data.hcp ?? user.hcp,
      homeClub: data.homeClub ?? user.homeClub,
      playingYears: data.playingYears ?? user.playingYears,
      preferences: updatedPrefs,
    },
  });

  revalidatePath("/portal");
}

// ──────────────────────────────────────────────────────────────────────────────
// Marker steg ferdig og lagre steg-nummer
// ──────────────────────────────────────────────────────────────────────────────

export async function markStepComplete(stepNumber: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).onboarding === "object" &&
    (prefs as Record<string, unknown>).onboarding !== null
      ? ((prefs as Record<string, unknown>).onboarding as Record<
          string,
          unknown
        >)
      : {};

  const currentCompleted =
    typeof existing.stepCompleted === "number" ? existing.stepCompleted : 0;

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    onboarding: {
      ...existing,
      stepCompleted: Math.max(currentCompleted, stepNumber),
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/portal");
}

// ──────────────────────────────────────────────────────────────────────────────
// Fullfør onboarding
// ──────────────────────────────────────────────────────────────────────────────

export async function completeOnboarding(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).onboarding === "object" &&
    (prefs as Record<string, unknown>).onboarding !== null
      ? ((prefs as Record<string, unknown>).onboarding as Record<
          string,
          unknown
        >)
      : {};

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    onboarding: {
      ...existing,
      completedAt: new Date().toISOString(),
      stepCompleted: 7,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/portal");
  redirect("/portal");
}

// ──────────────────────────────────────────────────────────────────────────────
// Forelder-onboarding
// ──────────────────────────────────────────────────────────────────────────────

export async function saveForelderOnboardingStep(
  data: ForelderOnboardingData
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).forelderOnboarding === "object" &&
    (prefs as Record<string, unknown>).forelderOnboarding !== null
      ? ((prefs as Record<string, unknown>).forelderOnboarding as Record<
          string,
          unknown
        >)
      : {};

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    forelderOnboarding: {
      ...existing,
      ...data,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/portal");
}

export async function completeForelderOnboarding(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).forelderOnboarding === "object" &&
    (prefs as Record<string, unknown>).forelderOnboarding !== null
      ? ((prefs as Record<string, unknown>).forelderOnboarding as Record<
          string,
          unknown
        >)
      : {};

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    forelderOnboarding: {
      ...existing,
      completedAt: new Date().toISOString(),
      stepCompleted: 4,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/portal");
  redirect("/portal");
}
