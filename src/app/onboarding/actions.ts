"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export type OnboardingState = {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  homeClub?: string;
  hcpSource?: "golfbox" | "manual";
  hcp?: string;
  yearsPlaying?: string;
  trainingFrequency?: string;
  goals?: string[];
  goalText?: string;
  coachName?: string | null;
  notifyPush?: boolean;
  notifyEmail?: boolean;
  notifyDaily?: boolean;
};

// Stub — vil persistere onboarding-state til User-modellen senere.
// Foreløpig redirecter den til portalen så flyten kan testes ende til ende.
export async function completeOnboarding(state: OnboardingState) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  // TODO: persister state til Prisma (User-modellen mangler felt for dette ennå).
  void state;
  redirect("/portal");
}
