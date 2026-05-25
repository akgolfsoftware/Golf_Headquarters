"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { phone, optStr } from "@/lib/validation/schemas";

// ──────────────────────────────────────────────────────────────────────────────
// Coach-onboarding (4 steg)
// 1) Aksept invitasjon — bekreft navn + e-post
// 2) Personalia      — telefon, adresse, fødselsdato
// 3) Kompetanse      — sertifiseringer + spesialiteter
// 4) Kalender-sync   — skjelett-link for Google Calendar
// ──────────────────────────────────────────────────────────────────────────────

const SaveCoachStepSchema = z.object({
  name: optStr(120),
  phone: phone.nullable().optional(),
  address: optStr(240),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig datoformat — bruk ÅÅÅÅ-MM-DD")
    .optional(),
  certifications: z.array(z.string().max(80)).max(20).optional(),
  specialties: z.array(z.string().max(80)).max(20).optional(),
  bio: optStr(2000),
  googleCalendarConnected: z.boolean().optional(),
});

export type CoachOnboardingData = z.infer<typeof SaveCoachStepSchema>;

const COACH_TOTAL_STEPS = 4;

// ──────────────────────────────────────────────────────────────────────────────
// Lagre steg-data
// ──────────────────────────────────────────────────────────────────────────────

export async function saveCoachOnboardingStep(
  data: CoachOnboardingData,
): Promise<void> {
  const parsed = SaveCoachStepSchema.parse(data);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const current =
    typeof (prefs as Record<string, unknown>).coachOnboarding === "object" &&
    (prefs as Record<string, unknown>).coachOnboarding !== null
      ? ((prefs as Record<string, unknown>).coachOnboarding as Record<
          string,
          unknown
        >)
      : { stepCompleted: 0 };

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    coachOnboarding: {
      ...current,
      ...parsed,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.name?.trim() ? parsed.name.trim() : user.name,
      phone: parsed.phone ?? user.phone,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : user.dateOfBirth,
      preferences: updatedPrefs,
    },
  });

  revalidatePath("/admin");
}

// ──────────────────────────────────────────────────────────────────────────────
// Marker steg ferdig
// ──────────────────────────────────────────────────────────────────────────────

export async function markCoachStepComplete(stepNumber: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).coachOnboarding === "object" &&
    (prefs as Record<string, unknown>).coachOnboarding !== null
      ? ((prefs as Record<string, unknown>).coachOnboarding as Record<
          string,
          unknown
        >)
      : {};

  const currentCompleted =
    typeof existing.stepCompleted === "number" ? existing.stepCompleted : 0;

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    coachOnboarding: {
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
// Fullfør coach-onboarding → redirect til /admin
// ──────────────────────────────────────────────────────────────────────────────

export async function completeCoachOnboarding(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).coachOnboarding === "object" &&
    (prefs as Record<string, unknown>).coachOnboarding !== null
      ? ((prefs as Record<string, unknown>).coachOnboarding as Record<
          string,
          unknown
        >)
      : {};

  const updatedPrefs = {
    ...(prefs as Record<string, unknown>),
    coachOnboarding: {
      ...existing,
      completedAt: new Date().toISOString(),
      stepCompleted: COACH_TOTAL_STEPS,
    },
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: updatedPrefs },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

// ──────────────────────────────────────────────────────────────────────────────
// Hjelper for å sjekke om coach allerede er ferdig med onboarding
// (kalles fra page.tsx)
// ──────────────────────────────────────────────────────────────────────────────

export async function isCoachOnboardingComplete(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const prefs = lesPreferences(user);
  const existing =
    typeof (prefs as Record<string, unknown>).coachOnboarding === "object" &&
    (prefs as Record<string, unknown>).coachOnboarding !== null
      ? ((prefs as Record<string, unknown>).coachOnboarding as Record<
          string,
          unknown
        >)
      : {};

  const stepCompleted =
    typeof existing.stepCompleted === "number" ? existing.stepCompleted : 0;
  return stepCompleted >= COACH_TOTAL_STEPS;
}
