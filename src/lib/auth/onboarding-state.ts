/**
 * Onboarding state-machine (P7 fra master-plan).
 *
 * Spiller-onboarding har 5 steg (redusert fra 7 2026-07-16 — GolfBox- og
 * TrackMan-auto-connect-stegene fjernet, se onboarding-wizard.tsx). State
 * lagres i User.preferences.onboarding. Forelder-onboarding har 4 steg.
 *
 * Bruker kan resume fra siste fullførte steg + 1 hvis de mister tilkobling.
 * Auto-complete hvis siste steg er fullført.
 *
 * NB: `stepCompleted`-tall lagret FØR 2026-07-16 (dvs. 4/5/6 under den gamle
 * 7-stegs nummereringen) resolver IKKE semantisk korrekt mot den nye
 * 5-stegs rekkefølgen — de tallene pekte på GolfBox/TrackMan/gammelt
 * Coach-steg, som ikke lenger finnes i samme rekkefølge. Ikke en reell fare
 * ved denne endringen (0 spillere har noensinne logget inn per
 * docs/STATUS-NÅ.md 2026-07-14 — ingen ekte delvis-fullført onboarding å
 * migrere), men clampes uansett defensivt under for å aldri returnere et
 * steg-tall utenfor gyldig rekkevidde.
 */

import { lesRaaPreferences } from "@/lib/preferences";
import type { Prisma } from "@/generated/prisma/client";

export const SPILLER_TOTAL_STEPS = 5;
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
  const prefs = lesRaaPreferences({ preferences: user.preferences ?? null });
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
  const totalSteps = user.role === "PARENT" ? FORELDER_TOTAL_STEPS : SPILLER_TOTAL_STEPS;
  if (state.isComplete) {
    return totalSteps;
  }
  // Klemmer til gyldig rekkevidde — se NB-notatet over om gamle 7-stegs
  // stepCompleted-verdier.
  return Math.min(totalSteps, Math.max(1, state.stepCompleted + 1));
}
