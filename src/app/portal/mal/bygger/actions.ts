"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export type GoalBuilderState = {
  area?: string;
  currentLevel?: string;
  dreamGoal?: string;
  timeframe?: string;
  effort?: string;
};

export type AiSuggestion = {
  area: string;
  currentLevel: string;
  dreamGoal: string;
  feedback: string;
  timeframeChips: string[];
  effortChips: string[];
};

// Stub — vil bytte til AI Gateway senere. Returnerer hardkodede forslag basert
// på input. Holder kontrakten stabil slik at UI kan kobles til ekte AI uten
// endring.
export async function aiSuggestGoal(state: GoalBuilderState): Promise<AiSuggestion> {
  // Hardkodet svar for Markus R.P. (handicap-fokus)
  await new Promise((r) => setTimeout(r, 250));
  return {
    area: state.area ?? "Handicap",
    currentLevel: state.currentLevel ?? "+3,5",
    dreamGoal: state.dreamGoal ?? "+5,0",
    feedback:
      "Realistisk innen 60 dager med 5 økter/uke. Hvis du foretrekker færre økter, anbefaler jeg 90 dagers tidsramme.",
    timeframeChips: ["30 dager", "60 dager", "90 dager", "Før Junior-NM"],
    effortChips: ["3 økter/uke", "5 økter/uke", "Coach-styrt"],
  };
}

export async function completeGoalBuilder(state: Required<GoalBuilderState>) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  await prisma.goal.create({
    data: {
      userId: user.id,
      type: "HCP_TARGET",
      title: `${state.area} ${state.currentLevel} → ${state.dreamGoal}`,
      targetValue: parseFloat(state.dreamGoal.replace(",", ".").replace("+", "")) || null,
      targetDate: null,
    },
  });

  revalidatePath("/portal/mal");
}
