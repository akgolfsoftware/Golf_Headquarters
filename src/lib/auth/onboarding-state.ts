/**
 * Onboarding state-machine (P7 fra master-plan).
 *
 * Spiller-onboarding har 7 steg. State lagres i User.preferences.onboarding.
 * Forelder-onboarding har 4 steg.
 *
 * Bruker kan resume fra siste fullførte steg + 1 hvis de mister tilkobling.
 * Auto-complete hvis siste steg er fullført.
 */

import { lesPreferences } from "@/lib/preferences";
import type { Prisma } from "@/generated/prisma/client";

export const SPILLER_TOTAL_STEPS = 7;
export const FORELDER_TOTAL_STEPS = 4;

export type OnboardingStepState = {
  stepCompleted: number;
  isComplete: boolean;
};

/**
 * Returnerer siste fullførte steg + om onboarding er ferdig.
 */
export function getOnboardingState(
  user: { preferences?: Prisma.JsonValue | null; role: string },
): OnboardingStepState {
  const prefs = lesPreferences({ preferences: user.preferences ?? null });
  const onboarding =
    typeof (prefs as Record<string, unknown>).onboarding === "object" &&
    (prefs as Record<string, unknown>).onboarding !== null
      ? ((prefs as Record<string, unknown>).onboarding as Record<string, unknown>)
      : {};

  const stepCompleted =
    typeof onboarding.stepCompleted === "number" ? onboarding.stepCompleted : 0;
  const totalSteps =
    user.role === "PARENT" ? FORELDER_TOTAL_STEPS : SPILLER_TOTAL_STEPS;
  const isComplete = stepCompleted >= totalSteps;

  return { stepCompleted, isComplete };
}

/**
 * Returnerer hvilket steg brukeren skal starte på (siste fullførte + 1).
 * Hvis ingen progresjon: returnerer 1.
 * Hvis ferdig: returnerer totalSteps (siste).
 */
export function getResumeStep(user: {
  preferences?: Prisma.JsonValue | null;
  role: string;
}): number {
  const state = getOnboardingState(user);
  if (state.isComplete) {
    return user.role === "PARENT" ? FORELDER_TOTAL_STEPS : SPILLER_TOTAL_STEPS;
  }
  return Math.max(1, state.stepCompleted + 1);
}
