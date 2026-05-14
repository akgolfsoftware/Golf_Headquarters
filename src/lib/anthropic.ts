// Anthropic-klient for AI-coach. Bygger system-prompt fra brukerens
// HCP, ambisjon, siste runder og aktiv plan.

import Anthropic from "@anthropic-ai/sdk";
import type { User, Round, TrainingPlan, CourseDefinition } from "@/generated/prisma/client";
import { bygCoachSystemPrompt } from "@/lib/ai-plan/coach-prompt";

let _klient: Anthropic | null = null;

export function anthropicKlient(): Anthropic {
  if (_klient) return _klient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY mangler i miljø.");
  }
  _klient = new Anthropic({ apiKey });
  return _klient;
}

export const COACH_MODEL = "claude-sonnet-4-6";

type RoundMedBane = Round & { course: CourseDefinition };

export type AiCoachKontext = {
  user: User;
  aktivePlaner: TrainingPlan[];
  sisteRunder: RoundMedBane[];
};

export function bygSystemPrompt(ctx: AiCoachKontext): string {
  const { user, aktivePlaner, sisteRunder } = ctx;
  return bygCoachSystemPrompt({
    mottaker: "spiller",
    spillerNavn: user.name,
    hcp: user.hcp,
    ambition: user.ambition,
    homeClub: user.homeClub,
    tier: user.tier,
    playingYears: user.playingYears,
    aktivePlaner: aktivePlaner.map((p) => ({
      navn: p.name,
      meta: `(siden ${p.startDate.toISOString().split("T")[0]})`,
    })),
    sisteRunder: sisteRunder.map((r) => ({
      dato: r.playedAt.toISOString().split("T")[0],
      bane: r.course.name,
      score: r.score,
      sgTotal: r.sgTotal,
    })),
  });
}

export type ChatMelding = {
  role: "user" | "assistant";
  content: string;
};
