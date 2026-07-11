"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { lesRaaPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { email, optStr } from "@/lib/validation/schemas";

// ──────────────────────────────────────────────────────────────────────────────
// Klubb-onboarding (5 steg)
// 1) Klubb-info        — navn, adresse, kontakt, logo-upload (skjelett)
// 2) Team              — invitér 1-3 første coacher (e-post)
// 3) Spiller-import    — CSV-upload (skjelett) eller "Vi importerer for dere"
// 4) Stripe-setup      — koble Stripe Connect (skjelett-link)
// 5) Integrasjoner     — Google Cal, Notion, Resend (skjelett)
//
// NB: Det finnes ingen Klubb-modell i Prisma ennå — vi persisterer all data i
// User.preferences.klubbOnboarding. TODO: opprett egen Klubb-modell senere.
// ──────────────────────────────────────────────────────────────────────────────

const KLUBB_TOTAL_STEPS = 5;

const SaveKlubbStepSchema = z.object({
  klubbNavn: optStr(200),
  klubbAdresse: optStr(240),
  klubbKontaktNavn: optStr(120),
  klubbKontaktEpost: email.optional(),
  klubbKontaktTelefon: optStr(20),
  klubbLogoUrl: optStr(600),
  coachInvites: z
    .array(
      z.object({
        navn: z.string().max(120),
        epost: z.string().email(),
      }),
    )
    .max(10)
    .optional(),
  spillerImportValg: z.enum(["CSV", "ASSISTERT", "SENERE"]).optional(),
  stripeConnected: z.boolean().optional(),
  integrations: z
    .object({
      googleCal: z.boolean().optional(),
      notion: z.boolean().optional(),
      resendDomain: z.string().max(200).optional(),
    })
    .optional(),
});

export type KlubbOnboardingData = z.infer<typeof SaveKlubbStepSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Lagre steg-data
// ──────────────────────────────────────────────────────────────────────────────

export async function saveKlubbOnboardingStep(
  data: KlubbOnboardingData,
): Promise<void> {
  const parsed = SaveKlubbStepSchema.parse(data);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesRaaPreferences(user);
  const current =
    typeof (prefs as Record<string, unknown>).klubbOnboarding === "object" &&
    (prefs as Record<string, unknown>).klubbOnboarding !== null
      ? ((prefs as Record<string, unknown>).klubbOnboarding as Record<
          string,
          unknown
        >)
      : { stepCompleted: 0 };

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    klubbOnboarding: {
      ...current,
      ...parsed,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  // TODO: persister klubb-info når Klubb-modellen finnes i Prisma.

  revalidatePath("/admin");
}

// ──────────────────────────────────────────────────────────────────────────────
// Marker steg ferdig
// ──────────────────────────────────────────────────────────────────────────────

export async function markKlubbStepComplete(stepNumber: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesRaaPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).klubbOnboarding === "object" &&
    (prefs as Record<string, unknown>).klubbOnboarding !== null
      ? ((prefs as Record<string, unknown>).klubbOnboarding as Record<
          string,
          unknown
        >)
      : {};

  const currentCompleted =
    typeof existing.stepCompleted === "number" ? existing.stepCompleted : 0;

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    klubbOnboarding: {
      ...existing,
      stepCompleted: Math.max(currentCompleted, stepNumber),
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/admin");
}

// ──────────────────────────────────────────────────────────────────────────────
// Fullfør klubb-onboarding → redirect til /admin
// ──────────────────────────────────────────────────────────────────────────────

export async function completeKlubbOnboarding(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesRaaPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).klubbOnboarding === "object" &&
    (prefs as Record<string, unknown>).klubbOnboarding !== null
      ? ((prefs as Record<string, unknown>).klubbOnboarding as Record<
          string,
          unknown
        >)
      : {};

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    klubbOnboarding: {
      ...existing,
      completedAt: new Date().toISOString(),
      stepCompleted: KLUBB_TOTAL_STEPS,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/admin");
  redirect("/admin");
}
